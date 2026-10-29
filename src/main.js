const $ = (s, root = document) => root.querySelector(s);
const app = $('#app');
const params = new URLSearchParams(location.search);
const data = { rows: [], hymnalCount: null, view: location.hash.slice(1) || 'hymns', query: params.get('q') || '', filter: 'All languages', browse:'A–Z', selected: null, searchBusy: false };
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const iconPaths = {
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  grid:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  heart:'<path d="M20.8 8.8c0 5.3-8.8 10.3-8.8 10.3S3.2 14.1 3.2 8.8A4.5 4.5 0 0 1 12 6.6a4.5 4.5 0 0 1 8.8 2.2Z"/>',
  list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  download:'<path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v3h16v-3"/>',
  search:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',
  stage:'<path d="M13 4h7v7M20 4 11 13"/><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5"/>',
  moon:'<path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z"/>',
  music:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  meter:'<path d="M5 21h14M7 21 12 3l5 18M9 14h6"/>',
  database:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/>',
  sparkle:'<path d="m12 3 1.9 6.1L20 11l-6.1 1.9L12 19l-1.9-6.1L4 11l6.1-1.9L12 3Z"/><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z"/>',
  enter:'<path d="M4 12h14m-5-5 5 5-5 5"/><path d="M19 5h2v14h-2"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  play:'<path d="m8 5 11 7-11 7z"/>',
  stop:'<rect x="6" y="6" width="12" height="12" rx="1"/>',
  tempo:'<path d="m12 3 7 18H5l7-18Z"/><path d="m12 12 4-4M9 17h6"/>',
  grip:'<circle cx="8" cy="5" r="1"/><circle cx="16" cy="5" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="19" r="1"/><circle cx="16" cy="19" r="1"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  file:'<path d="M6 3h8l5 5v13H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v6h5M8 13h8M8 17h8"/>',
  people:'<path d="M16 20v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 18.5V20"/><circle cx="10" cy="7" r="4"/><path d="M17 11a4 4 0 0 0 0-8m3 17v-1.5a4.5 4.5 0 0 0-3.5-4.4"/>',
  library:'<path d="M4 5.5 18 3v16L4 21V5.5Z"/><path d="M7 8.5 15 7M7 12 15 10.5M7 15.5 15 14"/><path d="M18 6h2v15l-2-1"/>'
};
const icon = (name, className='') => `<svg class="ui-icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.music}</svg>`;
const saved = new Set(JSON.parse(localStorage.getItem('bbh-saved') || '[]'));
let service = JSON.parse(localStorage.getItem('bbh-service') || '[]');
let searchTimer;
let audioCtx;
const nav = [['hymns','home','Hymns'],['browse','grid','Browse'],['saved','heart','Saved'],['order','list','Order of service'],['data','download','Open data']];

async function loadIndex() {
  if (data.rows.length) return;
  data.searchBusy = true; render();
  try {
    const response = await fetch('/data/texts-index.json.gz');
    if (!response.ok) throw new Error('Could not load the search index.');
    let stream = response.body;
    if (typeof DecompressionStream !== 'undefined') stream = stream.pipeThrough(new DecompressionStream('gzip'));
    else { const buf = await response.arrayBuffer(); const ds = new DecompressionStream('gzip'); stream = new Response(buf).body.pipeThrough(ds); }
    data.rows = await new Response(stream).json();
    if (!data.rows.length) throw new Error('The index is empty.');
    if (params.get('export') === 'csv' && params.get('q') && !data.exported) { data.exported = true; setTimeout(exportCsv, 250); }
  } catch (err) { data.indexError = err.message || 'The index is not available offline yet.'; }
  data.searchBusy = false; render();
}

