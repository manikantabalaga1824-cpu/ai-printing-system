import React, { useState, useEffect } from 'react';
import { ViewType } from '../types';

interface IntegrationsViewProps {
  onNavigate: (view: ViewType) => void;
  onTestKeyboard: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ onNavigate, onTestKeyboard }) => {
  const [geminiStatus, setGeminiStatus] = useState('Not configured');

  useEffect(() => {
    fetch('/api/generate-image', { method: 'OPTIONS' })
      .then((res) => {
        if (res.ok || res.status === 405 || res.status === 204) {
          setGeminiStatus('Endpoint detected');
        } else {
          setGeminiStatus('Not configured');
        }
      })
      .catch(() => {
        setGeminiStatus('Not configured');
      });
  }, []);

  return (
    <section className="view active" id="view-integrations" aria-labelledby="integrations-heading">
      <div className="page-title-block">
        <span className="eyebrow muted">CONNECT WHAT YOU NEED</span>
        <h1 id="integrations-heading">Integrations & setup</h1>
        <p>Integration status is explicit. API access or server-side configuration is never simulated.</p>
      </div>

      <div className="integration-grid">
        <article className="integration-card">
          <div className="integration-logo gemini-logo">✳</div>
          <div className="integration-heading">
            <div>
              <h2>Gemini image generation</h2>
              <p>Generate images from prompts.</p>
            </div>
            <span
              className={`state-pill ${geminiStatus === 'Endpoint detected' ? 'state-active' : ''}`}
              id="gemini-integration-state"
            >
              {geminiStatus}
            </span>
          </div>
          <p className="integration-detail">
            Requires a model/API that supports image output, a valid Google AI API key, and a secure serverless proxy. Configure <code>GEMINI_API_KEY</code> on the server, not in browser code.
          </p>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => onNavigate('ai')}
          >
            Open AI image studio ↗
          </button>
        </article>

        <article className="integration-card">
          <div className="integration-logo canva-logo">C</div>
          <div className="integration-heading">
            <div>
              <h2>Canva</h2>
              <p>Authorized design workflows.</p>
            </div>
            <span className="state-pill state-planned">Requires setup</span>
          </div>
          <p className="integration-detail">
            No Canva SDK or authenticated workflow is bundled. Use Canva's official developer integrations and approval requirements; don't scrape templates or imitate logged-in flows.
          </p>
          <a
            className="external-link"
            href="https://www.canva.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Canva developer documentation ↗
          </a>
        </article>

        <article className="integration-card">
          <div className="integration-logo adobe-logo">A</div>
          <div className="integration-heading">
            <div>
              <h2>Adobe Express</h2>
              <p>Embed or connect supported workflows.</p>
            </div>
            <span className="state-pill state-planned">Requires setup</span>
          </div>
          <p className="integration-detail">
            No Adobe Express integration is falsely represented as live. Add only officially supported SDK/API workflows for your account and use case.
          </p>
          <a
            className="external-link"
            href="https://developer.adobe.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Adobe developer documentation ↗
          </a>
        </article>

        <article className="integration-card">
          <div className="integration-logo type-logo">あ</div>
          <div className="integration-heading">
            <div>
              <h2>Telugu + English keyboard</h2>
              <p>Browser-based Unicode entry.</p>
            </div>
            <span className="state-pill state-active">Built in</span>
          </div>
          <p className="integration-detail">
            Includes a glass-style keyboard, Telugu Unicode layout, English layout, emoji picker and limited dictionary-based transliteration suggestions. It is not a complete language model or a system keyboard replacement.
          </p>
          <button
            type="button"
            className="button button-secondary"
            id="test-keyboard"
            onClick={onTestKeyboard}
          >
            Test virtual keyboard ↗
          </button>
        </article>
      </div>

      <section className="content-panel deploy-panel">
        <div>
          <span className="eyebrow muted">SHIP YOUR PROJECT</span>
          <h2>Deployment checklist</h2>
          <p>Static hosting works for the editor. AI calls need a compatible serverless function.</p>
        </div>
        <div className="deploy-steps">
          <div>
            <span>01</span>
            <p>
              <strong>Deploy the frontend</strong>
              <small>Import this folder into Vercel or Netlify. No build step is required.</small>
            </p>
          </div>
          <div>
            <span>02</span>
            <p>
              <strong>Add private environment variables</strong>
              <small>Set GEMINI_API_KEY in platform settings for the serverless endpoint. Never commit .env files.</small>
            </p>
          </div>
          <div>
            <span>03</span>
            <p>
              <strong>Verify provider access</strong>
              <small>Test a real generation request and inspect server logs, errors, quotas and model availability.</small>
            </p>
          </div>
        </div>
        <div className="deploy-links">
          <a
            className="button button-secondary"
            href="https://vercel.com/docs/functions"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel Functions ↗
          </a>
          <a
            className="button button-secondary"
            href="https://docs.netlify.com/build/functions/overview/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Netlify Functions ↗
          </a>
        </div>
      </section>
    </section>
  );
};
