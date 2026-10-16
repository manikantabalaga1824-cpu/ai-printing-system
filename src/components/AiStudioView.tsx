import React, { useState, useEffect } from 'react';
import { downloadBlob, safeSlug } from '../utils/storage';

interface AiStudioViewProps {
  onAddToDesign: (imageDataUrl: string, prompt: string, mimeType: string) => void;
  onToast: (msg: string, isError?: boolean) => void;
}

export const AiStudioView: React.FC<AiStudioViewProps> = ({ onAddToDesign, onToast }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [statusText, setStatusText] = useState('Checking configuration…');
  const [statePill, setStatePill] = useState('Not configured');
  const [isBusy, setIsBusy] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<{
    src: string;
    blob: Blob;
    mimeType: string;
    prompt: string;
  } | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    checkEndpoint();
  }, []);

  const checkEndpoint = async () => {
    try {
      const res = await fetch('/api/generate-image', {
        method: 'OPTIONS',
        headers: { Accept: 'application/json' },
      });
      if (res.ok || res.status === 405 || res.status === 204) {
        setStatusText('A serverless route exists. Run a real request to verify model access.');
        setStatePill('Endpoint detected');
        return;
      }
      throw new Error('Not detected');
    } catch (_e) {
      setStatusText('Not configured in this environment. Set GEMINI_API_KEY in server environment variables.');
      setStatePill('Not configured');
    }
  };

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      onToast('Enter an image description first.', true);
      return;
    }
    if (trimmed.length > 2000) {
      onToast('The prompt must be 2000 characters or shorter.', true);
      return;
    }

    setIsBusy(true);
    setErrorText(null);
    setStatusText('Requesting a real image from the configured serverless endpoint…');
    setStatePill('Generating');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ prompt: trimmed, aspectRatio }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || `Image endpoint returned HTTP ${response.status}.`);
      }

      if (
        typeof data.imageDataUrl !== 'string' ||
        !/^data:image\/(png|jpeg|webp);base64,/.test(data.imageDataUrl)
      ) {
        throw new Error('The server did not return a valid image data URL.');
      }

      const blobRes = await fetch(data.imageDataUrl);
      const blob = await blobRes.blob();

      if (!['image/png', 'image/jpeg', 'image/webp'].includes(blob.type) || blob.size > 15 * 1024 * 1024) {
        throw new Error('Returned image type or size is not supported.');
      }

      setGeneratedImage({
        src: data.imageDataUrl,
        blob,
        mimeType: blob.type,
        prompt: trimmed,
      });

      setStatusText('Image returned by the configured server endpoint.');
      setStatePill('Generated');
      onToast('Image generation completed.');
    } catch (err: any) {
      console.error('Gemini image request failed:', err);
      const msg = err?.message || 'Image generation failed.';
      setErrorText(msg);
      setStatusText(msg);
      setStatePill('Request failed');
      onToast(msg, true);
    } finally {
      setIsBusy(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const ext = generatedImage.mimeType === 'image/jpeg' ? 'jpg' : generatedImage.mimeType.split('/')[1] || 'png';
    downloadBlob(`aiprintos-ai-${safeSlug(generatedImage.prompt.slice(0, 20))}-${Date.now()}.${ext}`, generatedImage.blob);
  };

  const handleAddToDesignClick = () => {
    if (!generatedImage) return;
    onAddToDesign(generatedImage.src, generatedImage.prompt, generatedImage.mimeType);
  };

  return (
    <section className="view active" id="view-ai" aria-labelledby="ai-heading">
      <div className="page-title-block">
        <span className="eyebrow muted">GENERATIVE WORKFLOW</span>
        <h1 id="ai-heading">AI image studio</h1>
        <p>Generate visuals through Gemini when a supported server-side endpoint is configured. No fake results or exposed keys.</p>
      </div>

      <div className="ai-layout">
        <section className="content-panel ai-controls">
          <span className="eyebrow muted">IMAGE BRIEF</span>
          <label className="form-label" htmlFor="ai-prompt">
            Describe the image
          </label>
          <textarea
            id="ai-prompt"
            rows={5}
            maxLength={2000}
            placeholder="A minimal botanical illustration with deep teal leaves and warm paper texture…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <p className="field-hint">Be specific about subject, style, lighting, colors and composition.</p>

          <div className="ai-options">
            <label className="form-label" htmlFor="ai-aspect">
              Aspect ratio
            </label>
            <select
              id="ai-aspect"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
            >
              <option value="1:1">Square · 1:1</option>
              <option value="3:4">Portrait · 3:4</option>
              <option value="4:3">Landscape · 4:3</option>
              <option value="9:16">Story · 9:16</option>
              <option value="16:9">Wide · 16:9</option>
            </select>
          </div>

          <button
            type="button"
            className="button button-primary button-full"
            id="generate-image"
            disabled={isBusy}
            onClick={handleGenerate}
          >
            {isBusy ? 'Generating image…' : '✳ Generate image'}
          </button>

          <p className="field-hint" id="ai-status" role="status">
            {statusText}
          </p>

          <div className="notice notice-warn">
            <strong>Security note</strong>
            <p>Gemini calls must run behind a serverless function using a private environment variable. A static HTML page cannot securely hide a private API key.</p>
          </div>
        </section>

        <section className="content-panel ai-result-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow muted">OUTPUT</span>
              <h2>Generated visual</h2>
            </div>
            <span
              className={`state-pill ${
                statePill === 'Generated' || statePill === 'Endpoint detected'
                  ? 'state-active'
                  : statePill === 'Generating'
                  ? 'state-planned'
                  : ''
              }`}
              id="ai-state"
            >
              {statePill}
            </span>
          </div>

          <div id="ai-result" className="ai-result">
            {isBusy ? (
              <div className="ai-result-placeholder">
                <span style={{ animation: 'spin 1.5s linear infinite' }}>◌</span>
                <strong>Generating image…</strong>
                <p>This may take a moment. Do not close the tab.</p>
              </div>
            ) : errorText ? (
              <div className="ai-result-placeholder">
                <span style={{ background: '#ffefef', color: '#c0392b' }}>!</span>
                <strong>Image was not generated</strong>
                <p>{errorText} Check the serverless configuration and try again.</p>
                <button
                  className="button button-secondary"
                  type="button"
                  style={{ marginTop: '12px' }}
                  onClick={handleGenerate}
                >
                  Retry request
                </button>
              </div>
            ) : generatedImage ? (
              <img
                src={generatedImage.src}
                alt={`Generated visual: ${generatedImage.prompt.slice(0, 120)}`}
              />
            ) : (
              <div className="ai-result-placeholder">
                <span>✳</span>
                <strong>Your image will appear here</strong>
                <p>Connect a secure Gemini endpoint to enable real generation.</p>
              </div>
            )}
          </div>

          <div className="ai-result-actions">
            <button
              type="button"
              className="button button-secondary"
              id="ai-download"
              disabled={!generatedImage || isBusy}
              onClick={handleDownload}
            >
              Download image
            </button>
            <button
              type="button"
              className="button button-primary"
              id="ai-add-to-design"
              disabled={!generatedImage || isBusy}
              onClick={handleAddToDesignClick}
            >
              Add to design
            </button>
          </div>
        </section>
      </div>
    </section>
  );
};