const languages = ['All languages','English','Tagalog','Filipino','Cebuano','Ilocano'];
const langMatch = (row, lang) => lang === 'All languages' || (row.languages || '').toLowerCase().includes(lang.toLowerCase());
function results(query = data.query, limit = 80) {
  const q = query.trim().toLocaleLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  if (!terms.length) return data.rows.filter(r => langMatch(r, data.filter)).slice(0, limit);
  const hits = [];
  for (const row of data.rows) {
    if (!langMatch(row, data.filter)) continue;
    const hay = `${row.displayTitle} ${row.textTitle} ${row.firstLine} ${row.refrainFirstLine} ${row.authors} ${row.textAuthNumber} ${row.meter} ${row.languages}`.toLocaleLowerCase();
    if (terms.every(term => hay.includes(term))) hits.push(row);
    if (hits.length >= limit) break;
  }
  return hits;
}
function chips(label, values) { return `<div class="pills" role="group" aria-label="${esc(label)}">${values.map(v=>`<button class="pill ${data.filter===v?'active':''}" data-filter="${esc(v)}">${esc(v)}</button>`).join('')}</div>`; }
function resultCard(row, i = 0) {
  const id = row.textAuthNumber || row.displayTitle;
  return `<button class="result-row ${data.selected===id?'chosen':''}" data-result="${esc(id)}"><span class="result-num">${String(i+1).padStart(2,'0')}</span><span class="result-copy"><strong>${esc(row.displayTitle || row.textTitle || 'Untitled text')}</strong><span>${esc(row.firstLine || row.refrainFirstLine || 'Opening line not listed')}</span></span><span class="result-lang">${esc(row.languages || 'Language not specified')}</span></button>`;
}
function detail(row) {
  if (!row) return `<section class="detail empty-detail"><div class="empty-icon">${icon('music')}</div><h3>Your next hymn</h3><p>Choose a search result to view its catalog details and opening line.</p><span class="quiet-tag">TEXT CATALOG · INCIPIT PREVIEW</span></section>`;
  const authors = row.authors ? row.authors.split(/\s*;\s*/).join(' · ') : 'Author not listed';
  return `<section class="detail"><div class="detail-top"><div><span class="eyebrow">TEXT CATALOG · OPENING LINE</span><h2>${esc(row.displayTitle || row.textTitle || 'Untitled text')}</h2><p class="byline">${esc(authors)}${row.yearsWrote ? ` · ${esc(row.yearsWrote)}` : ''}</p></div><button class="save-btn ${saved.has(row.textAuthNumber)?'is-saved':''}" data-save="${esc(row.textAuthNumber)}" aria-label="Save hymn">${icon('heart','save-icon')} <span>${saved.has(row.textAuthNumber)?'Saved':'Save'}</span></button></div>
    <div class="detail-meta"><span>${icon('globe')} ${esc(row.languages || 'Language not specified')}</span>${row.meter?`<span>${icon('music')} Meter ${esc(row.meter)}</span>`:''}<span>${icon('database')} ${esc(row.totalInstances || '0')} catalog matches</span></div>
    <div class="lyrics-grid"><article class="lyric-card"><span class="eyebrow">OPENING LINE</span><p>${esc(row.firstLine || 'No opening line in the source record.')}</p>${row.refrainFirstLine?`<span class="eyebrow refrain-label">REFRAIN OPENING</span><p>${esc(row.refrainFirstLine)}</p>`:''}</article><article class="lyric-note"><span class="note-mark">${icon('info')}</span><div><strong>Catalog record, not full lyrics</strong><p>The supplied source includes titles and opening lines. It does not include complete verses or a verified translation pairing.</p></div></article></div>
    <div class="practice-bar"><div><span class="eyebrow">PRACTICE TONE</span><span class="practice-note">A gentle four-part chord exercise</span></div><div class="practice-controls"><button class="mini-control" data-key="-1" aria-label="Lower key">${icon('minus')}</button><span class="key-label" id="key-label">C</span><button class="mini-control" data-key="1" aria-label="Raise key">${icon('plus')}</button><span class="control-divider"></span><button class="play-button" data-play>${icon('play','play-icon')} <span>Play</span></button><button class="mini-control tempo" data-tempo>${icon('tempo')} <span id="tempo-label">72</span></button></div></div>
    <div class="detail-actions"><button class="btn btn-dark" data-add-service="${esc(row.textAuthNumber)}">${icon('plus')} Add to service</button><span class="auth-id">Text ID · ${esc(row.textAuthNumber || 'not listed')}</span></div><p class="audio-disclaimer">This is a synthesized practice chord exercise, not a transcription or recording of this hymn.</p></section>`;
}
function renderHymns() {
  const recent = results('', 6);
  const sample = recent.find(r => /amazing grace/i.test(r.displayTitle)) || recent[0];
  const selected = data.rows.find(r => r.textAuthNumber === data.selected) || sample;
  const current = data.searchBusy ? '<div class="loading"><span class="spinner"></span>Preparing 290,000+ text records…</div>' : data.indexError ? `<div class="notice">${esc(data.indexError)} <button class="text-button" data-retry>Try again</button></div>` : '';
  return `<div class="page-head"><div><span class="eyebrow">WORSHIP · TOGETHER</span><h1>Find a hymn.<br/><em>Find your song.</em></h1><p class="page-lede">Search the world’s hymn texts by title, opening line, author or language.</p></div><div class="head-stamp"><span>${icon('sparkle')}</span> MADE FOR<br/>CONGREGATIONAL<br/>SINGING</div></div>
    <section class="search-box"><span class="search-glyph">${icon('search')}</span><input id="query" value="${esc(data.query)}" type="search" placeholder="Try “amazing grace”, “peace like a river”, an author…" autocomplete="off"/><kbd>${icon('enter')}</kbd></section>
    <div class="search-meta"><span>${data.rows.length?`${data.rows.length.toLocaleString()} searchable text records`:current || 'Search every language in the catalog'}</span>${chips('Filter by language',languages)}</div>
    <div class="content-grid"><section class="results-panel"><div class="panel-heading"><div><span class="eyebrow">THE HYMN INDEX</span><h2>${data.query?`Results for “${esc(data.query)}”`:'Recently indexed'}</h2></div><div class="panel-actions">${data.query&&data.rows.length?`<button class="subtle-btn" data-export>${icon('download')} Export CSV</button>`:''}<button class="subtle-btn" data-view="browse">Browse all ${icon('arrow')}</button></div></div>${current}${data.rows.length?`<div class="results-list">${(data.query?results(data.query,80):recent).map(resultCard).join('') || '<div class="no-results"><strong>No matching texts found.</strong><span>Try a shorter phrase or clear the language filter.</span></div>'}</div>`:''}</section>${detail(selected)}</div>`;
}
function renderBrowse() {
  const tabs=['A–Z','By language','Authors','Meters'];
  const q=data.query; const items=results(q || '', 100);
  const key=data.browse==='By language'?'languages':data.browse==='Authors'?'authors':data.browse==='Meters'?'meter':'displayTitle';
  const filtered=q?items.slice().sort((a,b)=>(a[key]||'').localeCompare(b[key]||'')).slice(0,100):data.rows.filter(r=>langMatch(r,data.filter)).slice().sort((a,b)=>(a[key]||'').localeCompare(b[key]||'')).slice(0,100);
  return `<div class="page-head compact"><div><span class="eyebrow">A WELL OF SONG</span><h1>Browse the <em>hymnal.</em></h1><p class="page-lede">Explore more than 290,000 text records from the supplied hymnology catalog.</p></div></div><div class="browse-controls"><div class="pills">${tabs.map(t=>`<button class="pill ${data.browse===t?'active':''}" data-browse="${t}">${t}</button>`).join('')}</div><input id="query" class="browse-input" value="${esc(q)}" placeholder="Filter this index…"/></div><div class="browse-explainer">${data.browse==='A–Z'?'Alphabetical index of text titles.':data.browse==='By language'?'Explore texts by their catalog language.':data.browse==='Authors'?'Browse names attached to source text records.': 'Browse by poetic meter when listed.'}</div><section class="results-panel browse-results"><div class="results-list">${filtered.map(resultCard).join('') || '<div class="no-results">No entries to show.</div>'}</div></section><p class="data-footnote">Showing up to 100 records. A title record does not necessarily include a complete lyric or associated tune.</p>`;
}
function renderSaved() {
  const records=data.rows.filter(r=>saved.has(r.textAuthNumber));
  return `<div class="page-head compact"><div><span class="eyebrow">KEPT CLOSE</span><h1>Your <em>saved songs.</em></h1><p class="page-lede">A small shelf for texts you want to find again.</p></div></div>${data.searchBusy?'<div class="loading"><span class="spinner"></span>Opening saved hymns…</div>':records.length?`<section class="results-panel browse-results"><div class="results-list">${records.map(resultCard).join('')}</div></section>`:`<div class="empty-state"><span>${icon('heart')}</span><h2>Make this shelf your own.</h2><p>Save a text from its catalog record and it will appear here.</p><button class="btn btn-dark" data-view="hymns">Explore hymns ${icon('arrow')}</button></div>`}`;
}
const orderKinds=['Prelude','Opening hymn','Congregational singing','Offertory','Invitation','Closing hymn'];
function renderOrder(){return `<div class="page-head compact"><div><span class="eyebrow">THE SERVICE, IN SONG</span><h1>Order of <em>service.</em></h1><p class="page-lede">Collect the songs and shape a thoughtful service flow.</p></div><button class="btn btn-outline" data-clear-service>Clear service</button></div><div class="order-layout"><section class="service-list" id="service-list">${service.length?service.map((s,i)=>`<div class="service-item" draggable="true" data-order="${i}"><span class="drag">${icon('grip')}</span><span class="service-number">${String(i+1).padStart(2,'0')}</span><div class="service-copy"><span class="eyebrow">${esc(s.kind || 'Congregational singing')}</span><strong>${esc(s.title)}</strong><span>${esc(s.firstLine)}</span></div><button class="icon-button" data-remove-service="${i}" aria-label="Remove ${esc(s.title)}">${icon('close')}</button></div>`).join(''):`<div class="empty-state"><span>${icon('list')}</span><h2>A service starts with a song.</h2><p>Add a text from the hymnal catalog to begin your order.</p><button class="btn btn-dark" data-view="hymns">Find a hymn ${icon('arrow')}</button></div>`}</section><aside class="order-aside"><span class="eyebrow">SERVICE FLOW</span><h2>Set the rhythm.</h2><p>Arrange the songs in your order of service. Drag any song to move it.</p><button class="btn btn-gold" data-view="hymns">${icon('plus')} Add a song</button><div class="flow-list">${orderKinds.map((k,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span>${k}</div>`).join('')}</div></aside></div>`;}
function renderData(){const sets=[['Texts','Open hymn texts, opening lines, authors and languages.','texts.csv','53.2 MB','290,129 rows','file'],['Tunes','Tune names, composers, meters, keys and source notes.','tunes.csv','24.7 MB','Tune catalog','music'],['People','Hymn writers, translators, composers and dates.','people.csv','2.0 MB','People index','people'],['Hymnals','Published hymnal titles, editors, publishers and dates.','hymnals.csv','1.1 MB','Hymnal catalog','library']];return `<div class="page-head compact"><div><span class="eyebrow">FOR CHOIR LEADERS & BUILDERS</span><h1>Open <em>hymnology.</em></h1><p class="page-lede">The catalog datasets provided with this app, ready to explore or download.</p></div></div><div class="data-callout"><span>${icon('sparkle')}</span><div><strong>Open records, thoughtfully handled.</strong><p>These files are source catalogs. They don’t include complete hymn lyrics, a verified scripture index or a direct search API.</p></div></div><div class="dataset-grid">${sets.map(([name,desc,file,size,count,mark])=>`<article class="dataset-card"><div class="dataset-icon">${icon(mark)}</div><span class="eyebrow">${count}</span><h2>${name}</h2><p>${desc}</p><a class="download-link" href="/data/${file}" download>Download CSV <span>${size} ${icon('stage')}</span></a></article>`).join('')}</div><div class="data-method"><div><span class="eyebrow">DATA COVERAGE</span><h2>Built from catalog records.</h2><p>The texts file has 290,129 entries. Each entry may include a title, an opening line, language, attribution, meter and an instance count. Hymnal publication records are available separately; individual hymn-to-hymnal page mappings are not included in the supplied file.</p></div><div class="language-tags">${['English · 157,343','Tagalog · 226','Filipino · 21','Cebuano · 2','Ilocano · 2'].map(x=>`<span>${x}</span>`).join('')}</div></div>`;}
function render() {
  const view = data.view;
  const title=nav.find(n=>n[0]===view)?.[2] || 'Hymns';
  app.innerHTML=`<div class="app-shell"><aside class="sidebar"><a class="brand" href="#hymns"><img src="/hymnal-icon.svg" alt=""/><span>Bilingual<br/><em>Baptist Hymnal</em></span></a><div class="sidebar-label">YOUR HYMNAL</div><nav>${nav.map(([id,iconName,label])=>`<button class="nav-item ${view===id?'active':''}" data-view="${id}"><span class="nav-icon">${icon(iconName)}</span>${label}${id==='saved'&&saved.size?`<span class="nav-count">${saved.size}</span>`:''}</button>`).join('')}</nav><div class="sidebar-bottom"><span class="offline-dot"></span><div><strong>Ready for worship</strong><p>Search works offline after the catalog is downloaded.</p></div><button class="theme-toggle" title="Toggle dark mode" data-theme>${icon('moon')}</button></div></aside><main class="main"><header class="mobile-header"><a class="brand" href="#hymns"><img src="/hymnal-icon.svg" alt=""/><span>Bilingual Baptist<br/><em>Hymnal</em></span></a><span class="mobile-offline"><i></i> OFFLINE READY</span></header><div class="topbar"><span>${esc(title)} <span class="top-sep">/</span> <span class="top-context">A bilingual companion for congregational singing</span></span><button class="stage-link" data-stage>${icon('stage')} <span>Stage view</span></button></div><div class="page-content">${view==='hymns'?renderHymns():view==='browse'?renderBrowse():view==='saved'?renderSaved():view==='order'?renderOrder():renderData()}</div><footer class="footer"><span>MADE FOR THE MOMENTS WE SING TOGETHER.</span><span>BUILT FROM OPEN HYMNODY DATA</span></footer></main><nav class="mobile-nav" aria-label="Main navigation">${nav.map(([id,iconName,label])=>`<button class="mobile-nav-item ${view===id?'active':''}" data-view="${id}"><span class="nav-icon">${icon(iconName)}</span><small>${id==='order'?'Service':id==='data'?'Data':label}</small></button>`).join('')}</nav></div><div class="toast" role="status" aria-live="polite"></div>`;
  bind();
}
function announce(msg){const t=$('.toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function bind(){
  $$('[data-view]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.view)));
  $$('[data-filter]').forEach(el=>el.addEventListener('click',()=>{data.filter=el.dataset.filter;render()}));
  $$('[data-browse]').forEach(el=>el.addEventListener('click',()=>{data.browse=el.dataset.browse;render()}));
  $('#query')?.addEventListener('input',e=>{data.query=e.target.value;const params=new URLSearchParams(location.search);data.query?params.set('q',data.query):params.delete('q');params.delete('export');const queryString=params.toString();history.replaceState(null,'',`${location.pathname}${queryString?`?${queryString}`:''}${location.hash}`);const pos=e.target.selectionStart;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{render();const input=$('#query');input?.focus();input?.setSelectionRange(pos,pos);},150)});
  $('#query')?.addEventListener('keydown',e=>{if(e.key!=='Enter')return;const row=results(data.query,1)[0];if(!row)return;data.selected=row.textAuthNumber;if(data.view==='hymns')render();else{data.detailRow=row;showQuickDetail(row)}});
  $$('[data-result]').forEach(el=>el.addEventListener('click',()=>{data.selected=el.dataset.result;if(data.view==='hymns'){render()}else{const found=data.rows.find(r=>r.textAuthNumber===el.dataset.result);if(found){data.detailRow=found;showQuickDetail(found)}}}));
  $$('[data-save]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.save;if(saved.has(id))saved.delete(id);else saved.add(id);localStorage.setItem('bbh-saved',JSON.stringify([...saved]));render()}));
  $$('[data-add-service]').forEach(el=>el.addEventListener('click',()=>{const r=data.rows.find(x=>x.textAuthNumber===el.dataset.addService);if(!r)return;service.push({id:r.textAuthNumber,title:r.displayTitle||r.textTitle,firstLine:r.firstLine||'Opening line not listed',kind:'Congregational singing'});saveService();announce('Added to your order of service.');render()}));
  $$('[data-remove-service]').forEach(el=>el.addEventListener('click',()=>{service.splice(+el.dataset.removeService,1);saveService();render()}));
  $('[data-clear-service]')?.addEventListener('click',()=>{service=[];saveService();render()});
  $('[data-theme]')?.addEventListener('click',()=>{document.documentElement.classList.toggle('dark');localStorage.setItem('bbh-theme',document.documentElement.classList.contains('dark')?'dark':'light')});
  $('[data-stage]')?.addEventListener('click',openStage);
  let keyShift=0,tempo=72,playing=false;
  $$('[data-key]').forEach(el=>el.addEventListener('click',()=>{keyShift=Math.max(-6,Math.min(6,keyShift+Number(el.dataset.key)));const notes=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];$$('#key-label').forEach(x=>x.textContent=notes[(keyShift+12)%12])}));
  $$('[data-tempo]').forEach(el=>el.addEventListener('click',()=>{tempo=tempo>=120?60:tempo+12;$$('#tempo-label').forEach(x=>x.textContent=tempo)}));
  $$('[data-play]').forEach(el=>el.addEventListener('click',async()=>{if(playing)return;playing=true;el.innerHTML=`${icon('stop')} <span>Playing</span>`;try{audioCtx ||= new AudioContext();await audioCtx.resume();const start=audioCtx.currentTime,beat=60/tempo,chords=[[261.63,329.63,392,523.25],[220,261.63,329.63,440],[174.61,220,261.63,349.23],[196,246.94,293.66,392]];chords.forEach((chord,i)=>chord.forEach(hz=>{const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='triangle';osc.frequency.value=hz*Math.pow(2,keyShift/12);gain.gain.setValueAtTime(0,start+i*beat);gain.gain.linearRampToValueAtTime(.025,start+i*beat+.06);gain.gain.setValueAtTime(.025,start+i*beat+beat*.72);gain.gain.linearRampToValueAtTime(0,start+i*beat+beat*.9);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(start+i*beat);osc.stop(start+i*beat+beat)}));setTimeout(()=>{playing=false;$$('[data-play]').forEach(b=>b.innerHTML=`${icon('play')} <span>Play</span>`)},chords.length*beat*1000)}catch{playing=false;el.innerHTML=`${icon('play')} <span>Play</span>`;announce('Audio is unavailable in this browser.')}}));
  $('[data-retry]')?.addEventListener('click',()=>{data.indexError='';loadIndex()});
  $('[data-export]')?.addEventListener('click',exportCsv);
  $$('[data-order]').forEach(el=>{el.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',el.dataset.order));el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();const from=+e.dataTransfer.getData('text/plain'),to=+el.dataset.order;const [item]=service.splice(from,1);service.splice(to,0,item);saveService();render()})});
}
function $$(s,root=document){return [...root.querySelectorAll(s)]}
function saveService(){localStorage.setItem('bbh-service',JSON.stringify(service))}
function exportCsv(){const rows=results(data.query,Infinity);if(!rows.length){announce('No records match this search.');return}const keys=['displayTitle','firstLine','textTitle','refrainFirstLine','textAuthNumber','languages','authors','yearsWrote','meter','totalInstances'];const q=s=>`"${String(s??'').replace(/"/g,'""')}"`;const csv=[keys.map(q).join(','),...rows.map(r=>keys.map(k=>q(r[k])).join(','))].join('\r\n');const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='hymnal-search-results.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1200)}
function go(view){if(view==='hymns'){data.query='';data.selected=null}data.view=view;location.hash=view;render();if(view!=='data'&&!data.rows.length&&!data.searchBusy)loadIndex()}
function showQuickDetail(row){const prev=$('.quick-detail-backdrop');prev?.remove();const wrap=document.createElement('div');wrap.className='quick-detail-backdrop';wrap.innerHTML=`<div class="quick-detail">${detail(row)}<button class="quick-close" aria-label="Close">${icon('close')}</button></div>`;document.body.append(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap||e.target.closest('.quick-close'))wrap.remove()});bindQuick(wrap)}
function bindQuick(wrap){wrap.querySelector('[data-save]')?.addEventListener('click',e=>{const id=e.currentTarget.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);localStorage.setItem('bbh-saved',JSON.stringify([...saved]));wrap.remove();render()});wrap.querySelector('[data-add-service]')?.addEventListener('click',e=>{const r=data.detailRow;service.push({id:r.textAuthNumber,title:r.displayTitle||r.textTitle,firstLine:r.firstLine||'Opening line not listed',kind:'Congregational singing'});saveService();wrap.remove();announce('Added to your order of service.')})}
function openStage(){const row=data.rows.find(r=>r.textAuthNumber===data.selected)||results('',1)[0];if(!row){announce('Load the index to open stage view.');return}const w=window.open('','_blank');if(!w)return;w.document.write(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stage · Bilingual Baptist Hymnal</title><style>body{margin:0;background:#003049;color:#fff7e8;font:clamp(22px,3.5vw,54px)/1.55 Georgia,serif;display:grid;place-items:center;min-height:100vh;text-align:center;padding:4rem;box-sizing:border-box}small{display:block;font:600 12px/1 sans-serif;letter-spacing:.18em;color:#ffca4b;margin:1rem}h1{font-size:1.5em;margin:.6em auto;max-width:24ch}p{max-width:42ch;margin:1em auto}.meta{font:16px sans-serif;color:#a6c7d7}</style></head><body><main><small>TEXT CATALOG · OPENING LINE</small><h1>${esc(row.displayTitle||row.textTitle)}</h1><p>${esc(row.firstLine||'No opening line is listed.')}</p><div class="meta">${esc(row.languages||'Language not specified')} · ${esc(row.authors||'Author not listed')}</div></main></body></html>`);w.document.close()}
function init(){if(localStorage.getItem('bbh-theme')==='dark')document.documentElement.classList.add('dark');render();if(data.view!=='data')loadIndex();if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});}
window.addEventListener('hashchange',()=>{const route=location.hash.slice(1);if(nav.some(n=>n[0]===route)){data.view=route;render();if(route!=='data'&&!data.rows.length&&!data.searchBusy)loadIndex()}});
init();
