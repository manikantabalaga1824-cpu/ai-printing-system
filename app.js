'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const uid = prefix => `${prefix}_${crypto.getRandomValues(new Uint32Array(2)).join('').slice(0, 14)}`;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const safeSlug = value => String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'design';
  const HEX = /^#[0-9a-f]{6}$/i;
  const STORAGE_PREFIX = 'aiprintos:workspace:v1:';
  const IMAGE_TYPES = new Set(['image/png','image/jpeg','image/webp']);
  const FONT_STACK = "'DM Sans',system-ui,-apple-system,'Noto Sans Telugu','Nirmala UI','Gautami',sans-serif";
  const SERIF_STACK = "Georgia,'Noto Serif Telugu','Nirmala UI',serif";
  const PRESETS = [
    {id:'business',name:'Business card',w:1050,h:600,category:'Branding'},
    {id:'a4',name:'A4 portrait',w:794,h:1123,category:'Print'},
    {id:'poster',name:'Poster',w:900,h:1200,category:'Print'},
    {id:'square',name:'Social post',w:1080,h:1080,category:'Digital'},
    {id:'story',name:'Story',w:1080,h:1920,category:'Digital'},
    {id:'invite',name:'Invitation',w:720,h:1008,category:'Events'},
    {id:'flyer',name:'Flyer',w:794,h:1123,category:'Print'},
    {id:'certificate',name:'Certificate',w:1123,h:794,category:'Events'}
  ];
  const TEMPLATE_DATA = [
    {id:'modern-card',name:'Modern studio card',category:'Branding',preset:'business',bg:'#172a32',accent:'#75e6d0',title:'MAKE IT',sub:'Studio / Print / Design',elements:[
      {type:'text',name:'Brand title',text:'MAKE IT',x:62,y:90,w:590,h:145,size:104,weight:800,font:'sans',color:'#f8f7f0',align:'left',lh:1.0},
      {type:'shape',name:'Mint bar',shape:'rect',x:66,y:272,w:185,h:10,fill:'#75e6d0',stroke:'transparent',sw:0,radius:0},
      {type:'text',name:'Description',text:'PRINT · CREATE · REPEAT',x:66,y:322,w:500,h:45,size:25,weight:600,font:'mono',color:'#c0d7d4',align:'left',lh:1.4},
      {type:'shape',name:'Accent circle',shape:'ellipse',x:820,y:-70,w:270,h:270,fill:'#ff947c',stroke:'transparent',sw:0,radius:0}
    ]},
    {id:'botanical',name:'Botanical poster',category:'Print',preset:'poster',bg:'#f1eddf',accent:'#7c9b69',title:'GROW\nSLOW.',sub:'A LITTLE EVERY DAY',elements:[
      {type:'shape',name:'Green circle',shape:'ellipse',x:390,y:85,w:420,h:420,fill:'#7c9b69',stroke:'transparent',sw:0,radius:0},
      {type:'shape',name:'Stem',shape:'rect',x:586,y:215,w:12,h:490,fill:'#2d5549',stroke:'transparent',sw:0,radius:6},
      {type:'text',name:'Poster title',text:'GROW\nSLOW.',x:63,y:570,w:760,h:300,size:116,weight:800,font:'sans',color:'#263f35',align:'left',lh:1.0},
      {type:'text',name:'Footer',text:'A LITTLE EVERY DAY  ·  Nº 04',x:66,y:1005,w:700,h:35,size:20,weight:500,font:'mono',color:'#61755d',align:'left',lh:1.4}
    ]},
    {id:'celebration',name:'Celebration invite',category:'Events',preset:'invite',bg:'#fbf4e8',accent:'#cf8b71',title:'LET’S\nCELEBRATE',sub:'SAVE THE DATE',elements:[
      {type:'shape',name:'Frame',shape:'rect',x:34,y:34,w:652,h:940,fill:'transparent',stroke:'#c68d73',sw:3,radius:0},
      {type:'text',name:'Eyebrow',text:'YOU ARE WARMLY INVITED',x:75,y:140,w:570,h:42,size:20,weight:500,font:'mono',color:'#8e6959',align:'center',lh:1.5},
      {type:'text',name:'Headline',text:'LET’S\nCELEBRATE',x:65,y:275,w:590,h:280,size:74,weight:700,font:'serif',color:'#3a5146',align:'center',lh:1.18},
      {type:'shape',name:'Accent disc',shape:'ellipse',x:287,y:622,w:146,h:146,fill:'#dfb5a2',stroke:'transparent',sw:0,radius:0},
      {type:'text',name:'Event details',text:'SATURDAY · 6 PM\nYOUR PLACE / CITY',x:100,y:805,w:520,h:75,size:23,weight:500,font:'mono',color:'#806451',align:'center',lh:1.5}
    ]},
    {id:'social-wave',name:'Social / Make waves',category:'Digital',preset:'square',bg:'#34334b',accent:'#c8b8f7',title:'MAKE\nWAVES',sub:'STAY CURIOUS',elements:[
      {type:'shape',name:'Lilac orb',shape:'ellipse',x:600,y:-110,w:520,h:520,fill:'#c8b8f7',stroke:'transparent',sw:0,radius:0},
      {type:'shape',name:'Peach orb',shape:'ellipse',x:-185,y:660,w:390,h:390,fill:'#ff957e',stroke:'transparent',sw:0,radius:0},
      {type:'text',name:'Headline',text:'MAKE\nWAVES',x:65,y:320,w:880,h:350,size:142,weight:800,font:'sans',color:'#ffffff',align:'left',lh:.95},
      {type:'text',name:'Caption',text:'STAY CURIOUS  /  KEEP MOVING',x:70,y:885,w:770,h:44,size:24,weight:500,font:'mono',color:'#e1dafa',align:'left',lh:1.4}
    ]},
    {id:'sale-flyer',name:'Print shop offer',category:'Print',preset:'flyer',bg:'#fff8ef',accent:'#ff947c',title:'A BETTER\nKIND OF PRINT.',sub:'MADE TO BE SEEN',elements:[
      {type:'shape',name:'Coral header',shape:'rect',x:0,y:0,w:794,h:265,fill:'#ff947c',stroke:'transparent',sw:0,radius:0},
      {type:'text',name:'Top label',text:'PRINT STUDIO  /  SPECIAL DROP',x:54,y:36,w:660,h:40,size:20,weight:600,font:'mono',color:'#27343b',align:'left',lh:1.4},
      {type:'text',name:'Headline',text:'A BETTER\nKIND OF PRINT.',x:54,y:95,w:680,h:160,size:62,weight:800,font:'sans',color:'#1b2a31',align:'left',lh:1.05},
      {type:'text',name:'Offer details',text:'Posters · Cards · Flyers · Invitations',x:55,y:360,w:680,h:55,size:24,weight:600,font:'sans',color:'#34434c',align:'left',lh:1.5},
      {type:'shape',name:'Mint highlight',shape:'rect',x:55,y:455,w:220,h:8,fill:'#7be7d2',stroke:'transparent',sw:0,radius:0},
      {type:'text',name:'Subheading',text:'MADE TO BE SEEN.',x:55,y:515,w:670,h:90,size:42,weight:700,font:'serif',color:'#1f3b39',align:'left',lh:1.2},
      {type:'text',name:'Footer',text:'YOUR BRAND. YOUR FORMAT. YOUR FINISH.',x:55,y:1030,w:680,h:32,size:17,weight:500,font:'mono',color:'#8a7c70',align:'left',lh:1.4}
    ]},
    {id:'telugu-greeting',name:'Telugu greeting',category:'Events',preset:'square',bg:'#fff0c5',accent:'#217a55',title:'ఉగాది\nశుభాకాంక్షలు',sub:'HAPPY UGADI',elements:[
      {type:'shape',name:'Green circle',shape:'ellipse',x:-185,y:610,w:700,h:700,fill:'#217a55',stroke:'transparent',sw:0,radius:0},
      {type:'shape',name:'Sun',shape:'ellipse',x:720,y:70,w:240,h:240,fill:'#e68b6f',stroke:'transparent',sw:0,radius:0},
      {type:'text',name:'Telugu greeting',text:'ఉగాది\nశుభాకాంక్షలు',x:75,y:250,w:900,h:340,size:92,weight:700,font:'sans',color:'#2d4a3a',align:'center',lh:1.35},
      {type:'text',name:'English sign-off',text:'HAPPY UGADI  ·  A NEW BEGINNING',x:120,y:755,w:840,h:46,size:20,weight:600,font:'mono',color:'#8b613b',align:'center',lh:1.4}
    ]},
    {id:'quiet-certificate',name:'Quiet certificate',category:'Events',preset:'certificate',bg:'#fffdf6',accent:'#ab9460',title:'Certificate\nof appreciation',sub:'PRESENTED WITH GRATITUDE',elements:[
      {type:'shape',name:'Outer border',shape:'rect',x:28,y:28,w:1067,h:738,fill:'transparent',stroke:'#ab9460',sw:3,radius:0},
      {type:'shape',name:'Inner border',shape:'rect',x:43,y:43,w:1037,h:708,fill:'transparent',stroke:'#e0d5b8',sw:2,radius:0},
      {type:'text',name:'Heading',text:'Certificate\nof appreciation',x:120,y:160,w:880,h:160,size:62,weight:600,font:'serif',color:'#344c42',align:'center',lh:1.1},
      {type:'text',name:'Recipient',text:'Presented to  /  Recipient Name',x:160,y:395,w:800,h:45,size:22,weight:500,font:'mono',color:'#947d54',align:'center',lh:1.5},
      {type:'text',name:'Reason',text:'With thanks for your time, care and contribution.',x:150,y:470,w:820,h:50,size:25,weight:400,font:'serif',color:'#5a645e',align:'center',lh:1.5}
    ]}
  ];
  const clone = value => JSON.parse(JSON.stringify(value));
  const makeElement = (type, extra = {}) => ({id:uid(type[0]),type,name:type==='text'?'Text':type==='shape'?'Shape':'Image',x:80,y:80,w:type==='text'?420:180,h:type==='text'?90:140,opacity:1,...extra});
  const state = {view:'home',doc:null,selected:null,undo:[],redo:[],dirty:false,scale:1,drag:null,inspectorTab:'properties',templateCategory:'All',templateQuery:'',keyboardOpen:false,keyboardLanguage:'en',keyboardShift:false,keyboardSymbols:false,keyboardTarget:null,keyboardCaret:0,aiImage:null,aiBusy:false};

  function toast(message, error = false) {
    const item = document.createElement('div'); item.className = `toast${error?' error':''}`; item.textContent = message;
    $('#toast-region').append(item); window.setTimeout(() => item.remove(), error ? 7000 : 3800);
  }
  function nowISO(){return new Date().toISOString();}
  function cleanColor(value, allowTransparent = false) {return HEX.test(value)|| (allowTransparent && value==='transparent');}
  function validateDocument(input) {
    if(!input || typeof input!=='object' || Array.isArray(input)) throw new Error('Project JSON must contain an object.');
    if(input.version!==1) throw new Error('Unsupported project version.');
    if(typeof input.id!=='string'||input.id.length>100) throw new Error('Invalid project ID.');
    if(typeof input.name!=='string'||input.name.length>120) throw new Error('Project name must be at most 120 characters.');
    const width=Number(input.width), height=Number(input.height);
    if(!Number.isInteger(width)||!Number.isInteger(height)||width<50||height<50||width>10000||height>10000) throw new Error('Canvas dimensions must be whole numbers from 50 to 10000.');
    if(!cleanColor(input.background)) throw new Error('Invalid background color.');
    if(!Array.isArray(input.elements)||input.elements.length>300) throw new Error('A project may contain at most 300 elements.');
    const seen=new Set();
    const elements=input.elements.map((raw,index)=>{
      if(!raw||typeof raw!=='object'||!['text','shape','image'].includes(raw.type)) throw new Error(`Invalid element at index ${index}.`);
      if(typeof raw.id!=='string'||raw.id.length>100||seen.has(raw.id)) throw new Error(`Invalid or duplicate element ID at index ${index}.`);seen.add(raw.id);
      const number=(key,min,max)=>{const n=Number(raw[key]);if(!Number.isFinite(n)||n<min||n>max)throw new Error(`Invalid ${key} for element ${index}.`);return n;};
      const element={id:raw.id,type:raw.type,name:String(raw.name||raw.type).slice(0,100),x:number('x',-100000,100000),y:number('y',-100000,100000),w:number('w',1,100000),h:number('h',1,100000),opacity:number('opacity',0,1)};
      if(raw.type==='text'){
        if(typeof raw.text!=='string'||raw.text.length>12000) throw new Error(`Invalid text content in element ${index}.`);
        if(!cleanColor(raw.color))throw new Error(`Invalid text color in element ${index}.`);
        element.text=raw.text;element.color=raw.color;element.size=number('size',1,1000);element.weight=[400,500,600,700,800].includes(raw.weight)?raw.weight:400;element.align=['left','center','right'].includes(raw.align)?raw.align:'left';element.lh=number('lh',.5,3);element.font=['sans','serif','mono'].includes(raw.font)?raw.font:'sans';
      } else if(raw.type==='shape'){
        if(!['rect','ellipse'].includes(raw.shape))throw new Error(`Invalid shape at element ${index}.`);
        if(!cleanColor(raw.fill,true)||!cleanColor(raw.stroke,true))throw new Error(`Invalid shape color at element ${index}.`);
        element.shape=raw.shape;element.fill=raw.fill;element.stroke=raw.stroke;element.sw=number('sw',0,100);element.radius=number('radius',0,1000);
      } else {
        if(typeof raw.src!=='string'||raw.src.length>8_500_000||!/^data:image\/(png|jpeg|webp);base64,/.test(raw.src))throw new Error(`Images in imported projects must be embedded PNG, JPEG or WebP files (element ${index}).`);
        element.src=raw.src;element.alt=String(raw.alt||'').slice(0,300);element.fit=['contain','cover','fill'].includes(raw.fit)?raw.fit:'contain';
      }
      return element;
    });
    return {id:input.id,version:1,name:input.name,width,height,background:input.background,elements,created:typeof input.created==='string'&&Number.isFinite(Date.parse(input.created))?input.created:nowISO(),updated:typeof input.updated==='string'&&Number.isFinite(Date.parse(input.updated))?input.updated:nowISO()};
  }
  const storage={
    all(){const list=[];try{for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&key.startsWith(STORAGE_PREFIX)){try{list.push(validateDocument(JSON.parse(localStorage.getItem(key))));}catch(e){console.warn('Skipped invalid locally stored project:',e.message);}}}}catch(e){return {ok:false,error:'Browser storage is unavailable in this context.'};}return {ok:true,docs:list.sort((a,b)=>Date.parse(b.updated)-Date.parse(a.updated))};},
    get(id){try{const raw=localStorage.getItem(STORAGE_PREFIX+id);if(!raw)return {ok:false,error:'This project was not found in this browser.'};return {ok:true,doc:validateDocument(JSON.parse(raw))};}catch(e){return {ok:false,error:'This locally saved project could not be read.'};}},
    save(doc){try{doc.updated=nowISO();localStorage.setItem(STORAGE_PREFIX+doc.id,JSON.stringify(doc));return {ok:true};}catch(e){return {ok:false,error:e&&e.name==='QuotaExceededError'?'Browser storage is full. Export JSON or remove old projects.':'The browser could not save this project.'};}},
    remove(id){try{localStorage.removeItem(STORAGE_PREFIX+id);return {ok:true};}catch(e){return {ok:false,error:'Browser storage is unavailable.'};}}
  };
  function downloadBlob(name, blob) {const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function downloadJSON(doc){downloadBlob(`${safeSlug(doc.name)}.aiprintos.json`,new Blob([JSON.stringify(doc,null,2)],{type:'application/json'}));}
  function getAllDocs(){return storage.all();}
  function allTemplates(){return TEMPLATE_DATA;}
  function templateDocument(template){const preset=PRESETS.find(item=>item.id===template.preset);return {id:uid('project'),version:1,name:template.name,width:preset.w,height:preset.h,background:template.bg,elements:template.elements.map(el=>makeElement(el.type,{...clone(el),id:uid(el.type[0])})),created:nowISO(),updated:nowISO()};}
  function blankDocument(name='Untitled design',preset=PRESETS[1]){return {id:uid('project'),version:1,name,width:preset.w,height:preset.h,background:'#ffffff',elements:[],created:nowISO(),updated:nowISO()};}
  function thumbHTML(template, extraClass='') {return `<div class="template-thumb ${extraClass}" style="background:${template.bg};--thumb-accent:${template.accent}" aria-hidden="true"><span class="thumb-label" style="color:${template.bg==='#172a32'?'#f7f6ef':template.bg==='#34334b'?'#fff':template.bg==='#fffdf6'?'#344c42':template.bg==='#fbf4e8'?'#3a5146':template.bg==='#f1eddf'?'#263f35':template.bg==='#fff0c5'?'#2d4a3a':'#27343b'}">${escapeHTML(template.title)}</span></div>`;}
  function activeTemplateList() {const query=state.templateQuery.trim().toLowerCase();return allTemplates().filter(template=>(state.templateCategory==='All'||template.category===state.templateCategory)&&(!query||`${template.name} ${template.category}`.toLowerCase().includes(query)));}
  function renderTemplateViews(){
    const home=$('#home-templates');home.innerHTML=allTemplates().slice(0,3).map(template=>`<button class="template-tile" data-use-template="${template.id}">${thumbHTML(template)}<span class="tile-name">${escapeHTML(template.name)}</span><span class="tile-meta">${escapeHTML(template.category)} · Editable</span></button>`).join('');
    const categories=['All',...new Set(allTemplates().map(item=>item.category))];
    $('#template-filters').innerHTML=categories.map(category=>`<button class="filter-chip ${state.templateCategory===category?'active':''}" data-template-category="${escapeHTML(category)}" aria-pressed="${state.templateCategory===category}">${escapeHTML(category)}</button>`).join('');
    const filtered=activeTemplateList();$('#template-grid').innerHTML=filtered.length?filtered.map(template=>`<button class="template-card" data-use-template="${template.id}">${thumbHTML(template)}<div class="template-card-footer"><strong>${escapeHTML(template.name)}</strong><span>${escapeHTML(template.category)}</span></div></button>`).join(''):'<div class="no-results"><strong>No templates found</strong>Try a different search or category.</div>';
  }
  function compactPreviewFromDoc(doc){return `<div class="template-thumb" style="background:${doc.background};aspect-ratio:1/.75" aria-hidden="true"><span class="thumb-label" style="color:${doc.elements.find(el=>el.type==='text')?.color||'#26313b'}">${escapeHTML((doc.elements.find(el=>el.type==='text')?.text||doc.name).slice(0,34))}</span></div>`;}
  function renderProjects(){const result=getAllDocs();const home=$('#home-projects'),grid=$('#project-grid');if(!result.ok){home.innerHTML=`<div class="empty-inline">${escapeHTML(result.error)}</div>`;grid.innerHTML=`<div class="no-results">${escapeHTML(result.error)}</div>`;return;}
    const docs=result.docs;home.innerHTML=docs.length?docs.slice(0,4).map(doc=>`<div class="recent-row"><div class="recent-thumb" style="background:${doc.background}">${escapeHTML((doc.elements.find(el=>el.type==='text')?.text||doc.name).slice(0,2))}</div><div class="recent-main"><strong>${escapeHTML(doc.name)}</strong><small>${doc.width} × ${doc.height}px · ${new Date(doc.updated).toLocaleDateString()}</small></div><button class="text-button" data-open-project="${doc.id}">Open ↗</button></div>`).join(''):'<div class="empty-inline">No projects saved yet. Start a design to see it here.</div>';
    grid.innerHTML=docs.length?docs.map(doc=>`<article class="project-card">${compactPreviewFromDoc(doc)}<div class="project-card-footer"><div style="min-width:0"><strong>${escapeHTML(doc.name)}</strong><div class="tile-meta">${doc.width} × ${doc.height}px</div></div><button data-download-project="${doc.id}" aria-label="Download ${escapeHTML(doc.name)} JSON" title="Download project JSON">⇩</button></div><div class="two-action-row" style="margin-top:7px"><button class="inspector-action" data-open-project="${doc.id}">Open project</button><button class="inspector-action danger" data-delete-project="${doc.id}">Delete</button></div></article>`).join(''):'<div class="no-results"><strong>No projects saved yet</strong>Create a design, then save it to this browser.</div>';
  }

  function setView(name){if(!$('#view-'+name)){name='home';}state.view=name;$$('.view').forEach(view=>view.classList.toggle('active',view.id===`view-${name}`));$$('[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===name));$('#current-crumb').textContent=({home:'Overview',editor:'Design editor',templates:'Template library',projects:'My projects',ai:'AI image studio',integrations:'Integrations & setup'})[name]||'Workspace';if(name==='editor'&&state.doc)requestAnimationFrame(fitCanvas);if(name==='templates')renderTemplateViews();if(name==='projects'||name==='home')renderProjects();window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
  function updateSavedIndicator(){const node=$('#global-save-state');node.replaceChildren(Object.assign(document.createElement('i'),{className:''}),document.createTextNode(state.dirty?' Unsaved changes':' Saved locally'));node.querySelector('i').style.background=state.dirty?'#e7a34f':'#5dc49f';}
  function markDirty(){state.dirty=true;updateSavedIndicator();}
  function snapshot(){return JSON.stringify(state.doc);}
  function pushUndo(previous){state.undo.push(previous);if(state.undo.length>80)state.undo.shift();state.redo=[];updateUndoButtons();}
  function mutate(callback, render=true){if(!state.doc)return;pushUndo(snapshot());callback();markDirty();if(render){renderCanvas();renderInspector();}updateUndoButtons();}
  function restoreSnapshot(json){state.doc=validateDocument(JSON.parse(json));$('#design-name').value=state.doc.name;if(!state.doc.elements.some(el=>el.id===state.selected))state.selected=null;state.dirty=true;renderCanvas();renderInspector();updateUndoButtons();updateSavedIndicator();}
  function undo(){if(!state.undo.length)return;state.redo.push(snapshot());restoreSnapshot(state.undo.pop());}
  function redo(){if(!state.redo.length)return;state.undo.push(snapshot());restoreSnapshot(state.redo.pop());}
  function updateUndoButtons(){$('#undo').disabled=!state.undo.length;$('#redo').disabled=!state.redo.length;}
  function saveProject(){if(!state.doc){toast('Open a design first.',true);return false;}state.doc.name=$('#design-name').value.trim().slice(0,120)||'Untitled design';$('#design-name').value=state.doc.name;const result=storage.save(state.doc);if(!result.ok){toast(result.error,true);return false;}state.dirty=false;state.undo=[];state.redo=[];updateSavedIndicator();updateUndoButtons();renderProjects();toast(`Saved “${state.doc.name}” in this browser.`);return true;}
  function openProject(doc){state.doc=validateDocument(doc);state.selected=null;state.undo=[];state.redo=[];state.dirty=false;state.inspectorTab='properties';state.keyboardOpen=false;$('#keyboard-dock').hidden=true;$('#design-name').value=state.doc.name;$('#canvas-size').textContent=`${state.doc.width} × ${state.doc.height} px`;renderCanvas();renderInspector();fitCanvas();updateUndoButtons();updateSavedIndicator();setView('editor');}
  function openSavedProject(id){const result=storage.get(id);if(!result.ok){toast(result.error,true);return;}openProject(result.doc);}
  function createBlank(name,preset){const doc=blankDocument(name,preset);openProject(doc);markDirty();toast('Blank canvas ready. Save when you want to keep it.');}
  function useTemplate(id){const item=TEMPLATE_DATA.find(template=>template.id===id);if(!item)return;openProject(templateDocument(item));markDirty();toast(`Loaded “${item.name}”. Edit the sample text before exporting.`);}
  function getElement(id=state.selected){return state.doc?.elements.find(el=>el.id===id)||null;}
  function fontFor(el){return el.font==='serif'?SERIF_STACK:el.font==='mono'?"'DM Mono',ui-monospace,monospace":FONT_STACK;}
  function renderElement(el, selected=false){const style=`left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;opacity:${el.opacity};`;
    if(el.type==='text')return `<div class="design-el${selected?' selected':''}" data-element-id="${el.id}" lang="${/[\u0C00-\u0C7F]/.test(el.text)?'te':'en'}" style="${style}font-family:${fontFor(el)};font-size:${el.size}px;font-weight:${el.weight};color:${el.color};text-align:${el.align};line-height:${el.lh};">${escapeHTML(el.text)}${selected?'<span class="resize-handle" data-resize="1" aria-label="Resize text"></span>':''}</div>`;
    if(el.type==='shape')return `<div class="design-el${selected?' selected':''}" data-element-id="${el.id}" style="${style}background:${el.fill};border:${el.sw?`${el.sw}px solid ${el.stroke}`:'0'};border-radius:${el.shape==='ellipse'?'50%':`${el.radius}px`};">${selected?'<span class="resize-handle" data-resize="1" aria-label="Resize shape"></span>':''}</div>`;
    return `<div class="design-el${selected?' selected':''}" data-element-id="${el.id}" style="${style}"><img alt="${escapeHTML(el.alt)}" src="${el.src}" style="object-fit:${el.fit}">${selected?'<span class="resize-handle" data-resize="1" aria-label="Resize image"></span>':''}</div>`;
  }
  function renderCanvas(){if(!state.doc)return;const stage=$('#canvas-stage');stage.style.width=state.doc.width+'px';stage.style.height=state.doc.height+'px';stage.style.background=state.doc.background;stage.innerHTML=state.doc.elements.map(el=>renderElement(el,el.id===state.selected)).join('');$('#canvas-size').textContent=`${state.doc.width} × ${state.doc.height} px`;$('#canvas-selection').textContent=getElement()?.name||'No selection';}
  function fitCanvas(){if(!state.doc||state.view!=='editor')return;const box=$('#canvas-stage-wrap');if(!box)return;const maxWidth=Math.max(100,box.clientWidth-35),maxHeight=Math.max(140,box.clientHeight-32);state.scale=Math.min(maxWidth/state.doc.width,maxHeight/state.doc.height,1);const stage=$('#canvas-stage');stage.style.transform=`scale(${state.scale})`;stage.style.margin=`${Math.max(0,(state.doc.height*state.scale-state.doc.height)/2)}px`;stage.style.transformOrigin='center center';stage.style.flex='none';}
  function field(label,prop,value,type='text',extra=''){return `<label class="form-field"><span>${label}</span><input type="${type}" data-property="${prop}" value="${escapeHTML(value)}" ${extra}></label>`;}
  function numberField(label,prop,value,min=-100000,max=100000,step=1){return field(label,prop,value,'number',`min="${min}" max="${max}" step="${step}"`);}
  function selectField(label,prop,value,options){return `<label class="form-field"><span>${label}</span><select data-property="${prop}">${options.map(([val,title])=>`<option value="${escapeHTML(val)}" ${String(val)===String(value)?'selected':''}>${escapeHTML(title)}</option>`).join('')}</select></label>`;}
  function colorField(label,prop,value){return `<label class="form-field"><span>${label}</span><input type="color" data-property="${prop}" value="${HEX.test(value)?value:'#ffffff'}"></label>`;}
  function layerList(){if(!state.doc.elements.length)return '<p class="inspector-note">No layers yet. Add text, a shape or an image to begin.</p>';return `<div class="layers-list">${[...state.doc.elements].reverse().map(el=>`<button class="layer-row ${el.id===state.selected?'selected':''}" data-select-element="${el.id}"><span class="layer-type">${el.type==='text'?'T':el.type==='shape'?'▱':'▧'}</span><span class="layer-title">${escapeHTML(el.name||el.type)}</span><span>${el.id===state.selected?'●':''}</span></button>`).join('')}</div>`;}
  function renderInspector(){const el=getElement();$('#layer-count').textContent=String(state.doc?.elements.length||0);$$('[data-inspector-tab]').forEach(tab=>tab.classList.toggle('active',tab.dataset.inspectorTab===state.inspectorTab));const box=$('#inspector-content');if(!state.doc){box.innerHTML='<p class="inspector-note">Start a design to reveal the canvas properties.</p>';return;}
    if(state.inspectorTab==='layers'){box.innerHTML=`<h3>Object layers</h3><p class="inspector-note">Select a layer to edit it. The list shows frontmost items first.</p>${layerList()}${el?'<button class="inspector-action danger" data-delete-element>Delete selected layer</button>':''}`;return;}
    if(!el){const presetIndex=PRESETS.findIndex(p=>p.w===state.doc.width&&p.h===state.doc.height);box.innerHTML=`<h3>Canvas settings</h3><p class="inspector-note">Choose an element to edit its style, or adjust the canvas below.</p>${selectField('Canvas preset','preset',presetIndex>=0?String(presetIndex):'custom',[['custom','Custom size'],...PRESETS.map((p,i)=>[String(i),`${p.name} (${p.w} × ${p.h})`])])}<div class="form-grid-2">${numberField('Width','canvas-width',state.doc.width,50,10000)}${numberField('Height','canvas-height',state.doc.height,50,10000)}</div>${colorField('Background','canvas-background',state.doc.background)}<button class="inspector-action" data-add="text">＋ Add text layer</button><button class="inspector-action" data-add="rect">＋ Add shape layer</button><button class="inspector-action" data-add="image">＋ Upload image</button><div class="inspector-note">Canvas sizes are CSS pixels. Print bleeds, crop marks and professional CMYK/color profiles are not included.</div><h3>Layers</h3>${layerList()}`;return;}
    let body=`<h3>${el.type==='text'?'Text layer':el.type==='shape'?'Shape layer':'Image layer'}</h3>${field('Layer name','name',el.name)}<div class="form-grid-2">${numberField('X','x',el.x)}${numberField('Y','y',el.y)}</div><div class="form-grid-2">${numberField('Width','w',el.w,1,100000)}${numberField('Height','h',el.h,1,100000)}</div><label class="form-field"><span>Opacity · <b id="opacity-label">${Math.round(el.opacity*100)}%</b></span><input type="range" min="0" max="1" step=".05" data-property="opacity" value="${el.opacity}"></label>`;
    if(el.type==='text')body+=`<label class="form-field"><span>Text content</span><textarea data-property="text" rows="4" maxlength="12000" lang="${/[\u0C00-\u0C7F]/.test(el.text)?'te':'en'}">${escapeHTML(el.text)}</textarea></label><div class="form-grid-2">${numberField('Font size','size',el.size,1,1000)}${selectField('Font family','font',el.font,[['sans','Sans'],['serif','Serif'],['mono','Mono']])}</div><div class="form-grid-2">${selectField('Weight','weight',el.weight,[[400,'Regular'],[500,'Medium'],[600,'Semibold'],[700,'Bold'],[800,'Extra bold']])}${selectField('Align','align',el.align,[['left','Left'],['center','Center'],['right','Right']])}</div><div class="form-grid-2">${colorField('Text color','color',el.color)}${numberField('Line spacing','lh',el.lh,.5,3,.1)}</div><button class="inspector-action" data-focus-keyboard>⌨ Type with PrintType keyboard</button><p class="inspector-note">Telugu text can be pasted or entered with the virtual keyboard. For transliteration, check candidate suggestions before inserting.</p>`;
    else if(el.type==='shape')body+=`${selectField('Shape','shape',el.shape,[['rect','Rectangle'],['ellipse','Ellipse']])}<div class="form-grid-2">${colorField('Fill','fill',el.fill==='transparent'?'#ffffff':el.fill)}${colorField('Border','stroke',el.stroke==='transparent'?'#ffffff':el.stroke)}</div><div class="form-grid-2">${numberField('Border width','sw',el.sw,0,100)}${numberField('Corner radius','radius',el.radius,0,1000)}</div><label class="form-field"><span><input type="checkbox" data-transparent-fill ${el.fill==='transparent'?'checked':''}> Transparent fill</span></label>`;
    else body+=`${selectField('Image fit','fit',el.fit,[['contain','Contain'],['cover','Cover'],['fill','Stretch']])}${field('Alternative text','alt',el.alt)}<button class="inspector-action" data-replace-image>Replace image</button><p class="inspector-note">Use images you own or have permission to print.</p>`;
    body+=`<div class="two-action-row"><button class="inspector-action" data-duplicate-element>Duplicate</button><button class="inspector-action danger" data-delete-element>Delete</button></div><div class="two-action-row"><button class="inspector-action" data-layer-move="back">Send backward</button><button class="inspector-action" data-layer-move="front">Bring forward</button></div><h3>All layers</h3>${layerList()}`;box.innerHTML=body;
  }
  function addElement(type){if(!state.doc){createBlank();return;}if(type==='image'){$('#image-file').click();return;}const centerX=Math.round(state.doc.width*.12),centerY=Math.round(state.doc.height*.12);let el;if(type==='text'){el=makeElement('text',{name:'New text',text:state.keyboardLanguage==='te'?'మీ వచనం':'Your text',x:centerX,y:centerY,w:Math.round(state.doc.width*.68),h:Math.round(state.doc.height*.16),size:Math.max(28,Math.round(Math.min(state.doc.width,state.doc.height)*.065)),weight:700,font:'sans',color:'#202832',align:'left',lh:1.2});}else{el=makeElement('shape',{name:'Rectangle',shape:'rect',x:centerX,y:centerY,w:Math.round(state.doc.width*.36),h:Math.round(state.doc.height*.22),fill:'#75e6d0',stroke:'transparent',sw:0,radius:8});}mutate(()=>{state.doc.elements.push(el);state.selected=el.id;state.inspectorTab='properties';});}
  function setCanvasProperty(prop,value){if(!state.doc)return;if(prop==='preset'){if(value==='custom')return;const preset=PRESETS[Number(value)];if(!preset)return;mutate(()=>{state.doc.width=preset.w;state.doc.height=preset.h;});fitCanvas();return;}
    if(prop==='canvas-width'||prop==='canvas-height'){const number=Number(value);if(!Number.isInteger(number)||number<50||number>10000){toast('Canvas dimension must be a whole number from 50 to 10000.',true);renderInspector();return;}mutate(()=>{state.doc[prop==='canvas-width'?'width':'height']=number;});fitCanvas();return;}
    if(prop==='canvas-background'){if(!cleanColor(value))return;mutate(()=>{state.doc.background=value.toUpperCase();});return;}
  }
  function propertyInput(target){const el=getElement();if(!el)return;const property=target.dataset.property;if(!property)return;let value=target.value;
    if(['x','y','w','h','size','lh','sw','radius','opacity'].includes(property)){value=Number(value);if(!Number.isFinite(value))return;const ranges={x:[-100000,100000],y:[-100000,100000],w:[1,100000],h:[1,100000],size:[1,1000],lh:[.5,3],sw:[0,100],radius:[0,1000],opacity:[0,1]};value=clamp(value,...ranges[property]);}
    if(property==='weight')value=Number(value);
    if(['color','fill','stroke'].includes(property)&&!cleanColor(value,true))return;
    mutate(()=>{el[property]=value;});if(property==='name'){$('#canvas-selection').textContent=el.name;}if(property==='opacity')$('#opacity-label').textContent=`${Math.round(value*100)}%`;
  }
  function moveLayer(direction){const index=state.doc.elements.findIndex(el=>el.id===state.selected);if(index<0)return;const target=direction==='front'?index+1:index-1;if(target<0||target>=state.doc.elements.length)return;mutate(()=>{const [el]=state.doc.elements.splice(index,1);state.doc.elements.splice(target,0,el);});}
  function duplicateSelected(){const el=getElement();if(!el)return;const copy=clone(el);copy.id=uid(el.type[0]);copy.name=`${copy.name} copy`.slice(0,100);copy.x+=18;copy.y+=18;mutate(()=>{state.doc.elements.push(copy);state.selected=copy.id;});}
  function deleteSelected(){const el=getElement();if(!el)return;mutate(()=>{state.doc.elements=state.doc.elements.filter(item=>item.id!==el.id);state.selected=null;});toast('Layer deleted. Use Undo to restore it.');}

  document.addEventListener('click',event=>{
    const viewButton=event.target.closest('[data-view]');if(viewButton){setView(viewButton.dataset.view);return;}
    const goto=event.target.closest('[data-goto]');if(goto){setView(goto.dataset.goto);return;}
    const product=event.target.closest('[data-product]');if(product){const preset=({ 'Business card':'business','Poster':'poster','Invitation':'invite','Social post':'square'})[product.dataset.product]||'a4';createBlank(product.dataset.product,PRESETS.find(p=>p.id===preset));return;}
    const template=event.target.closest('[data-use-template]');if(template){useTemplate(template.dataset.useTemplate);return;}
    const cat=event.target.closest('[data-template-category]');if(cat){state.templateCategory=cat.dataset.templateCategory;renderTemplateViews();return;}
    const open=event.target.closest('[data-open-project]');if(open){openSavedProject(open.dataset.openProject);return;}
    const saveDownload=event.target.closest('[data-download-project]');if(saveDownload){const r=storage.get(saveDownload.dataset.downloadProject);if(r.ok)downloadJSON(r.doc);else toast(r.error,true);return;}
    const del=event.target.closest('[data-delete-project]');if(del){if(window.confirm('Delete this saved project from this browser?')){const r=storage.remove(del.dataset.deleteProject);if(r.ok){renderProjects();toast('Saved project deleted.');}else toast(r.error,true);}return;}
    const add=event.target.closest('[data-add]');if(add){addElement(add.dataset.add);return;}
    const select=event.target.closest('[data-select-element]');if(select){state.selected=select.dataset.selectElement;state.inspectorTab='properties';renderCanvas();renderInspector();return;}
    if(event.target.closest('[data-inspector-tab]')){state.inspectorTab=event.target.closest('[data-inspector-tab]').dataset.inspectorTab;renderInspector();return;}
    if(event.target.closest('[data-duplicate-element]')){duplicateSelected();return;}
    if(event.target.closest('[data-delete-element]')){deleteSelected();return;}
    if(event.target.closest('[data-layer-move]')){moveLayer(event.target.closest('[data-layer-move]').dataset.layerMove);return;}
    if(event.target.closest('[data-focus-keyboard]')){openKeyboardForCurrentText();return;}
    if(event.target.closest('[data-replace-image]')){$('#image-file').click();return;}
    if(event.target.closest('[data-suggestion]')){useKeyboardCandidate(event.target.closest('[data-suggestion]').dataset.suggestion);return;}
    if(event.target.closest('[data-vk]')){handleVirtualKey(event.target.closest('[data-vk]').dataset.vk);return;}
    if(event.target.closest('[data-vk-lang]')){state.keyboardLanguage=event.target.closest('[data-vk-lang]').dataset.vkLang;renderKeyboard();return;}
  });

  $$('[data-view]').forEach(btn=>btn.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setView(btn.dataset.view);}}));
  $('#top-new').addEventListener('click',()=>createBlank());$('#hero-new').addEventListener('click',()=>createBlank());$('#projects-new').addEventListener('click',()=>createBlank());
  $('#editor-save').addEventListener('click',saveProject);$('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);$('#export-png').addEventListener('click',async event=>{const button=event.currentTarget;if(!state.doc)return toast('Open a design first.',true);button.disabled=true;try{await exportPNG();toast('PNG export downloaded.');}catch(e){console.error(e);toast(`PNG export failed: ${e.message}`,true);}finally{button.disabled=false;}});
  $('#design-name').addEventListener('input',event=>{if(!state.doc)return;state.doc.name=event.target.value.slice(0,120)||'Untitled design';markDirty();});
  $('#template-search').addEventListener('input',event=>{state.templateQuery=event.target.value;renderTemplateViews();});
  $$('[data-inspector-tab]').forEach(tab=>tab.addEventListener('click',()=>{state.inspectorTab=tab.dataset.inspectorTab;renderInspector();}));
  $('#inspector-content').addEventListener('change',event=>{const target=event.target;if(target.matches('[data-transparent-fill]')){const el=getElement();if(!el||el.type!=='shape')return;mutate(()=>{el.fill=target.checked?'transparent':'#75e6d0';});return;}if(target.dataset.property){if(['preset','canvas-width','canvas-height','canvas-background'].includes(target.dataset.property))setCanvasProperty(target.dataset.property,target.value);else propertyInput(target);}});
  let propertyTypingSnapshot = null;
  $('#inspector-content').addEventListener('input',event=>{
    const target=event.target;
    if(!target.dataset.property)return;
    const prop=target.dataset.property;
    if(['preset','canvas-width','canvas-height'].includes(prop))return;
    if(prop==='canvas-background'){const color=target.value;if(state.doc&&cleanColor(color)){if(!propertyTypingSnapshot)propertyTypingSnapshot=snapshot();state.doc.background=color.toUpperCase();state.doc.updated=nowISO();markDirty();renderCanvas();}return;}
    const el=getElement();if(!el)return;
    let value=target.value;
    if(['x','y','w','h','size','lh','sw','radius','opacity'].includes(prop)){value=Number(value);if(!Number.isFinite(value))return;const ranges={x:[-100000,100000],y:[-100000,100000],w:[1,100000],h:[1,100000],size:[1,1000],lh:[.5,3],sw:[0,100],radius:[0,1000],opacity:[0,1]};value=clamp(value,...ranges[prop]);}
    if(prop==='weight')value=Number(value);
    if(['color','fill','stroke'].includes(prop)&&!cleanColor(value,true))return;
    if(!propertyTypingSnapshot)propertyTypingSnapshot=snapshot();
    el[prop]=value;state.doc.updated=nowISO();markDirty();renderCanvas();
    $('#canvas-selection').textContent=el.name;
    if(prop==='opacity')$('#opacity-label').textContent=`${Math.round(value*100)}%`;
  });
  $('#inspector-content').addEventListener('focusout',event=>{
    if(!propertyTypingSnapshot)return;
    if(event.target.matches('[data-property]')){pushUndo(propertyTypingSnapshot);propertyTypingSnapshot=null;renderInspector();updateUndoButtons();}
  });
  $('#canvas-stage').addEventListener('pointerdown',event=>{const node=event.target.closest('[data-element-id]');if(!node){state.selected=null;renderCanvas();renderInspector();return;}const id=node.dataset.elementId;state.selected=id;state.inspectorTab='properties';renderCanvas();renderInspector();const el=getElement();if(!el)return;const resize=Boolean(event.target.closest('[data-resize]'));state.drag={pointerId:event.pointerId,mode:resize?'resize':'move',x:event.clientX,y:event.clientY,ox:el.x,oy:el.y,w:el.w,h:el.h,snapshot:snapshot(),moved:false};try{$('#canvas-stage-wrap').setPointerCapture(event.pointerId);}catch(_){}event.preventDefault();});
  $('#canvas-stage-wrap').addEventListener('pointermove',event=>{const drag=state.drag;if(!drag||event.pointerId!==drag.pointerId)return;const el=getElement();if(!el)return;const dx=(event.clientX-drag.x)/state.scale,dy=(event.clientY-drag.y)/state.scale;if(Math.abs(dx)+Math.abs(dy)>2)drag.moved=true;if(!drag.moved)return;if(drag.mode==='move'){el.x=Math.round(drag.ox+dx);el.y=Math.round(drag.oy+dy);}else{el.w=Math.max(1,Math.round(drag.w+dx));el.h=Math.max(1,Math.round(drag.h+dy));}const dom=$(`[data-element-id="${CSS.escape(el.id)}"]`);if(dom){dom.style.left=el.x+'px';dom.style.top=el.y+'px';dom.style.width=el.w+'px';dom.style.height=el.h+'px';}});
  function endPointer(event){const drag=state.drag;if(!drag||event.pointerId!==drag.pointerId)return;if(drag.moved){pushUndo(drag.snapshot);markDirty();renderInspector();$('#canvas-selection').textContent=getElement()?.name||'No selection';}state.drag=null;}
  $('#canvas-stage-wrap').addEventListener('pointerup',endPointer);$('#canvas-stage-wrap').addEventListener('pointercancel',endPointer);window.addEventListener('resize',()=>requestAnimationFrame(fitCanvas));
  $('#inspector-content').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();undo();}});
  document.addEventListener('keydown',event=>{if(state.view==='editor'&&state.doc){const typing=/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName);if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();saveProject();return;}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){if(typing)return;event.preventDefault();event.shiftKey?redo():undo();return;}if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='y'){event.preventDefault();redo();return;}if(typing||state.keyboardOpen)return;const n={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];if(n&&getElement()){event.preventDefault();const el=getElement();mutate(()=>{el.x+=n[0]*(event.shiftKey?10:1);el.y+=n[1]*(event.shiftKey?10:1);});}else if((event.key==='Delete'||event.key==='Backspace')&&getElement()){event.preventDefault();deleteSelected();}}});

  function imageLoad(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('The image could not be decoded.'));img.src=src;});}
  function wrapCanvasText(ctx,text,maxWidth){const lines=[];for(const paragraph of text.split('\n')){if(!paragraph){lines.push('');continue;}let line='';for(const word of paragraph.split(/\s+/)){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width<=maxWidth||!line){line=next;}else{lines.push(line);line=word;}}lines.push(line);}return lines;}
  async function exportPNG(){const doc=state.doc;if(!doc)throw new Error('No design is open.');const scale=Number($('#export-scale').value)||1,width=Math.round(doc.width*scale),height=Math.round(doc.height*scale);if(width>16000||height>16000||width*height>120_000_000)throw new Error('The export dimensions are too large. Try a smaller scale.');if(document.fonts?.ready)await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas export is unavailable.');ctx.scale(scale,scale);ctx.fillStyle=doc.background;ctx.fillRect(0,0,doc.width,doc.height);
    for(const el of doc.elements){ctx.save();ctx.globalAlpha=el.opacity;if(el.type==='shape'){ctx.beginPath();if(el.shape==='ellipse')ctx.ellipse(el.x+el.w/2,el.y+el.h/2,el.w/2,el.h/2,0,0,Math.PI*2);else if(ctx.roundRect)ctx.roundRect(el.x,el.y,el.w,el.h,Math.min(el.radius,el.w/2,el.h/2));else ctx.rect(el.x,el.y,el.w,el.h);if(el.fill!=='transparent'){ctx.fillStyle=el.fill;ctx.fill();}if(el.sw&&el.stroke!=='transparent'){ctx.lineWidth=el.sw;ctx.strokeStyle=el.stroke;ctx.stroke();}}
      else if(el.type==='image'){const img=await imageLoad(el.src);let x=el.x,y=el.y,w=el.w,h=el.h;if(el.fit==='fill')ctx.drawImage(img,x,y,w,h);else{const r=img.width/img.height,box=el.w/el.h;if((el.fit==='cover')===(r>box)){h=el.h;w=h*r;}else{w=el.w;h=w/r;}x=el.x+(el.w-w)/2;y=el.y+(el.h-h)/2;ctx.beginPath();ctx.rect(el.x,el.y,el.w,el.h);ctx.clip();ctx.drawImage(img,x,y,w,h);}}
      else{ctx.beginPath();ctx.rect(el.x,el.y,el.w,el.h);ctx.clip();ctx.fillStyle=el.color;ctx.font=`${el.weight} ${el.size}px ${fontFor(el)}`;ctx.textBaseline='top';ctx.textAlign=el.align;const x=el.align==='left'?el.x:el.align==='center'?el.x+el.w/2:el.x+el.w;const lines=wrapCanvasText(ctx,el.text,el.w);lines.forEach((line,index)=>ctx.fillText(line,x,el.y+index*el.size*el.lh,el.w));}ctx.restore();}
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('The browser could not produce a PNG.');downloadBlob(`${safeSlug(doc.name)}.png`,blob);}

  // Secure image upload: type and size checks plus decoding before insertion.
  $('#image-file').addEventListener('change',async event=>{const file=event.target.files?.[0];event.target.value='';if(!file||!state.doc)return;if(!IMAGE_TYPES.has(file.type)){toast('Choose a PNG, JPEG or WebP image.',true);return;}if(file.size>3*1024*1024){toast('Image files must be 3 MB or smaller to protect browser storage.',true);return;}try{const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('Could not read the image.'));reader.readAsDataURL(file);});const img=await imageLoad(data);const factor=Math.min(state.doc.width*.7/img.width,state.doc.height*.7/img.height,1);const w=Math.max(1,Math.round(img.width*factor)),h=Math.max(1,Math.round(img.height*factor));const el=makeElement('image',{name:file.name.slice(0,100),src:data,alt:file.name.replace(/\.[^.]+$/,'').slice(0,250),x:Math.round((state.doc.width-w)/2),y:Math.round((state.doc.height-h)/2),w,h,fit:'contain'});mutate(()=>{state.doc.elements.push(el);state.selected=el.id;});}catch(e){toast(`Image upload failed: ${e.message}`,true);}});

  // Project JSON import is schema-validated; files never execute as HTML.
  function clickImport(){if(state.dirty&&!window.confirm('Import another project? Unsaved changes in the open design will be lost unless saved first.'))return;$('#project-file').click();}
  $('#import-project').addEventListener('click',clickImport);$('#projects-import').addEventListener('click',clickImport);
  $('#project-file').addEventListener('change',async event=>{const file=event.target.files?.[0];event.target.value='';if(!file)return;if(file.size>10*1024*1024){toast('Project JSON must be 10 MB or smaller.',true);return;}try{const parsed=JSON.parse(await file.text());const doc=validateDocument(parsed);doc.id=uid('project');doc.name=doc.name.slice(0,110)+' (imported)';doc.created=nowISO();doc.updated=nowISO();const result=storage.save(doc);if(!result.ok)throw new Error(result.error);renderProjects();openProject(doc);toast('Validated project imported and saved locally.');}catch(e){toast(`Import failed: ${e.message}`,true);}});

  // Virtual keyboard: Unicode Telugu keys; limited deterministic dictionary candidates only.
  const teluguRows=[['ూ','ూ'],['ఆ','ఈ','ఊ','ఋ','ఌ','ఎ','ఏ','ఐ','ఒ','ఓ','ఔ'],['క','ఖ','గ','ఘ','చ','ఛ','జ','ఝ','ట','ఠ'],['డ','ఢ','త','థ','ద','ధ','న','ప','ఫ','బ'],['భ','మ','య','ర','ల','వ','శ','ష','స','హ'],['ా','ి','ీ','ు','ూ','ె','ే','ై','ొ','ో','ౌ','ం']];
  const englishRows=[['q','w','e','r','t','y','u','i','o','p'],['a','s','d','f','g','h','j','k','l'],['⇧','z','x','c','v','b','n','m','⌫'],['?123',',','😊','space','.','↵']];
  const teluguBasicRows=[['అ','ఆ','ఇ','ఈ','ఉ','ఊ','ఎ','ఏ','ఐ','ఒ'],['క','ఖ','గ','ఘ','చ','జ','ట','డ','త','ద'],['న','ప','బ','మ','య','ర','ల','వ','శ','స'],['ా','ి','ీ','ు','ూ','ె','ే','ై','ం','ః'],['?123','English','😊','space','⌫','↵']];
  const teluguExtraRows=[['౧','౨','౩','౪','౫','౬','౭','౮','౯','౦'],['!','@','#','$','%','&','-','+','(',')'],['*','"',"'",':',';','/','?','⌫'],['ABC',',','😊','space','.','↵']];
  const wordMap={namaskaram:'నమస్కారం',namaste:'నమస్తే',telugu:'తెలుగు',bhasha:'భాష',swagatham:'స్వాగతం',dhanyavadalu:'ధన్యవాదాలు',subhakankshalu:'శుభాకాంక్షలు',ugadi:'ఉగాది',aahvanam:'ఆహ్వానం',pelli:'పెళ్లి',puttinaroju:'పుట్టినరోజు',amma:'అమ్మ',nanna:'నాన్న',andaru:'అందరూ',prem:'ప్రేమ',santosham:'సంతోషం',manchi:'మంచి',meeru:'మీరు',ela:'ఎలా',unnaru:'ఉన్నారు',bagunnara:'బాగున్నారా',chesuko:'చేసుకో',chala:'చాలా',sare:'సరే',avunu:'అవును',kaadu:'కాదు',kotha:'కొత్త',roju:'రోజు',subhodayam:'శుభోదయం',raatri:'రాత్రి',snehithulu:'స్నేహితులు',welcome:'స్వాగతం',thankyou:'ధన్యవాదాలు'};
  const emojis=['😀','😃','😄','😁','😊','😍','🥳','🎉','✨','❤️','🙏','👍','🌿','🌸','🎨','🖨️','💐','⭐','🔥','💫'];
  function currentTarget(){const selected=getElement();return selected?.type==='text'?selected:null;}
  function openKeyboardForCurrentText(){const el=currentTarget();if(!el){toast('Select a text layer first, then open the keyboard.',true);return;}state.keyboardTarget=el.id;state.keyboardCaret=el.text.length;state.keyboardOpen=true;$('#keyboard-dock').hidden=false;renderKeyboard();showKeyboardCandidates();}
  $('#editor-keyboard').addEventListener('click',()=>{if(state.keyboardOpen){state.keyboardOpen=false;$('#keyboard-dock').hidden=true;}else openKeyboardForCurrentText();});$('#kbd-close').addEventListener('click',()=>{state.keyboardOpen=false;$('#keyboard-dock').hidden=true;});
  $('#kbd-lang').addEventListener('click',()=>{state.keyboardLanguage=state.keyboardLanguage==='en'?'te':'en';state.keyboardSymbols=false;renderKeyboard();});$('#test-keyboard').addEventListener('click',()=>{if(!state.doc)createBlank('Keyboard practice',PRESETS[1]);setView('editor');const el=currentTarget();if(!el)addElement('text');openKeyboardForCurrentText();});
  function keyMarkup(key){const symbol=['⇧','⌫','?123','ABC','English','😊','space','↵'].includes(key);const cls=`vk-key${symbol?' special':''}${['↵','English','ABC'].includes(key)?' accent':''}${key==='space'?' space':''}${key==='↵'?' enter':''}`;return `<button class="${cls}" data-vk="${escapeHTML(key)}" type="button">${key==='space'?'English / తెలుగు · Space':escapeHTML(key)}</button>`;}
  function renderKeyboard(){const label=state.keyboardLanguage==='en'?'EN / తెలుగు':'తెలుగు / EN';$('#kbd-lang').textContent=label;const root=$('#virtual-keyboard');let rows;if(state.keyboardSymbols){rows=state.keyboardLanguage==='te'?teluguExtraRows:[['1','2','3','4','5','6','7','8','9','0'],['@','#','$','%','&','-','+','(',')'],['*','"',"'",':',';','/','?','⌫'],['ABC',',','😊','space','.','↵']];}else if(state.keyboardLanguage==='en'){rows=englishRows;}else{rows=teluguBasicRows;}root.innerHTML=rows.map(row=>`<div class="key-row">${row.map(key=>keyMarkup(key)).join('')}</div>`).join('');}
  function insertAtCaret(text){const el=getElement(state.keyboardTarget)||currentTarget();if(!el||el.type!=='text'){toast('Select a text layer before typing.',true);return;}const start=clamp(state.keyboardCaret,0,el.text.length);const updated=el.text.slice(0,start)+text+el.text.slice(start);mutate(()=>{el.text=updated;},false);renderCanvas();renderInspector();state.keyboardTarget=el.id;state.keyboardCaret=start+text.length;$('#keyboard-dock').hidden=false;showKeyboardCandidates();}
  function deleteAtCaret(){const el=getElement(state.keyboardTarget)||currentTarget();if(!el||el.type!=='text')return;const start=clamp(state.keyboardCaret,0,el.text.length);if(!start)return;const prefix=el.text.slice(0,start);const match=prefix.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]$|.$/u);const cut=match?match[0]:'';const newStart=start-cut.length;const updated=el.text.slice(0,newStart)+el.text.slice(start);mutate(()=>{el.text=updated;},false);renderCanvas();renderInspector();state.keyboardCaret=newStart;$('#keyboard-dock').hidden=false;showKeyboardCandidates();}
  function lastWord(text){const matches=text.match(/[A-Za-z]+$/);return matches?matches[0].toLowerCase():'';}
  function showKeyboardCandidates(){const el=getElement(state.keyboardTarget)||currentTarget();if(!el||el.type!=='text'){ $('#suggestion-row').innerHTML='<button type="button" disabled>Select a text layer</button>';return;}const word=lastWord(el.text.slice(0,state.keyboardCaret));let candidates=[];if(word){const translated=wordMap[word];if(translated)candidates=[translated,word[0].toUpperCase()+word.slice(1),word];else candidates=[word[0].toUpperCase()+word.slice(1),word.toUpperCase(),word];}else candidates=['తెలుగు','నమస్కారం','✨'];$('#suggestion-row').innerHTML=candidates.slice(0,3).map(candidate=>`<button data-suggestion="${escapeHTML(candidate)}" type="button">${escapeHTML(candidate)}</button>`).join('');}
  function useKeyboardCandidate(candidate){const el=getElement(state.keyboardTarget)||currentTarget();if(!el||el.type!=='text')return;const before=el.text.slice(0,state.keyboardCaret);const word=lastWord(before);let newText=el.text;let caret=state.keyboardCaret;if(word){const start=caret-word.length;newText=el.text.slice(0,start)+candidate+el.text.slice(caret);caret=start+candidate.length;}else{newText=el.text.slice(0,caret)+candidate+el.text.slice(caret);caret+=candidate.length;}mutate(()=>{el.text=newText;},false);renderCanvas();renderInspector();state.keyboardCaret=caret;$('#keyboard-dock').hidden=false;showKeyboardCandidates();} 
  function handleVirtualKey(key){if(key==='⇧'){state.keyboardShift=!state.keyboardShift;renderKeyboard();return;}if(key==='⌫'){deleteAtCaret();return;}if(key==='?123'){state.keyboardSymbols=true;renderKeyboard();return;}if(key==='ABC'){state.keyboardSymbols=false;renderKeyboard();return;}if(key==='English'){state.keyboardLanguage='en';state.keyboardSymbols=false;renderKeyboard();return;}if(key==='😊'){const row=$('#suggestion-row');row.innerHTML=emojis.slice(0,10).map(emoji=>`<button type="button" data-suggestion="${emoji}">${emoji}</button>`).join('');return;}if(key==='space'){insertAtCaret(' ');return;}if(key==='↵'){insertAtCaret('\n');return;}if(state.keyboardLanguage==='en'&&key.length===1&&/[a-z]/i.test(key)){insertAtCaret(state.keyboardShift?key.toUpperCase():key);if(state.keyboardShift){state.keyboardShift=false;renderKeyboard();}return;}insertAtCaret(key);}
  $('#keyboard-dock').hidden=true;renderKeyboard();

  // Gemini status checks and request: no client-side API key. Expected serverless contract: POST {prompt, aspectRatio} -> {imageDataUrl, mimeType?}.
  async function checkAIEndpoint(){const status=$('#ai-status'),pill=$('#ai-state'),integration=$('#gemini-integration-state');try{const response=await fetch('/api/generate-image',{method:'OPTIONS',headers:{'Accept':'application/json'}});if(response.ok||response.status===405){status.textContent='A serverless route exists. Run a real request to verify model access.';pill.textContent='Endpoint detected';integration.textContent='Endpoint detected';return true;}throw new Error('no endpoint');}catch(_){status.textContent='Not configured in this static preview. Deploy a compatible serverless function and set GEMINI_API_KEY server-side.';pill.textContent='Not configured';integration.textContent='Not configured';return false;}}
  $('#generate-image').addEventListener('click',async event=>{const prompt=$('#ai-prompt').value.trim();if(!prompt){toast('Enter an image description first.',true);$('#ai-prompt').focus();return;}if(prompt.length>2000){toast('The prompt must be 2000 characters or shorter.',true);return;}const button=event.currentTarget;button.disabled=true;state.aiBusy=true;$('#ai-status').textContent='Requesting a real image from the configured serverless endpoint…';$('#ai-state').textContent='Generating';$('#ai-result').innerHTML='<div class="ai-result-placeholder"><span>◌</span><strong>Generating image…</strong><p>This may take a moment. Do not close the tab.</p></div>';
    try{const response=await fetch('/api/generate-image',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({prompt,aspectRatio:$('#ai-aspect').value})});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.error||`Image endpoint returned HTTP ${response.status}.`);if(typeof data.imageDataUrl!=='string'||!/^data:image\/(png|jpeg|webp);base64,/.test(data.imageDataUrl))throw new Error('The server did not return a valid image data URL.');const blob=await (await fetch(data.imageDataUrl)).blob();if(!['image/png','image/jpeg','image/webp'].includes(blob.type)||blob.size>15*1024*1024)throw new Error('Returned image type or size is not supported.');state.aiImage={blob,src:data.imageDataUrl,type:blob.type,prompt};$('#ai-result').innerHTML='';const image=document.createElement('img');image.alt=`Generated visual: ${prompt.slice(0,120)}`;image.src=URL.createObjectURL(blob);image.onload=()=>URL.revokeObjectURL(image.src);$('#ai-result').append(image);$('#ai-status').textContent='Image returned by the configured server endpoint.';$('#ai-state').textContent='Generated';$('#ai-download').disabled=false;$('#ai-add-to-design').disabled=false;toast('Image generation completed.');
    }catch(error){console.error('Gemini image request failed:',error);$('#ai-status').textContent=error.message;$('#ai-state').textContent='Request failed';$('#ai-result').innerHTML=`<div class="ai-result-placeholder"><span>!</span><strong>Image was not generated</strong><p>${escapeHTML(error.message)} Check the serverless configuration and try again.</p><button class="button button-secondary" id="ai-retry" type="button">Retry request</button></div>`;$('#ai-retry').addEventListener('click',()=>$('#generate-image').click());toast(error.message,true);}finally{button.disabled=false;state.aiBusy=false;}});
  $('#ai-download').addEventListener('click',()=>{if(!state.aiImage)return;downloadBlob(`aiprintos-ai-${Date.now()}.${state.aiImage.type==='image/jpeg'?'jpg':state.aiImage.type.split('/')[1]}`,state.aiImage.blob);});
  $('#ai-add-to-design').addEventListener('click',async()=>{if(!state.aiImage)return;if(!state.doc)createBlank('AI generated design',PRESETS[1]);const file=new File([state.aiImage.blob],`ai-generated.${state.aiImage.type.split('/')[1]}`,{type:state.aiImage.type});const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});const img=await imageLoad(data);const factor=Math.min(state.doc.width*.8/img.width,state.doc.height*.65/img.height,1);const el=makeElement('image',{name:'AI generated image',src:data,alt:state.aiImage.prompt.slice(0,250),x:Math.round((state.doc.width-img.width*factor)/2),y:Math.round((state.doc.height-img.height*factor)/2),w:Math.max(1,Math.round(img.width*factor)),h:Math.max(1,Math.round(img.height*factor)),fit:'contain'});mutate(()=>{state.doc.elements.push(el);state.selected=el.id;});setView('editor');toast('Image added to the open design. Save your project to keep it.');});

  // Set AI status without assuming any live provider access.
  checkAIEndpoint();
  // Native HTML forms and downloads do not need any framework or build step.
  renderTemplateViews();renderProjects();setView('home');updateUndoButtons();
  window.addEventListener('beforeunload',event=>{if(state.dirty){event.preventDefault();event.returnValue='';}});
})();
