const $ = (s, root = document) => root.querySelector(s);
const app = $('#app');
const params = new URLSearchParams(location.search);
const validViews=['hymns','search','browse','saved','order','data','reader','player'];
const hashView=location.hash.slice(1).split('/')[0];
const data = { watchmanRows: [], metadataRows: [], view: validViews.includes(hashView)?hashView:'hymns', query: params.get('q') || '', filter: 'All languages', browse:'A–Z', browseTopic:'', selected: params.get('id') || localStorage.getItem('bbh-current') || null, returnView:'hymns', readerScale:1, searchLimit:80, searchBusy: false };
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
const nav = [['hymns','home','Hymns'],['search','search','Search'],['browse','library','Browse'],['saved','heart','Saved'],['order','list','Service']];
const mobileNav = nav;

async function loadWatchmanCollection(){
  if(data.watchmanRows.length)return;
  data.searchBusy=true;data.indexError='';render();
  try{
    const response=await fetch('/data/watchman-hymns.json');
    if(!response.ok)throw new Error('The full-lyrics collection could not be loaded.');
    const collection=await response.json();
    const hymns=Array.isArray(collection)?collection:collection.hymns;
    if(!Array.isArray(hymns))throw new Error('The full-lyrics collection could not be read.');
    data.watchmanRows=hymns.filter(h=>h&&Array.isArray(h.lyrics)&&h.lyrics.length).map(h=>{
      const lyrics=h.lyrics.filter(part=>part&&typeof part.content==='string'&&part.content.trim()).map((part,i)=>({
        number:part.verse||i+1,
        type:part.type==='chorus'?'chorus':'verse',
        text:part.content.trim()
      }));
      const firstVerse=lyrics.find(part=>part.type==='verse')||lyrics[0];
      return {
        textAuthNumber:`watchman_${h.id}`,
        displayTitle:h.title||`Watchman hymn ${h.number||h.id}`,
        textTitle:h.title||'',
        firstLine:firstVerse?.text.split(/\r?\n/)[0]||'',
        refrainFirstLine:'',
        languages:'English',
        authors:h.author||'',
        yearsWrote:'',meter:'',totalInstances:'1',
        supplemental:true,
        hymnNumber:h.number||String(h.id),
        category:h.category||'',
        sourceCollection:'Watchman · Open Hymnal JSON',
        fullTextData:{language:'English',source:'Open Hymnal JSON · Watchman collection',verses:lyrics}
      };
    });
    try{
      const indexResponse=await fetch('/data/gospel-hymn-index.json');
      if(indexResponse.ok){
        const index=await indexResponse.json();
        data.metadataRows=(Array.isArray(index.hymns)?index.hymns:[]).filter(h=>h&&h.title).map(h=>{
          const lyrics=(Array.isArray(h.lyrics)?h.lyrics:[]).filter(part=>part&&typeof part.content==='string'&&part.content.trim()).map((part,i)=>({
            number:part.number||i+1,
            type:part.type==='chorus'?'chorus':'verse',
            text:part.content.trim()
          }));
          const firstVerse=lyrics.find(part=>part.type==='verse')||lyrics[0];
          return {
            textAuthNumber:`gospel_index_${h.number}`,
            displayTitle:h.title,
            textTitle:h.title,
            firstLine:h.firstLine||firstVerse?.text.split(/\r?\n/)[0]||'',
            languages:'English',
            authors:'',
            supplemental:true,
            metadataOnly:!lyrics.length,
            hymnNumber:h.number,
            category:h.category||'',
            sourceCollection:'Gospel Hymns & Songs',
            sourceUrl:index.sourceUrl,
            fullTextData:lyrics.length?{language:'English',source:'Gospel Hymns & Songs · supplied text files',verses:lyrics}:null
          };
        });
      }
    }catch{}
    if(!data.watchmanRows.length)throw new Error('The full-lyrics collection is empty.');
  }catch(err){data.indexError=err.message||'The full-lyrics collection could not be loaded.'}
  data.searchBusy=false;render();
}

