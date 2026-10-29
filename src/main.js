const $ = (s, root = document) => root.querySelector(s);
const app = $('#app');
const params = new URLSearchParams(location.search);
const validViews=['hymns','search','browse','saved','order','data','reader','player'];
const hashView=location.hash.slice(1).split('/')[0];
const data = { rows: [], hymnalCount: null, view: validViews.includes(hashView)?hashView:'hymns', query: params.get('q') || '', filter: 'All languages', browse:'A–Z', selected: params.get('id') || localStorage.getItem('bbh-current') || null, returnView:'hymns', readerScale:1, searchLimit:80, searchBusy: false };
const player = { key:0, tempo:72, parts:{S:true,A:true,T:true,B:true}, playing:false, sources:[], timer:null, returnView:'reader' };
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
  ,back:'<path d="m15 18-6-6 6-6"/>',
  share:'<path d="M12 16V4m0 0L8 8m4-4 4 4"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  up:'<path d="m6 14 6-6 6 6"/>',
  down:'<path d="m6 10 6 6 6-6"/>'
};
const icon = (name, className='') => `<svg class="ui-icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.music}</svg>`;
const saved = new Set(JSON.parse(localStorage.getItem('bbh-saved') || '[]'));
let service = JSON.parse(localStorage.getItem('bbh-service') || '[]');
let searchTimer;
let audioCtx;
const nav = [['hymns','home','Hymns'],['search','search','Search'],['browse','library','Browse'],['saved','heart','Saved'],['order','list','Service'],['data','download','Open data']];
const mobileNav = nav.filter(([id])=>id!=='data');

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
  return `<button class="result-row ${data.selected===id?'chosen':''}" data-result="${esc(id)}"><span class="result-num">${icon('arrow')}</span><span class="result-copy"><strong>${esc(row.displayTitle || row.textTitle || 'Untitled text')}</strong><span>${esc(row.firstLine || row.refrainFirstLine || 'Opening line not listed')}</span></span><span class="result-lang">${esc(row.languages || 'Language not specified')}</span></button>`;
}
function detail(row) {
  if (!row) return `<section class="reader-empty"><div class="empty-icon">${icon('music')}</div><h2>No text selected</h2><p>Choose a catalog record from Search or Browse to read its available excerpt.</p><button class="btn btn-dark" data-view="search">${icon('search')} Find a text</button></section>`;
  const authors = row.authors ? row.authors.split(/\s*;\s*/).join(' · ') : 'Author not listed';
  const language=esc(row.languages || 'Language not specified');
  const alternateLanguage=/tagalog|filipino/i.test(row.languages||'')?'English':'Tagalog';
  return `<section class="reader-view" style="--reader-scale:${data.readerScale}"><header class="reader-toolbar"><button class="round-control" data-back aria-label="Back to ${esc(data.returnView==='search'?'search':data.returnView==='browse'?'browse':data.returnView==='saved'?'saved hymns':'hymns')}">${icon('back')}</button><span class="reader-record-label">TEXT RECORD</span><button class="round-control ${saved.has(row.textAuthNumber)?'is-saved':''}" data-save="${esc(row.textAuthNumber)}" aria-label="${saved.has(row.textAuthNumber)?'Remove from saved':'Save text'}">${icon('heart','save-icon')}</button><button class="round-control" data-share aria-label="Share text">${icon('share')}</button><button class="round-control text-size" data-text-size aria-label="Change text size">Aa</button></header>
    <div class="reader-language"><span>SOURCE LANGUAGE</span><strong>${language}</strong><button class="reader-language-link" data-other-language="${alternateLanguage}">Find ${alternateLanguage} texts</button></div>
    <h1 class="reader-title">${esc(row.displayTitle || row.textTitle || 'Untitled text')}</h1><p class="reader-byline">${esc(authors)}${row.yearsWrote?`, ${esc(row.yearsWrote)}`:''}${row.meter?` · Meter ${esc(row.meter)}`:''}</p>
    <article class="reader-lyrics"><span class="eyebrow">CATALOG OPENING LINE</span><p>${esc(row.firstLine || 'No opening line is available for this record.')}</p>${row.refrainFirstLine?`<section class="reader-refrain"><span>REFRAIN OPENING</span><p>${esc(row.refrainFirstLine)}</p></section>`:''}</article>
    <aside class="reader-note"><span>${icon('info')}</span><p>This CSV record contains an opening line, not complete verses. No verified translated counterpart is linked to this record.</p></aside>
    <a class="btn btn-outline source-text-link" href="https://hymnary.org/text/${encodeURIComponent(row.textAuthNumber)}" target="_blank" rel="noopener noreferrer">View full text &amp; versions on Hymnary.org ${icon('stage')}</a>
    <div class="reader-actions"><button class="btn btn-dark" data-practice>${icon('music')} Open practice player</button><button class="btn btn-outline" data-add-service="${esc(row.textAuthNumber)}">${icon('plus')} Add to service</button></div></section>`;
}
function renderHymns() {
  const featured=data.rows.find(r=>/amazing grace/i.test(r.displayTitle)&&/john newton/i.test(r.authors))||data.rows.find(r=>/amazing grace/i.test(r.displayTitle))||data.rows[0];
  const date=new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date());
  const loading=data.searchBusy?'<p class="home-loading">Preparing the catalog…</p>':data.indexError?`<p class="home-loading">${esc(data.indexError)} <button class="text-button" data-retry>Try again</button></p>`:'';
  return `<section class="home-view"><header class="home-heading"><h1>Hymns</h1><p>${date}</p></header><article class="featured-hymn"><div class="featured-top"><span>FEATURED TEXT</span><span>${featured?'CATALOG RECORD':'OFFLINE CATALOG'}</span></div>${featured?`<h2>${esc(featured.displayTitle)}</h2><p>${esc(featured.authors||'Author not listed')}${featured.yearsWrote?`, ${esc(featured.yearsWrote)}`:''}</p><button class="btn btn-gold" data-open-record="${esc(featured.textAuthNumber)}">Open text ${icon('arrow')}</button>`:`<h2>Hymns for worship</h2><p>Open the catalog to find a text.</p>${loading}`}<span class="feature-glow" aria-hidden="true"></span></article><button class="home-search" data-view="search">${icon('search')}<span>Search title, line or author</span>${icon('arrow')}</button><section class="home-browse"><h2>Browse the hymnal</h2><div class="home-shortcuts"><button data-browse-mode="A–Z">A–Z</button><button data-browse-mode="Number">Number</button><button data-browse-mode="Topic">Topic</button></div></section><section class="home-footnote"><span>${icon('database')}</span><p>Catalog records include opening lines. Full lyrics, hymn numbers, and verified translations are not included in the supplied text index. <button class="home-data-link" data-view="data">Open datasets</button></p></section></section>`;
}
function renderSearch(){
  const found=data.query?results(data.query,data.searchLimit+1):[];
  const hasMore=found.length>data.searchLimit;
  const matches=found.slice(0,data.searchLimit);
  const body=data.searchBusy?'<div class="loading"><span class="spinner"></span>Preparing the catalog…</div>':data.indexError?`<div class="notice">${esc(data.indexError)} <button class="text-button" data-retry>Try again</button></div>`:!data.query?`<div class="search-prompt"><span>${icon('search')}</span><h2>Search the hymnal</h2><p>Search by title, opening line, author, language, or catalog text ID.</p><p class="search-count">${data.rows.length.toLocaleString()} searchable text records</p></div>`:matches.length?`<div class="results-panel search-results"><div class="panel-heading"><h2>${hasMore?`Showing ${matches.length} of more matching texts`:`All ${matches.length} matching texts`} for “${esc(data.query)}”</h2><button class="subtle-btn" data-export>${icon('download')} Export CSV</button></div><div class="results-list">${matches.map(resultCard).join('')}</div>${hasMore?`<div class="load-more-wrap"><button class="btn btn-outline" data-load-more>Load 80 more results</button></div>`:''}</div>`:`<div class="empty-state"><span>${icon('search')}</span><h2>No matching texts found</h2><p>Try fewer words or clear the language filter.</p><button class="btn btn-outline" data-clear-query>Clear search</button></div>`;
  return `<section class="search-view"><div class="search-toolbar"><button class="round-control" data-view="hymns" aria-label="Back to hymns">${icon('back')}</button><label class="search-box"><span class="search-glyph">${icon('search')}</span><input id="query" aria-label="Search hymn catalog" value="${esc(data.query)}" type="search" placeholder="Search title, line or author" autocomplete="off"/><kbd>${icon('enter')}</kbd></label></div><header class="page-head compact"><div><span class="eyebrow">FIND A HYMN</span><h1>Search <em>the catalog.</em></h1><p class="page-lede">Search titles, opening lines, writers, languages, and text IDs.</p></div></header><div class="search-language">${chips('Filter by language',languages)}</div>${body}</section>`;
}
function renderBrowse() {
  const tabs=['A–Z','Number','Topic'];
  const topics=[['Worship & Opening','worship'],['Believer’s Baptism','baptism'],['Lord’s Supper','supper'],['Invitation','invitation'],['Missions','missions']];
  const key=data.browse==='A–Z'?'displayTitle':'languages';
  const pool=data.query?results(data.query,500):data.rows.filter(r=>langMatch(r,data.filter));
  const filtered=pool.slice().sort((a,b)=>(a[key]||'').localeCompare(b[key]||'')).slice(0,100);
  const content=data.browse==='A–Z'?`<label class="search-box browse-search"><span class="search-glyph">${icon('search')}</span><input id="query" aria-label="Filter titles A to Z" value="${esc(data.query)}" type="search" placeholder="Filter titles A–Z"/><kbd>${icon('enter')}</kbd></label><section class="results-panel browse-results"><div class="results-list">${filtered.map(resultCard).join('')||'<div class="no-results">No titles to show.</div>'}</div></section><p class="data-footnote">Showing up to 100 catalog text records in alphabetical order.</p>`:data.browse==='Number'?`<div class="browse-unavailable"><span>${icon('info')}</span><h2>Hymn numbers are not in this text index.</h2><p>The supplied hymnals file does not include links from text records to hymnal page or hymn numbers.</p><button class="btn btn-dark" data-view="data">${icon('download')} Open the hymnal data</button></div>`:`<div class="topic-note">Topic labels below search matching words in titles and opening lines. The source files do not contain verified topic tags.</div><div class="topic-list">${topics.map(([topic,term])=>`<button class="topic-row" data-topic="${esc(term)}"><span class="topic-mark">${icon('music')}</span><span><strong>${esc(topic)}</strong><small>Search for “${esc(term)}” in title and opening line</small></span>${icon('arrow')}</button>`).join('')}</div>`;
  return `<section class="browse-view"><header class="page-head compact"><div><span class="eyebrow">EXPLORE THE CATALOG</span><h1>Browse <em>hymns.</em></h1><p class="page-lede">${data.rows.length.toLocaleString()} text records available to explore.</p></div></header><div class="browse-tabs">${tabs.map(t=>`<button class="browse-tab ${data.browse===t?'active':''}" data-browse="${t}">${t}</button>`).join('')}</div>${content}</section>`;
}
function renderReader(){const row=data.rows.find(r=>r.textAuthNumber===data.selected);return `<section class="reader-page">${detail(row)}</section>`;}
function renderPlayer(){
  const row=data.rows.find(r=>r.textAuthNumber===data.selected);
  if(!row)return `<section class="player-page"><button class="round-control" data-back>${icon('back')} Back</button>${detail(null)}</section>`;
  const notes=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const root=notes[(player.key+12)%12];
  return `<section class="player-page"><header class="player-toolbar"><button class="round-control" data-back>${icon('back')} <span>Back</span></button><span>Practice player</span><button class="round-control ${saved.has(row.textAuthNumber)?'is-saved':''}" data-save="${esc(row.textAuthNumber)}" aria-label="${saved.has(row.textAuthNumber)?'Remove from saved':'Save text'}">${icon('heart')}</button></header><h1>${esc(row.displayTitle||row.textTitle||'Untitled text')}</h1><p class="player-byline">${esc(row.authors||'Author not listed')}${row.yearsWrote?`, ${esc(row.yearsWrote)}`:''}${row.meter?` · Meter ${esc(row.meter)}`:''}</p><section class="player-card"><div class="player-controls"><button class="player-play" data-play aria-pressed="${player.playing}">${icon(player.playing?'stop':'play')} <span>${player.playing?'Stop':'Play practice'}</span></button><button class="player-adjust" data-key="-1" aria-label="Lower key">Key −</button><button class="player-adjust" data-key="1" aria-label="Raise key">Key +</button></div><div class="player-secondary"><div class="part-controls" aria-label="Practice parts">${Object.keys(player.parts).map(part=>`<button class="part-button ${player.parts[part]?'active':''}" data-part="${part}" aria-pressed="${player.parts[part]}">${part}</button>`).join('')}</div><button class="tempo-control" data-tempo>${icon('tempo')} ${player.tempo} BPM</button></div><div class="player-key">Practice key <strong id="player-key">${root}</strong></div></section><article class="player-excerpt"><span class="eyebrow">CATALOG OPENING LINE</span><p>${esc(row.firstLine||'No opening line is available for this record.')}</p></article><aside class="player-note">${icon('info')}<p>This is a synthesized chord exercise for practice. It is not a transcription or recording of this hymn; no SATB arrangement was supplied.</p></aside></section>`;
}
function renderSaved() {
  const records=data.rows.filter(r=>saved.has(r.textAuthNumber));
  return `<div class="page-head compact"><div><span class="eyebrow">KEPT CLOSE</span><h1>Your <em>saved songs.</em></h1><p class="page-lede">A small shelf for texts you want to find again.</p></div></div>${data.searchBusy?'<div class="loading"><span class="spinner"></span>Opening saved hymns…</div>':records.length?`<section class="results-panel browse-results"><div class="results-list">${records.map(resultCard).join('')}</div></section>`:`<div class="empty-state"><span>${icon('heart')}</span><h2>Make this shelf your own.</h2><p>Save a text from its catalog record and it will appear here.</p><button class="btn btn-dark" data-view="hymns">Explore hymns ${icon('arrow')}</button></div>`}`;
}
const orderKinds=['Prelude','Opening hymn','Congregational singing','Offertory','Invitation','Closing hymn'];
function renderOrder(){return `<div class="page-head compact"><div><span class="eyebrow">THE SERVICE, IN SONG</span><h1>Order of <em>service.</em></h1><p class="page-lede">Collect the songs and shape a thoughtful service flow.</p></div><button class="btn btn-outline" data-clear-service>Clear service</button></div><div class="order-layout"><section class="service-list" id="service-list">${service.length?service.map((s,i)=>`<div class="service-item" draggable="true" data-order="${i}"><span class="drag">${icon('grip')}</span><span class="service-number">${String(i+1).padStart(2,'0')}</span><div class="service-copy"><span class="eyebrow">${esc(s.kind || 'Congregational singing')}</span><strong>${esc(s.title)}</strong><span>${esc(s.firstLine)}</span></div><div class="service-controls"><button class="icon-button" data-move-service="${i}" data-direction="-1" aria-label="Move ${esc(s.title)} up" ${i===0?'disabled':''}>${icon('up')}</button><button class="icon-button" data-move-service="${i}" data-direction="1" aria-label="Move ${esc(s.title)} down" ${i===service.length-1?'disabled':''}>${icon('down')}</button><button class="icon-button" data-remove-service="${i}" aria-label="Remove ${esc(s.title)}">${icon('close')}</button></div></div>`).join(''):`<div class="empty-state"><span>${icon('list')}</span><h2>A service starts with a song.</h2><p>Add a text from the hymnal catalog to begin your order.</p><button class="btn btn-dark" data-view="hymns">Find a hymn ${icon('arrow')}</button></div>`}</section><aside class="order-aside"><span class="eyebrow">SERVICE FLOW</span><h2>Set the rhythm.</h2><p>Arrange the songs in your order of service. Drag any song to move it, or use the arrow controls.</p><button class="btn btn-gold" data-view="search">${icon('plus')} Add a song</button><div class="flow-list">${orderKinds.map((k,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span>${k}</div>`).join('')}</div></aside></div>`;}
function renderData(){const sets=[['Texts','Open hymn texts, opening lines, authors and languages.','texts.csv','53.2 MB','290,129 rows','file'],['Tunes','Tune names, composers, meters, keys and source notes.','tunes.csv','24.7 MB','Tune catalog','music'],['People','Hymn writers, translators, composers and dates.','people.csv','2.0 MB','People index','people'],['Hymnals','Published hymnal titles, editors, publishers and dates.','hymnals.csv','1.1 MB','Hymnal catalog','library']];return `<div class="page-head compact"><div><span class="eyebrow">FOR CHOIR LEADERS & BUILDERS</span><h1>Open <em>hymnology.</em></h1><p class="page-lede">The catalog datasets provided with this app, ready to explore or download.</p></div></div><div class="data-callout"><span>${icon('sparkle')}</span><div><strong>Open records, thoughtfully handled.</strong><p>These files are source catalogs. They don’t include complete hymn lyrics, a verified scripture index or a direct search API.</p></div></div><div class="dataset-grid">${sets.map(([name,desc,file,size,count,mark])=>`<article class="dataset-card"><div class="dataset-icon">${icon(mark)}</div><span class="eyebrow">${count}</span><h2>${name}</h2><p>${desc}</p><a class="download-link" href="/data/${file}" download>Download CSV <span>${size} ${icon('stage')}</span></a></article>`).join('')}</div><div class="data-method"><div><span class="eyebrow">DATA COVERAGE</span><h2>Built from catalog records.</h2><p>The texts file has 290,129 entries. Each entry may include a title, an opening line, language, attribution, meter and an instance count. Hymnal publication records are available separately; individual hymn-to-hymnal page mappings are not included in the supplied file.</p></div><div class="language-tags">${['English · 157,343','Tagalog · 226','Filipino · 21','Cebuano · 2','Ilocano · 2'].map(x=>`<span>${x}</span>`).join('')}</div></div>`;}
function render() {
  const view = data.view;
  const parentView=view==='reader'||view==='player'?'hymns':view;
  const titleMap={hymns:'Hymns',search:'Search',browse:'Browse',saved:'Saved',order:'Order of service',data:'Open data',reader:'Reader',player:'Melody player'};
  const title=titleMap[view]||'Hymns';
  const page=view==='hymns'?renderHymns():view==='search'?renderSearch():view==='browse'?renderBrowse():view==='saved'?renderSaved():view==='order'?renderOrder():view==='data'?renderData():view==='reader'?renderReader():renderPlayer();
  const shellClass=`app-shell screen-${view}`;
  app.innerHTML=`<div class="${shellClass}"><aside class="sidebar"><a class="brand" href="#hymns"><img src="/hymnal-icon.svg" alt=""/><span>Bilingual<br/><em>Baptist Hymnal</em></span></a><div class="sidebar-label">YOUR HYMNAL</div><nav>${nav.map(([id,iconName,label])=>`<button class="nav-item ${parentView===id?'active':''}" data-view="${id}"><span class="nav-icon">${icon(iconName)}</span>${label}${id==='saved'&&saved.size?`<span class="nav-count">${saved.size}</span>`:''}</button>`).join('')}</nav><div class="sidebar-bottom"><span class="offline-dot"></span><div><strong>Ready for worship</strong><p>Search works offline after the catalog is downloaded.</p></div><button class="theme-toggle" title="Toggle dark mode" data-theme>${icon('moon')}</button></div></aside><main class="main"><header class="mobile-header"><a class="brand" href="#hymns"><img src="/hymnal-icon.svg" alt=""/><span>Bilingual Baptist<br/><em>Hymnal</em></span></a><span class="mobile-offline"><i></i> OFFLINE READY</span></header><div class="topbar"><span>${esc(title)} <span class="top-sep">/</span> <span class="top-context">A bilingual companion for congregational singing</span></span><button class="stage-link" data-stage>${icon('stage')} <span>Stage view</span></button></div><div class="page-content">${page}</div><footer class="footer"><span>MADE FOR THE MOMENTS WE SING TOGETHER.</span><span>BUILT FROM OPEN HYMNODY DATA</span></footer></main><nav class="mobile-nav" aria-label="Main navigation">${mobileNav.map(([id,iconName,label])=>`<button class="mobile-nav-item ${parentView===id?'active':''}" data-view="${id}" aria-label="${label}"><span class="nav-icon">${icon(iconName)}</span><small>${label}</small></button>`).join('')}</nav></div><div class="toast" role="status" aria-live="polite"></div>`;
  bind();
}
function announce(msg){const t=$('.toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function bind(){
  $$('[data-view]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.view)));
  $$('[data-filter]').forEach(el=>el.addEventListener('click',()=>{data.filter=el.dataset.filter;data.searchLimit=80;render()}));
  $$('[data-browse]').forEach(el=>el.addEventListener('click',()=>{data.browse=el.dataset.browse;render()}));
  $$('[data-browse-mode]').forEach(el=>el.addEventListener('click',()=>{data.browse=el.dataset.browseMode;go('browse')}));
  $$('[data-topic]').forEach(el=>el.addEventListener('click',()=>{data.query=el.dataset.topic;go('search')}));
  $('#query')?.addEventListener('input',e=>{data.query=e.target.value;data.searchLimit=80;const params=new URLSearchParams(location.search);data.query?params.set('q',data.query):params.delete('q');params.delete('export');const queryString=params.toString();history.replaceState(null,'',`${location.pathname}${queryString?`?${queryString}`:''}${location.hash}`);const pos=e.target.selectionStart;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{render();const input=$('#query');input?.focus();input?.setSelectionRange(pos,pos);},150)});
  $('#query')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&data.query.trim())go('search')});
  $$('[data-result]').forEach(el=>el.addEventListener('click',()=>{data.selected=el.dataset.result;localStorage.setItem('bbh-current',data.selected);data.returnView=['search','browse','saved'].includes(data.view)?data.view:'hymns';go('reader')}));
  $$('[data-open-record]').forEach(el=>el.addEventListener('click',()=>{data.selected=el.dataset.openRecord;localStorage.setItem('bbh-current',data.selected);data.returnView='hymns';go('reader')}));
  $$('[data-save]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.save;if(saved.has(id))saved.delete(id);else saved.add(id);localStorage.setItem('bbh-saved',JSON.stringify([...saved]));render()}));
  $$('[data-add-service]').forEach(el=>el.addEventListener('click',()=>{const r=data.rows.find(x=>x.textAuthNumber===el.dataset.addService);if(!r)return;service.push({id:r.textAuthNumber,title:r.displayTitle||r.textTitle,firstLine:r.firstLine||'Opening line not listed',kind:'Congregational singing'});saveService();render();announce('Added to your order of service.')}));
  $$('[data-remove-service]').forEach(el=>el.addEventListener('click',()=>{service.splice(+el.dataset.removeService,1);saveService();render()}));
  $$('[data-move-service]').forEach(el=>el.addEventListener('click',()=>{const from=+el.dataset.moveService,to=from+Number(el.dataset.direction);if(to<0||to>=service.length)return;const [item]=service.splice(from,1);service.splice(to,0,item);saveService();render()}));
  $('[data-clear-service]')?.addEventListener('click',()=>{service=[];saveService();render()});
  $('[data-theme]')?.addEventListener('click',()=>{document.documentElement.classList.toggle('dark');localStorage.setItem('bbh-theme',document.documentElement.classList.contains('dark')?'dark':'light')});
  $('[data-stage]')?.addEventListener('click',openStage);
  $('[data-back]')?.addEventListener('click',()=>go(data.view==='player'?'reader':data.returnView));
  $('[data-practice]')?.addEventListener('click',()=>{player.returnView='reader';go('player')});
  $('[data-other-language]')?.addEventListener('click',el=>{data.filter=el.currentTarget.dataset.otherLanguage;data.query='';const params=new URLSearchParams(location.search);params.delete('q');history.replaceState(null,'',`${location.pathname}${params.toString()?`?${params}`:''}${location.hash}`);go('search')});
  $('[data-share]')?.addEventListener('click',shareCurrent);
  $('[data-text-size]')?.addEventListener('click',()=>{data.readerScale=data.readerScale>=1.2?1:data.readerScale+.1;render()});
  $$('[data-key]').forEach(el=>el.addEventListener('click',()=>{player.key=Math.max(-6,Math.min(6,player.key+Number(el.dataset.key)));const label=$('#player-key');if(label){const notes=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];label.textContent=notes[(player.key+12)%12]}}));
  $('[data-tempo]')?.addEventListener('click',()=>{player.tempo=player.tempo>=120?60:player.tempo+12;render()});
  $$('[data-part]').forEach(el=>el.addEventListener('click',()=>{player.parts[el.dataset.part]=!player.parts[el.dataset.part];el.classList.toggle('active',player.parts[el.dataset.part]);el.setAttribute('aria-pressed',String(player.parts[el.dataset.part]))}));
  $$('[data-play]').forEach(el=>el.addEventListener('click',startPractice));
  $('[data-clear-query]')?.addEventListener('click',()=>{data.query='';const params=new URLSearchParams(location.search);params.delete('q');history.replaceState(null,'',`${location.pathname}${params.toString()?`?${params}`:''}#search`);render();$('#query')?.focus()});
  $('[data-retry]')?.addEventListener('click',()=>{data.indexError='';loadIndex()});
  $('[data-export]')?.addEventListener('click',exportCsv);
  $('[data-load-more]')?.addEventListener('click',()=>{data.searchLimit+=80;render()});
  $$('[data-order]').forEach(el=>{el.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',el.dataset.order));el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();const from=+e.dataTransfer.getData('text/plain'),to=+el.dataset.order;const [item]=service.splice(from,1);service.splice(to,0,item);saveService();render()})});
}
function $$(s,root=document){return [...root.querySelectorAll(s)]}
function saveService(){localStorage.setItem('bbh-service',JSON.stringify(service))}
function exportCsv(){const rows=results(data.query,Infinity);if(!rows.length){announce('No records match this search.');return}const keys=['displayTitle','firstLine','textTitle','refrainFirstLine','textAuthNumber','languages','authors','yearsWrote','meter','totalInstances'];const q=s=>`"${String(s??'').replace(/"/g,'""')}"`;const csv=[keys.map(q).join(','),...rows.map(r=>keys.map(k=>q(r[k])).join(','))].join('\r\n');const blob=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='hymnal-search-results.csv';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1200)}
function go(view){if(!validViews.includes(view))return;if(data.view==='player'&&view!=='player')stopPractice();if(view==='hymns'){data.query='';const params=new URLSearchParams(location.search);params.delete('q');history.replaceState(null,'',`${location.pathname}${params.toString()?`?${params}`:''}#hymns`)}data.view=view;location.hash=view;render();if(view!=='data'&&!data.rows.length&&!data.searchBusy)loadIndex()}
function shareCurrent(){const row=data.rows.find(r=>r.textAuthNumber===data.selected);if(!row)return;const url=new URL(location.href);url.searchParams.set('id',row.textAuthNumber);url.hash='reader';if(navigator.share){navigator.share({title:row.displayTitle||row.textTitle||'Hymnal text',url:url.toString()}).catch(()=>{})}else if(navigator.clipboard){navigator.clipboard.writeText(url.toString()).then(()=>announce('Link copied.')).catch(()=>announce('Sharing is unavailable in this browser.'))}else announce('Sharing is unavailable in this browser.')}
async function startPractice(){
  if(player.playing){stopPractice();return}
  if(!Object.values(player.parts).some(Boolean)){announce('Choose at least one practice part.');return}
  try{
    audioCtx ||= new AudioContext();await audioCtx.resume();
    player.playing=true;$$('[data-play]').forEach(b=>{b.innerHTML=`${icon('stop')} <span>Stop</span>`;b.setAttribute('aria-pressed','true')});
    const start=audioCtx.currentTime+.04,beat=60/player.tempo,transpose=Math.pow(2,player.key/12);
    const chords=[[261.63,329.63,392,523.25],[220,261.63,329.63,440],[174.61,220,261.63,349.23],[196,246.94,293.66,392]];
    chords.forEach((chord,i)=>chord.forEach((hz,partIndex)=>{const part=Object.keys(player.parts)[partIndex];if(!player.parts[part])return;const osc=audioCtx.createOscillator(),gain=audioCtx.createGain(),at=start+i*beat;osc.type='triangle';osc.frequency.value=hz*transpose;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.022,at+.06);gain.gain.setValueAtTime(.022,at+beat*.72);gain.gain.linearRampToValueAtTime(0,at+beat*.92);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(at);osc.stop(at+beat);player.sources.push(osc)}));
    player.timer=setTimeout(stopPractice,chords.length*beat*1000+100);
  }catch{stopPractice();announce('Audio is unavailable in this browser.')}
}
function stopPractice(){if(player.timer)clearTimeout(player.timer);player.timer=null;for(const source of player.sources){try{source.stop()}catch{}}player.sources=[];player.playing=false;$$('[data-play]').forEach(b=>{b.innerHTML=`${icon('play')} <span>Play practice</span>`;b.setAttribute('aria-pressed','false')})}
function showQuickDetail(row){const prev=$('.quick-detail-backdrop');prev?.remove();const wrap=document.createElement('div');wrap.className='quick-detail-backdrop';wrap.innerHTML=`<div class="quick-detail">${detail(row)}<button class="quick-close" aria-label="Close">${icon('close')}</button></div>`;document.body.append(wrap);wrap.addEventListener('click',e=>{if(e.target===wrap||e.target.closest('.quick-close'))wrap.remove()});bindQuick(wrap)}
function bindQuick(wrap){wrap.querySelector('[data-save]')?.addEventListener('click',e=>{const id=e.currentTarget.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);localStorage.setItem('bbh-saved',JSON.stringify([...saved]));wrap.remove();render()});wrap.querySelector('[data-add-service]')?.addEventListener('click',e=>{const r=data.detailRow;service.push({id:r.textAuthNumber,title:r.displayTitle||r.textTitle,firstLine:r.firstLine||'Opening line not listed',kind:'Congregational singing'});saveService();wrap.remove();announce('Added to your order of service.')})}
function openStage(){const row=data.rows.find(r=>r.textAuthNumber===data.selected)||results('',1)[0];if(!row){announce('Load the index to open stage view.');return}const w=window.open('','_blank');if(!w)return;w.document.write(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stage · Bilingual Baptist Hymnal</title><style>body{margin:0;background:#003049;color:#fff7e8;font:clamp(22px,3.5vw,54px)/1.55 Georgia,serif;display:grid;place-items:center;min-height:100vh;text-align:center;padding:4rem;box-sizing:border-box}small{display:block;font:600 12px/1 sans-serif;letter-spacing:.18em;color:#ffca4b;margin:1rem}h1{font-size:1.5em;margin:.6em auto;max-width:24ch}p{max-width:42ch;margin:1em auto}.meta{font:16px sans-serif;color:#a6c7d7}</style></head><body><main><small>TEXT CATALOG · OPENING LINE</small><h1>${esc(row.displayTitle||row.textTitle)}</h1><p>${esc(row.firstLine||'No opening line is listed.')}</p><div class="meta">${esc(row.languages||'Language not specified')} · ${esc(row.authors||'Author not listed')}</div></main></body></html>`);w.document.close()}
function init(){if(localStorage.getItem('bbh-theme')==='dark')document.documentElement.classList.add('dark');render();if(data.view!=='data')loadIndex();if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});}
window.addEventListener('hashchange',()=>{const route=location.hash.slice(1).split('/')[0];if(validViews.includes(route)){data.view=route;render();if(route!=='data'&&!data.rows.length&&!data.searchBusy)loadIndex()}});
init();