const languages = ['All languages','English'];
const langMatch = (row, lang) => lang === 'All languages' || (row.languages || '').toLowerCase().includes(lang.toLowerCase());
function allCatalogRows(){return [...data.watchmanRows,...data.metadataRows]}
function fullLyricsCount(){return data.watchmanRows.length+data.metadataRows.filter(row=>!row.metadataOnly).length}
function findText(id){return allCatalogRows().find(row=>row.textAuthNumber===id)}
function results(query = data.query, limit = 80) {
  const q = query.trim().toLocaleLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  const catalog=allCatalogRows();
  if (!terms.length) return catalog.filter(row=>langMatch(row,data.filter)).slice(0,limit);
  const hits = [];
  for (const row of catalog) {
      if (!langMatch(row, data.filter)) continue;
      const verses=row.fullTextData?.verses?.map(verse=>verse.text||'').join(' ')||'';
      const hay = `${row.displayTitle} ${row.textTitle} ${row.firstLine} ${row.refrainFirstLine} ${row.authors} ${row.textAuthNumber} ${row.hymnNumber} ${row.category} ${row.meter} ${row.languages} ${verses}`.toLocaleLowerCase();
      if (terms.every(term => hay.includes(term))) hits.push(row);
      if (hits.length >= limit) return hits;
    }
  return hits;
}
function chips(label, values) { return `<div class="pills" role="group" aria-label="${esc(label)}">${values.map(v=>`<button class="pill ${data.filter===v?'active':''}" data-filter="${esc(v)}">${esc(v)}</button>`).join('')}</div>`; }
function resultCard(row, i = 0) {
  const id = row.textAuthNumber || row.displayTitle;
  const summary=row.metadataOnly?[row.category,'Title and catalog details only · lyrics unavailable'].filter(Boolean).join(' · '):(row.firstLine || row.refrainFirstLine || 'Opening line not listed');
  const status=row.metadataOnly?'Metadata only · GHS':(row.languages || 'Language not specified');
  return `<button class="result-row ${data.selected===id?'chosen':''}" data-result="${esc(id)}"><span class="result-num">${row.supplemental?esc(row.hymnNumber):icon('arrow')}</span><span class="result-copy"><strong>${esc(row.displayTitle || row.textTitle || 'Untitled text')}</strong><span>${esc(summary)}</span></span><span class="result-lang">${esc(status)}</span></button>`;
}
function detail(row) {
  if (!row) return `<section class="reader-empty"><div class="empty-icon">${icon('music')}</div><h2>No hymn selected</h2><p>Choose a hymn to read its complete lyrics.</p><button class="btn btn-dark" data-view="search">${icon('search')} Find a hymn</button></section>`;
  if(row.metadataOnly)return `<section class="reader-view metadata-record"><header class="reader-toolbar"><button class="round-control" data-back aria-label="Back to catalog">${icon('back')}</button><span class="reader-record-label">CATALOG NO. ${esc(row.hymnNumber)}</span></header><span class="eyebrow">GOSPEL HYMNS &amp; SONGS · INDEX ENTRY</span><h1 class="reader-title">${esc(row.displayTitle)}</h1>${row.category?`<p class="reader-byline">Category: ${esc(row.category)}</p>`:''}<article class="reader-lyrics"><h2>Lyrics aren’t included in this catalog entry</h2><p>This entry contains its title, source hymn number, and category only.</p><a class="btn btn-outline" href="${esc(row.sourceUrl)}" target="_blank" rel="noopener">View source index ${icon('stage')}</a></article></section>`;
  const authors = row.authors ? row.authors.split(/\s*;\s*/).join(' · ') : '';
  const bylineText=[authors,row.yearsWrote,row.meter?`Meter ${row.meter}`:''].filter(Boolean).join(' · ');
  const language=esc(row.languages || 'Language not specified');
  const fullText=row.fullTextData;
  const lyricLanguage=(fullText?.language||row.languages||'').toLowerCase();
  const tagalogSource=/tagalog|filipino/.test(lyricLanguage);
  const fullVerses=Array.isArray(fullText?.verses)?fullText.verses.map((verse,i)=>({number:verse.number||i+1,type:verse.type||'verse',english:(verse.english||(!tagalogSource?verse.text:'')||'').trim(),tagalog:(verse.tagalog||(tagalogSource?verse.text:'')||'').trim()})).filter(verse=>verse.english||verse.tagalog):[];
  const renderVerse=(verse,key)=>`<p class="reader-verse ${verse.type==='chorus'?'chorus':''}"><span>${verse.type==='chorus'?'Chorus':`${esc(verse.number)}.`}</span> ${esc(verse[key])}</p>`;
  const hasBilingualText=fullVerses.length>0&&fullVerses.every(verse=>verse.english&&verse.tagalog);
  const sourceVerses=fullVerses.filter(verse=>tagalogSource?verse.tagalog:verse.english);
  const hasFullText=hasBilingualText||sourceVerses.length>0;
  const lyricContent=hasBilingualText?`<span class="eyebrow">FULL TEXT · ALIGNED TRANSLATION</span><div class="reader-bilingual">${[['English','english'],['Tagalog','tagalog']].map(([label,key])=>`<section class="reader-language-column"><h2>${label}</h2>${fullVerses.map(verse=>renderVerse(verse,key)).join('')}${key==='english'&&fullText.refrain?`<div class="reader-refrain"><span>REFRAIN</span><p>${esc(fullText.refrain)}</p></div>`:''}</section>`).join('')}</div>`:hasFullText?`<span class="eyebrow">FULL TEXT${fullText.language?` · ${esc(fullText.language)}`:''}</span>${sourceVerses.map(verse=>renderVerse(verse,tagalogSource?'tagalog':'english')).join('')}${fullText.refrain?`<section class="reader-refrain"><span>REFRAIN</span><p>${esc(fullText.refrain)}</p></section>`:''}`:`<span class="eyebrow">CATALOG OPENING LINE</span><p>${esc(row.firstLine || 'No opening line is available for this record.')}</p>${row.refrainFirstLine?`<section class="reader-refrain"><span>REFRAIN OPENING</span><p>${esc(row.refrainFirstLine)}</p></section>`:''}`;
  const sourceLabel=`NO. ${esc(row.hymnNumber)}`;
  return `<section class="reader-view" style="--reader-scale:${data.readerScale}"><header class="reader-toolbar"><button class="round-control" data-back aria-label="Back to ${esc(data.returnView==='search'?'search':data.returnView==='browse'?'browse':data.returnView==='saved'?'saved hymns':'hymns')}">${icon('back')}</button><span class="reader-record-label">${sourceLabel}</span><button class="round-control ${saved.has(row.textAuthNumber)?'is-saved':''}" data-save="${esc(row.textAuthNumber)}" aria-label="${saved.has(row.textAuthNumber)?'Remove from saved':'Save text'}">${icon('heart','save-icon')}</button><button class="round-control" data-share aria-label="Share text">${icon('share')}</button><button class="round-control text-size" data-text-size aria-label="Change text size">Aa</button></header>
    <div class="reader-language"><span>SOURCE LANGUAGE</span><strong>${language}</strong></div>
    <h1 class="reader-title">${esc(row.displayTitle || row.textTitle || 'Untitled text')}</h1>${bylineText?`<p class="reader-byline">${esc(bylineText)}</p>`:''}
    <article class="reader-lyrics ${hasFullText?'has-full-text':''}">${lyricContent}</article>
    <div class="reader-actions"><button class="btn btn-dark" data-stage>${icon('stage')} Stage view</button><button class="btn btn-outline" data-add-service="${esc(row.textAuthNumber)}">${icon('plus')} Add to service</button></div></section>`;
}
function featuredWatchman(){
  const rows=data.watchmanRows;
  if(!rows.length)return null;
  const slot=Math.floor(Date.now()/(12*60*60*1000));
  const key='bbh-featured-watchman';
  let previous=null;
  try{previous=JSON.parse(localStorage.getItem(key)||'null')}catch{}
  if(previous?.slot===slot&&Number.isInteger(previous.index)&&rows[previous.index])return rows[previous.index];
  let index=Math.floor(Math.random()*rows.length);
  if(rows.length>1&&previous?.index===index)index=(index+1+Math.floor(Math.random()*(rows.length-1)))%rows.length;
  try{localStorage.setItem(key,JSON.stringify({slot,index}))}catch{}
  return rows[index];
}
function renderHymns() {
  const featured=featuredWatchman();
  const date=new Intl.DateTimeFormat(undefined,{weekday:'long',month:'long',day:'numeric'}).format(new Date());
  const loading=data.searchBusy?'<p class="home-loading">Preparing the catalog…</p>':data.indexError?`<p class="home-loading">${esc(data.indexError)} <button class="text-button" data-retry>Try again</button></p>`:'';
  return `<section class="home-view"><header class="home-heading"><h1>Hymns</h1><p>${date}</p></header><article class="featured-hymn"><div class="featured-top"><span>FULL LYRICS COLLECTION</span><span>470+ HYMNS</span></div>${featured?`<h2>${esc(featured.displayTitle)}</h2><p>${esc(featured.authors||'Author not listed')}</p><button class="btn btn-gold" data-open-record="${esc(featured.textAuthNumber)}">Open hymn ${icon('arrow')}</button>`:`<h2>300 hymns with full lyrics</h2><p>Loading the collection…</p>${loading}`}<span class="feature-glow" aria-hidden="true"></span></article><button class="home-search" data-view="search">${icon('search')}<span>Search titles, hymn numbers, or lyrics</span>${icon('arrow')}</button><section class="home-browse"><h2>Browse the hymnal</h2><div class="home-shortcuts"><button data-browse-mode="A–Z">A–Z</button><button data-browse-mode="Number">Number</button><button data-browse-mode="Topic">Topic</button></div></section></section>`;
}
function renderSearch(){
  const found=data.query?results(data.query,data.searchLimit+1):[];
  const hasMore=found.length>data.searchLimit;
  const matches=found.slice(0,data.searchLimit);
  const body=data.searchBusy?'<div class="loading"><span class="spinner"></span>Preparing the full-lyrics collection…</div>':data.indexError?`<div class="notice">${esc(data.indexError)} <button class="text-button" data-retry>Try again</button></div>`:!data.query?`<div class="search-prompt"><span>${icon('search')}</span><h2>Search the hymnal</h2><p>Search hymn titles, numbers, and complete lyrics.</p></div>`:matches.length?`<div class="results-panel search-results"><div class="panel-heading"><h2>${hasMore?`Showing ${matches.length} of more hymns`:`All ${matches.length} matching hymns`} for “${esc(data.query)}”</h2></div><div class="results-list">${matches.map(resultCard).join('')}</div>${hasMore?`<div class="load-more-wrap"><button class="btn btn-outline" data-load-more>Load 80 more results</button></div>`:''}</div>`:`<div class="empty-state"><span>${icon('search')}</span><h2>No matching hymns found</h2><p>Try a title, hymn number, or lyric phrase.</p><button class="btn btn-outline" data-clear-query>Clear search</button></div>`;
  return `<section class="search-view"><div class="search-toolbar"><button class="round-control" data-view="hymns" aria-label="Back to hymns">${icon('back')}</button><label class="search-box"><span class="search-glyph">${icon('search')}</span><input id="query" aria-label="Search hymn titles, numbers, or lyrics" value="${esc(data.query)}" type="search" placeholder="Search titles, numbers, or lyrics" autocomplete="off"/><kbd>${icon('enter')}</kbd></label></div><header class="page-head compact"><div><span class="eyebrow">${fullLyricsCount()||300} FULL-LYRIC HYMNS</span><h1>Search <em>the hymnal.</em></h1><p class="page-lede">Find hymns by title, source number, category, or lyric line.</p></div></header><div class="search-language">${chips('Filter by language',languages)}</div>${body}</section>`;
}
function renderBrowse() {
  const tabs=['A–Z','Number','Topic'];
  const topics=[
    {name:'Worship & Opening',key:'worship',categories:/praise and worship|adoration|hymns|jesus christ/i,terms:/praise|worship|glory|holy holy|majesty|adoration/},
    {name:'Believer’s Baptism',key:'baptism',categories:/baptism|salvation|christian life/i,terms:/baptis|born again|new birth|buried with christ|follow jesus/},
    {name:'Lord’s Supper',key:'supper',categories:/cross and blood|blood of jesus|the cross and blood/i,terms:/communion|lord.?s supper|bread and cup|blood of jesus|broken for me|sacrifice/},
    {name:'Invitation',key:'invitation',categories:/invitation|salvation|grace & forgiveness|admonition|warning/i,terms:/come to jesus|come unto|invitation|whosoever|sinner|repent|receive the saviour/},
    {name:'Missions',key:'missions',categories:/evangelism|christian service|gospel songs|commitment & consecration/i,terms:/mission|gospel|tell the story|preach|world.*know|send the light|rescue the perishing/}
  ];
  const catalogRows=allCatalogRows();
  const eligible=catalogRows.filter(r=>!r.metadataOnly&&langMatch(r,data.filter));
  const azRows=eligible.filter(r=>!data.query.trim()||`${r.displayTitle} ${r.textTitle}`.toLocaleLowerCase().includes(data.query.trim().toLocaleLowerCase())).sort((a,b)=>(a.displayTitle||a.textTitle||'').localeCompare(b.displayTitle||b.textTitle||'',undefined,{sensitivity:'base'}));
  const numbered=eligible.slice().sort((a,b)=>String(a.hymnNumber||'').localeCompare(String(b.hymnNumber||''),undefined,{numeric:true,sensitivity:'base'})||(a.displayTitle||'').localeCompare(b.displayTitle||'',undefined,{sensitivity:'base'}));
  const topicMatches=topic=>eligible.filter(row=>{
    const category=row.category||'';
    const text=`${row.displayTitle||''} ${row.firstLine||''} ${row.fullTextData?.verses?.map(v=>v.text||v.english||v.tagalog||'').join(' ')||''}`;
    return topic.categories.test(category)||topic.terms.test(text);
  });
  const selectedTopic=topics.find(topic=>topic.key===data.browseTopic);
  const topicRows=selectedTopic?topicMatches(selectedTopic):[];
  const topicContent=selectedTopic?`<button class="text-button topic-back" data-topic-back>All worship topics</button><div class="panel-heading"><h2>${esc(selectedTopic.name)} · ${topicRows.length} hymns</h2></div><section class="results-panel browse-results"><div class="results-list">${topicRows.map(resultCard).join('')||'<div class="no-results">No hymns are indexed for this topic yet.</div>'}</div></section>`:`<div class="topic-note">Choose a topic to see matching hymns from the full catalog.</div><div class="topic-list">${topics.map(topic=>`<button class="topic-row" data-topic="${topic.key}"><span class="topic-mark">${icon('music')}</span><span><strong>${esc(topic.name)}</strong><small>${topicMatches(topic).length} matching hymns</small></span>${icon('arrow')}</button>`).join('')}</div>`;
  const content=data.browse==='A–Z'?`<label class="search-box browse-search"><span class="search-glyph">${icon('search')}</span><input id="query" aria-label="Filter hymn titles A to Z" value="${esc(data.query)}" type="search" placeholder="Filter titles A–Z"/><kbd>${icon('enter')}</kbd></label><div class="panel-heading"><h2>${azRows.length} hymns · A–Z</h2></div><section class="results-panel browse-results"><div class="results-list">${azRows.map(resultCard).join('')||'<div class="no-results">No hymns to show.</div>'}</div></section>`:data.browse==='Number'?`<div class="panel-heading"><h2>${numbered.length} hymns · source number</h2></div><section class="results-panel browse-results"><div class="results-list">${numbered.map(resultCard).join('')}</div></section>`:topicContent;
  return `<section class="browse-view"><header class="page-head compact"><div><span class="eyebrow">${fullLyricsCount()||300} FULL-LYRIC HYMNS</span><h1>Browse <em>hymns.</em></h1><p class="page-lede">Explore the full-lyrics collection by title, source number, or worship topic.</p></div></header><div class="browse-tabs">${tabs.map(t=>`<button class="browse-tab ${data.browse===t?'active':''}" data-browse="${t}">${t}</button>`).join('')}</div>${content}</section>`;
}
function renderReader(){const row=findText(data.selected);return `<section class="reader-page">${detail(row)}</section>`;}
function renderPlayer(){
  const row=findText(data.selected);
  if(!row)return `<section class="player-page"><button class="round-control" data-back>${icon('back')} Back</button>${detail(null)}</section>`;
  const notes=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
  const root=notes[(player.key+12)%12];
  const playerMeta=[row.authors?row.authors.split(/\s*;\s*/).join(' · '):'',row.yearsWrote,row.meter?`Meter ${row.meter}`:''].filter(Boolean).join(' · ');
  return `<section class="player-page"><header class="player-toolbar"><button class="round-control" data-back>${icon('back')} <span>Back</span></button><span>Practice player</span><button class="round-control ${saved.has(row.textAuthNumber)?'is-saved':''}" data-save="${esc(row.textAuthNumber)}" aria-label="${saved.has(row.textAuthNumber)?'Remove from saved':'Save text'}">${icon('heart')}</button></header><h1>${esc(row.displayTitle||row.textTitle||'Untitled text')}</h1>${playerMeta?`<p class="player-byline">${esc(playerMeta)}</p>`:''}<section class="player-card"><div class="player-controls"><button class="player-play" data-play aria-pressed="${player.playing}">${icon(player.playing?'stop':'play')} <span>${player.playing?'Stop':'Play practice'}</span></button><button class="player-adjust" data-key="-1" aria-label="Lower key">Key −</button><button class="player-adjust" data-key="1" aria-label="Raise key">Key +</button></div><div class="player-secondary"><div class="part-controls" aria-label="Practice parts">${Object.keys(player.parts).map(part=>`<button class="part-button ${player.parts[part]?'active':''}" data-part="${part}" aria-pressed="${player.parts[part]}">${part}</button>`).join('')}</div><button class="tempo-control" data-tempo>${icon('tempo')} ${player.tempo} BPM</button></div><div class="player-key">Practice key <strong id="player-key">${root}</strong></div></section><article class="player-excerpt"><span class="eyebrow">FIRST VERSE</span><p>${esc(row.firstLine||'Lyrics are included with this hymn.')}</p></article><aside class="player-note">${icon('info')}<p>The practice player synthesizes chords for key and tempo practice; it is not an SATB recording.</p></aside></section>`;
}
function renderSaved() {
  const records=allCatalogRows().filter(r=>saved.has(r.textAuthNumber));
  return `<div class="page-head compact"><div><span class="eyebrow">KEPT CLOSE</span><h1>Your <em>saved songs.</em></h1><p class="page-lede">A small shelf for texts you want to find again.</p></div></div>${data.searchBusy?'<div class="loading"><span class="spinner"></span>Opening saved hymns…</div>':records.length?`<section class="results-panel browse-results"><div class="results-list">${records.map(resultCard).join('')}</div></section>`:`<div class="empty-state"><span>${icon('heart')}</span><h2>Make this shelf your own.</h2><p>Save a text from its catalog record and it will appear here.</p><button class="btn btn-dark" data-view="hymns">Explore hymns ${icon('arrow')}</button></div>`}`;
}
const orderKinds=['Prelude','Opening hymn','Congregational singing','Offertory','Invitation','Closing hymn'];
function renderOrder(){return `<div class="page-head compact"><div><span class="eyebrow">THE SERVICE, IN SONG</span><h1>Order of <em>service.</em></h1><p class="page-lede">Collect the songs and shape a thoughtful service flow.</p></div><button class="btn btn-outline" data-clear-service>Clear service</button></div><div class="order-layout"><section class="service-list" id="service-list">${service.length?service.map((s,i)=>`<div class="service-item" draggable="true" data-order="${i}"><span class="drag">${icon('grip')}</span><span class="service-number">${String(i+1).padStart(2,'0')}</span><div class="service-copy"><span class="eyebrow">${esc(s.kind || 'Congregational singing')}</span><strong>${esc(s.title)}</strong><span>${esc(s.firstLine)}</span></div><div class="service-controls"><button class="icon-button" data-move-service="${i}" data-direction="-1" aria-label="Move ${esc(s.title)} up" ${i===0?'disabled':''}>${icon('up')}</button><button class="icon-button" data-move-service="${i}" data-direction="1" aria-label="Move ${esc(s.title)} down" ${i===service.length-1?'disabled':''}>${icon('down')}</button><button class="icon-button" data-remove-service="${i}" aria-label="Remove ${esc(s.title)}">${icon('close')}</button></div></div>`).join(''):`<div class="empty-state"><span>${icon('list')}</span><h2>A service starts with a song.</h2><p>Add a text from the hymnal catalog to begin your order.</p><button class="btn btn-dark" data-view="hymns">Find a hymn ${icon('arrow')}</button></div>`}</section><aside class="order-aside"><span class="eyebrow">SERVICE FLOW</span><h2>Set the rhythm.</h2><p>Arrange the songs in your order of service. Drag any song to move it, or use the arrow controls.</p><button class="btn btn-gold" data-view="search">${icon('plus')} Add a song</button><div class="flow-list">${orderKinds.map((k,i)=>`<div><span>${String(i+1).padStart(2,'0')}</span>${k}</div>`).join('')}</div></aside></div>`;}
function renderData(){return `<div class="page-head compact"><div><span class="eyebrow">OPEN HYMNOLOGY</span><h1>Hymn <em>datasets.</em></h1><p class="page-lede">All 468 English hymns include their available lyric text and source labels.</p></div></div><div class="data-callout"><span>${icon('sparkle')}</span><div><strong>${fullLyricsCount()||468} hymns with full lyrics.</strong><p>Search titles, source numbers, categories, and lyric lines across the collection. The lyrics open in the reader and Stage view.</p></div></div><div class="dataset-grid"><article class="dataset-card"><div class="dataset-icon">${icon('music')}</div><span class="eyebrow">${data.watchmanRows.length||300} HYMNS · ENGLISH</span><h2>Watchman full texts</h2><p>Complete available verse and chorus text from the Open Hymnal JSON Watchman collection.</p><a class="download-link" href="/data/watchman-hymns.json" download>Download JSON <span>535 KB ${icon('stage')}</span></a></article><article class="dataset-card"><div class="dataset-icon">${icon('database')}</div><span class="eyebrow">${data.metadataRows.length||168} HYMNS · ENGLISH</span><h2>Supplemental Gospel hymns</h2><p>168 additional hymns with lyrics parsed from the numbered text files supplied for this project. Source number and category are retained.</p><a class="download-link" href="/data/gospel-hymn-index.json" download>Download JSON <span>${icon('stage')}</span></a><p><a href="https://github.com/marvinjude/gospel-hymns/tree/master/Hymns" target="_blank" rel="noopener">View source collection ${icon('stage')}</a></p></article><article class="dataset-card"><div class="dataset-icon">${icon('file')}</div><span class="eyebrow">LICENSE</span><h2>MIT license</h2><p>License notice for the included Watchman collection.</p><a class="download-link" href="/data/watchman-hymns-LICENSE.txt" download>Download license <span>${icon('stage')}</span></a></article></div>`;}
function render() {
  const view = data.view;
  const parentView=view==='reader'||view==='player'?'hymns':view;
  const titleMap={hymns:'Hymns',search:'Search',browse:'Browse',saved:'Saved',order:'Order of service',data:'Open data',reader:'Reader',player:'Melody player'};
  const title=titleMap[view]||'Hymns';
  const page=view==='hymns'?renderHymns():view==='search'?renderSearch():view==='browse'?renderBrowse():view==='saved'?renderSaved():view==='order'?renderOrder():view==='data'?renderData():view==='reader'?renderReader():renderPlayer();
  const shellClass=`app-shell screen-${view}`;
  const hideStageLink=['saved','order'].includes(view);
  const topbar=`<div class="topbar"><span>${esc(title)} <span class="top-sep">/</span> <span class="top-context">A bilingual companion for congregational singing</span></span>${hideStageLink?'':`<button class="stage-link" data-stage>${icon('stage')} <span>Stage view</span></button>`}</div>`;
  app.innerHTML=`<div class="${shellClass}"><aside class="sidebar"><a class="brand sidebar-brand-logo" href="#hymns"><img src="/hymnal-logo.svg" alt="Bilingual Baptist Hymnal"/></a><div class="sidebar-label">YOUR HYMNAL</div><nav>${nav.map(([id,iconName,label])=>`<button class="nav-item ${parentView===id?'active':''}" data-view="${id}"><span class="nav-icon">${icon(iconName)}</span>${label}${id==='saved'&&saved.size?`<span class="nav-count">${saved.size}</span>`:''}</button>`).join('')}</nav><div class="sidebar-bottom"><span class="offline-dot"></span><div><strong>Ready for worship</strong></div><button class="theme-toggle" title="Toggle dark mode" data-theme>${icon('moon')}</button></div></aside><main class="main"><header class="mobile-header"><a class="brand mobile-brand-logo" href="#hymns"><img src="/hymnal-logo.svg" alt="Bilingual Baptist Hymnal"/></a></header>${topbar}<div class="page-content">${page}</div><footer class="footer"><span>MADE FOR THE MOMENTS WE SING TOGETHER.</span><span>BUILT FROM OPEN HYMNODY DATA</span></footer></main><nav class="mobile-nav" aria-label="Main navigation">${mobileNav.map(([id,iconName,label])=>`<button class="mobile-nav-item ${parentView===id?'active':''}" data-view="${id}" aria-label="${label}"><span class="nav-icon">${icon(iconName)}</span><small>${label}</small></button>`).join('')}</nav></div><div class="toast" role="status" aria-live="polite"></div>`;
  bind();
}
function announce(msg){const t=$('.toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function bind(){
  $$('[data-view]').forEach(el=>el.addEventListener('click',()=>go(el.dataset.view)));
  $$('[data-filter]').forEach(el=>el.addEventListener('click',()=>{data.filter=el.dataset.filter;data.searchLimit=80;render()}));
  $$('[data-browse]').forEach(el=>el.addEventListener('click',()=>{data.browse=el.dataset.browse;render()}));
  $$('[data-browse-mode]').forEach(el=>el.addEventListener('click',()=>{data.browse=el.dataset.browseMode;go('browse')}));
  $$('[data-topic]').forEach(el=>el.addEventListener('click',()=>{data.browseTopic=el.dataset.topic;render()}));
  $('[data-topic-back]')?.addEventListener('click',()=>{data.browseTopic='';render()});
  $('#query')?.addEventListener('input',e=>{data.query=e.target.value;data.searchLimit=80;const params=new URLSearchParams(location.search);data.query?params.set('q',data.query):params.delete('q');params.delete('export');const queryString=params.toString();history.replaceState(null,'',`${location.pathname}${queryString?`?${queryString}`:''}${location.hash}`);const pos=e.target.selectionStart;clearTimeout(searchTimer);searchTimer=setTimeout(()=>{render();const input=$('#query');input?.focus();input?.setSelectionRange(pos,pos);},150)});
  $('#query')?.addEventListener('keydown',e=>{if(e.key==='Enter'&&data.query.trim())go('search')});
  $$('[data-result]').forEach(el=>el.addEventListener('click',()=>{data.selected=el.dataset.result;localStorage.setItem('bbh-current',data.selected);data.returnView=['search','browse','saved'].includes(data.view)?data.view:'hymns';go('reader')}));
  $$('[data-open-record]').forEach(el=>el.addEventListener('click',()=>{data.selected=el.dataset.openRecord;localStorage.setItem('bbh-current',data.selected);data.returnView='hymns';go('reader')}));
  $$('[data-save]').forEach(el=>el.addEventListener('click',()=>{const id=el.dataset.save;if(saved.has(id))saved.delete(id);else saved.add(id);localStorage.setItem('bbh-saved',JSON.stringify([...saved]));render()}));
  $$('[data-add-service]').forEach(el=>el.addEventListener('click',()=>{const r=findText(el.dataset.addService);if(!r)return;service.push({id:r.textAuthNumber,title:r.displayTitle||r.textTitle,firstLine:r.firstLine||'Opening line not listed',kind:'Congregational singing'});saveService();render();announce('Added to your order of service.')}));
  $$('[data-remove-service]').forEach(el=>el.addEventListener('click',()=>{service.splice(+el.dataset.removeService,1);saveService();render()}));
  $$('[data-move-service]').forEach(el=>el.addEventListener('click',()=>{const from=+el.dataset.moveService,to=from+Number(el.dataset.direction);if(to<0||to>=service.length)return;const [item]=service.splice(from,1);service.splice(to,0,item);saveService();render()}));
  $('[data-clear-service]')?.addEventListener('click',()=>{service=[];saveService();render()});
  $('[data-theme]')?.addEventListener('click',()=>{document.documentElement.classList.toggle('dark');localStorage.setItem('bbh-theme',document.documentElement.classList.contains('dark')?'dark':'light')});
  $$('[data-stage]').forEach(el=>el.addEventListener('click',openStage));
  $('[data-back]')?.addEventListener('click',()=>go(data.view==='player'?'reader':data.returnView));
  $('[data-other-language]')?.addEventListener('click',el=>{data.filter=el.currentTarget.dataset.otherLanguage;data.query='';const params=new URLSearchParams(location.search);params.delete('q');history.replaceState(null,'',`${location.pathname}${params.toString()?`?${params}`:''}${location.hash}`);go('search')});
  $('[data-share]')?.addEventListener('click',shareCurrent);
  $('[data-text-size]')?.addEventListener('click',()=>{data.readerScale=data.readerScale>=1.2?1:data.readerScale+.1;render()});
  $$('[data-key]').forEach(el=>el.addEventListener('click',()=>{player.key=Math.max(-6,Math.min(6,player.key+Number(el.dataset.key)));const label=$('#player-key');if(label){const notes=['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];label.textContent=notes[(player.key+12)%12]}}));
  $('[data-tempo]')?.addEventListener('click',()=>{player.tempo=player.tempo>=120?60:player.tempo+12;render()});
  $$('[data-part]').forEach(el=>el.addEventListener('click',()=>{player.parts[el.dataset.part]=!player.parts[el.dataset.part];el.classList.toggle('active',player.parts[el.dataset.part]);el.setAttribute('aria-pressed',String(player.parts[el.dataset.part]))}));
  $$('[data-play]').forEach(el=>el.addEventListener('click',startPractice));
  $('[data-clear-query]')?.addEventListener('click',()=>{data.query='';const params=new URLSearchParams(location.search);params.delete('q');history.replaceState(null,'',`${location.pathname}${params.toString()?`?${params}`:''}#search`);render();$('#query')?.focus()});
  $('[data-retry]')?.addEventListener('click',()=>{data.indexError='';data.watchmanRows=[];loadWatchmanCollection()});
  $('[data-load-more]')?.addEventListener('click',()=>{data.searchLimit+=80;render()});
  $$('[data-order]').forEach(el=>{el.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',el.dataset.order));el.addEventListener('dragover',e=>e.preventDefault());el.addEventListener('drop',e=>{e.preventDefault();const from=+e.dataTransfer.getData('text/plain'),to=+el.dataset.order;const [item]=service.splice(from,1);service.splice(to,0,item);saveService();render()})});
}
function $$(s,root=document){return [...root.querySelectorAll(s)]}
function saveService(){localStorage.setItem('bbh-service',JSON.stringify(service))}
function go(view){if(!validViews.includes(view))return;if(data.view==='player'&&view!=='player')stopPractice();if(view==='hymns'){data.query='';const params=new URLSearchParams(location.search);params.delete('q');history.replaceState(null,'',`${location.pathname}${params.toString()?`?${params}`:''}#hymns`)}data.view=view;location.hash=view;render()}
function shareCurrent(){const row=findText(data.selected);if(!row)return;const url=new URL(location.href);url.searchParams.set('id',row.textAuthNumber);url.hash='reader';if(navigator.share){navigator.share({title:row.displayTitle||row.textTitle||'Hymnal text',url:url.toString()}).catch(()=>{})}else if(navigator.clipboard){navigator.clipboard.writeText(url.toString()).then(()=>announce('Link copied.')).catch(()=>announce('Sharing is unavailable in this browser.'))}else announce('Sharing is unavailable in this browser.')}
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
function openStage(){
  const row=findText(data.selected)||results('',1)[0];
  if(!row){announce('Load the full-lyrics collection to open Stage view.');return}
  if(row.metadataOnly){announce('Stage view is available for full-lyrics hymns only.');return}
  const w=window.open('','_blank');
  if(!w){announce('Allow pop-ups to open the full-screen Stage view.');return}
  const verses=row.fullTextData?.verses||[];
  const lyricHtml=verses.length?verses.map(verse=>`<p>${esc(verse.text||verse.english||verse.tagalog||'').replace(/\r?\n/g,'<br>')}</p>`).join(''): `<p>${esc(row.firstLine||'Lyrics are included with this hymn.')}</p>`;
  const meta=[row.languages||'English',row.authors?row.authors.split(/\s*;\s*/).join(' · '):''].filter(Boolean).map(esc).join(' · ');
  const source=esc((row.sourceCollection||'Hymnal collection').toUpperCase());
  w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#003049"><title>Stage · ${esc(row.displayTitle||row.textTitle)} · Bilingual Baptist Hymnal</title><style>
    *{box-sizing:border-box}html{min-height:100%;background:#003049;scroll-behavior:smooth}body{margin:0;min-height:100vh;min-height:100dvh;overflow-y:auto;background:#003049;color:#fff7e8;text-align:center;font-family:Georgia,"Times New Roman",serif}main{width:min(100%,1600px);min-height:100vh;min-height:100dvh;margin:0 auto;padding:clamp(34px,6vh,90px) clamp(22px,7vw,120px) max(48px,env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:center;justify-content:center}small{display:block;font:700 12px/1.5 system-ui,sans-serif;letter-spacing:.18em;color:#ffca4b;margin:0 0 clamp(28px,6vh,82px);text-transform:uppercase}h1{width:100%;font-size:clamp(42px,8vw,112px);line-height:1.08;margin:0 auto clamp(30px,6vh,78px);max-width:18ch;overflow-wrap:anywhere}.lyrics{width:100%;font-size:clamp(25px,4vw,62px);line-height:1.55}.lyrics p{max-width:30ch;margin:0 auto 14px;white-space:normal;overflow-wrap:anywhere}.meta{font:15px/1.5 system-ui,sans-serif;color:#a6c7d7;margin-top:clamp(32px,7vh,90px)}@media(max-width:600px){main{justify-content:flex-start;padding-top:max(42px,8vh)}small{font-size:10px;letter-spacing:.13em;margin-bottom:42px}h1{font-size:clamp(38px,10vw,58px);margin-bottom:44px}.lyrics{font-size:clamp(24px,7vw,36px);line-height:1.5}.lyrics p{margin-bottom:24px}}
    </style></head><body><main><small>${source} · FULL LYRICS · NO. ${esc(row.hymnNumber)}</small><h1>${esc(row.displayTitle||row.textTitle)}</h1><section class="lyrics" aria-label="Complete hymn lyrics">${lyricHtml}</section><div class="meta">${meta}</div></main></body></html>`);
  w.document.close();
}
function init(){if(localStorage.getItem('bbh-theme')==='dark')document.documentElement.classList.add('dark');render();loadWatchmanCollection();if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{});}
window.addEventListener('hashchange',()=>{const route=location.hash.slice(1).split('/')[0];if(validViews.includes(route)){data.view=route;render()}});
init();
