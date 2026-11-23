/* Simple Bake FAQ: общий скрипт. Страницы рисуются из JSON в /faq/content/.
   Новый раздел: файл content/<id>.ru.json + строка в content/sections.json (ready:true). */
(function(){
'use strict';
var BASE='/faq/';
var LANGS=['ru','en','lt','uk'];
var EMBED=/[?&]embed=1(&|$|#)/.test(location.search);
var UI={
ru:{guide:'Инструкция',news:'Что нового',support:'Поддержка',all:'Разделы',searchLabel:'Поиск по инструкции',searchPh:'Например: как установить приложение',start:'Начать за 5 минут',found:'Найдено',nothing:'Ничего не найдено. Напишите нам, и мы добавим ответ.',short:'Коротко.',where:'Где нажать.',important:'Важно.',plan:'Тариф',added:'Добавлено: сборка',updated:'Обновлено: сборка',noAnswer:'Не нашли ответ? Напишите нам:',build:'Актуально для сборки',notReady:'Этот раздел ещё готовится.',home:'На главную инструкции',newsLead:'Короткие записи о том, что появилось в программе. Обновите приложение, и новое будет на месте.',newsRead:'Читать:',build2:'Сборка',notice:'',sections:'РАЗДЕЛЫ',crumb:'Инструкция',soon:'Скоро',stubLead:'Раздел готовится. Скоро здесь появится информация:',stubBack:'К оглавлению'},
en:{guide:'Guide',news:"What's new",support:'Support',all:'Sections',searchLabel:'Search the guide',searchPh:'For example: how to install the app',start:'Start in 5 minutes',found:'Found',nothing:'Nothing found. Write to us and we will add an answer.',short:'In short.',where:'Where to tap.',important:'Good to know.',plan:'Plan',added:'Added: build',updated:'Updated: build',noAnswer:"Can't find the answer? Write to us:",build:'Current for build',notReady:'This section is being prepared.',home:'Back to the guide',newsLead:'Short notes on what has appeared in the app. Update the app and the new features will be there.',newsRead:'Read:',build2:'Build',notice:'The guide is shown in English for now; a translation into your language is coming.',sections:'SECTIONS',crumb:'Guide',soon:'Soon',stubLead:'This section is being prepared. Coming soon:',stubBack:'Back to the guide'}
};
var BUILD='938';
var SUPPORT='simplebake.support@gmail.com';
function qs(n){var m=new RegExp('[?&]'+n+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1]):null}
function getLang(){
 var p=qs('lang');
 if(p&&LANGS.indexOf(p)>-1){if(!EMBED){try{if(p==='ru'||p==='en')localStorage.setItem('siteLang',p)}catch(e){}}return p}
 var s=null;try{s=localStorage.getItem('siteLang')}catch(e){}
 if(s==='ru'||s==='en')return s;
 var n=(navigator.language||'').toLowerCase().slice(0,2);
 return LANGS.indexOf(n)>-1?n:'en';
}
var LANG=getLang();
var T=UI[LANG==='ru'?'ru':'en'];
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
function multi(s){return esc(s).replace(/\n/g,'<br>')}
function getJSON(path){return fetch(path,{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(path+' '+r.status);return r.json()})}
function tx(o){if(o==null)return '';if(typeof o==='string')return o;return o[LANG]||o.ru||o.en||''}
function link(path,extra){var q=[];if(extra)q.push(extra);q.push('lang='+LANG);if(EMBED)q.push('embed=1');return path+'?'+q.join('&')}
var LMETA={en:{n:'English',e:'English'},ru:{n:'Русский',e:'Russian'},lt:{n:'Lietuvių',e:'Lithuanian',d:1},uk:{n:'Українська',e:'Ukrainian',d:1}};
function langSwitch(){
 var out='<div class="langs" id="langs"><button type="button" class="lang-btn" aria-haspopup="true" aria-expanded="false" aria-label="Language">'+LMETA[LANG].n+'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 9l7 7 7-7"/></svg></button><div class="lang-list">';
 LANGS.forEach(function(l){
  var u=location.search.replace(/([?&])lang=[^&]*&?/,'$1').replace(/[?&]$/,'');
  u=u+(u.indexOf('?')>-1?'&':'?')+'lang='+l;
  var m=LMETA[l],sel=l===LANG;
  out+='<a class="lang-item'+(sel?' selected':'')+'" href="'+esc(location.pathname+u+location.hash)+'"><span>'+m.n+' <span class="lang-hint">'+m.e+'</span>'+(m.d?'<span class="lang-draft">'+(LANG==='ru'?'Черновик':'Draft')+'</span>':'')+'</span>'+(sel?'<svg class="lang-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>':'')+'</a>';
 });
 return out+'</div></div>';
}
function bindShots(){
 document.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.shot-btn');
  if(!b)return;
  var o=document.createElement('div');o.className='lightbox';o.setAttribute('role','dialog');o.setAttribute('aria-label',b.getAttribute('data-alt')||'');
  o.innerHTML='<img src="'+b.getAttribute('data-full')+'" alt="'+(b.getAttribute('data-alt')||'')+'">';
  function close(){o.remove();document.removeEventListener('keydown',key)}
  function key(ev){if(ev.key==='Escape')close()}
  o.addEventListener('click',close);document.addEventListener('keydown',key);document.body.appendChild(o);
 });
}
function bindLang(){
 var w=document.getElementById('langs');if(!w)return;
 var b=w.querySelector('.lang-btn');
 b.addEventListener('click',function(e){e.stopPropagation();var o=w.classList.toggle('open');b.setAttribute('aria-expanded',o)});
 document.addEventListener('click',function(){w.classList.remove('open');b.setAttribute('aria-expanded','false')});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')w.classList.remove('open')});
}
function header(active){
 if(EMBED){return '<nav class="embedbar" aria-label="Main"><a href="'+link(BASE)+'"'+(active==='guide'?' aria-current="page"':'')+'>'+T.guide+'</a><a href="'+link(BASE+'news/')+'"'+(active==='news'?' aria-current="page"':'')+'>'+T.news+'</a></nav>'}
 return '<header class="top"><div class="wrap"><a class="wordmark" href="/">Simple Bake</a><nav class="main" aria-label="Main">'+
 '<a href="'+link(BASE)+'"'+(active==='guide'?' aria-current="page"':'')+'>'+T.guide+'</a>'+
 '<a href="'+link(BASE+'news/')+'"'+(active==='news'?' aria-current="page"':'')+'>'+T.news+'</a>'+
 '</nav>'+langSwitch()+'</div></header>';
}
function footer(){
 if(EMBED)return '';
 return '<footer class="bot"><div class="wrap"><span>'+T.noAnswer+' <a href="mailto:'+SUPPORT+'"'+(EMBED?' target="_top"':'')+'>'+SUPPORT+'</a></span><span>'+T.build+' '+BUILD+'</span></div></footer>';
}
function notice(){return (LANG==='lt'||LANG==='uk')?'<p class="notice">'+esc(UI.en.notice)+'</p>':''}
function shell(active,inner){
 document.documentElement.lang=LANG;
 document.getElementById('app').innerHTML=header(active)+'<main><div class="wrap">'+notice()+inner+'</div></main>'+footer();
 bindLang();
}
function readySections(list){return list.filter(function(s){return s.ready}).sort(function(a,b){return (a.order||0)-(b.order||0)})}
var CL=LANG==='ru'?'ru':'en';
function loadContent(name){return getJSON(BASE+'content/'+name+'.'+CL+'.json').catch(function(){return getJSON(BASE+'content/'+name+'.'+(CL==='ru'?'en':'ru')+'.json')})}
function loadSection(id){return loadContent(id)}
function allSections(list){return list.slice().sort(function(a,b){return (a.order||0)-(b.order||0)})}
function secLink(s){return link(BASE+'section/','s='+encodeURIComponent(s.id))}
function itemHTML(it){
 var h='<details class="item" id="i-'+esc(it.id)+'"><summary><span>'+esc(it.q)+'</span><span class="plus" aria-hidden="true">+</span></summary><div class="body">';
 function lab(l,t){return '<p><strong>'+l+'</strong>'+(t.indexOf('\n')>-1?'<br>':' ')+multi(t)+'</p>'}
 h+=lab(T.short,it.short);
 if(it.where)h+=lab(T.where,it.where);
 if(it.shots&&it.shots.length){
  h+='<div class="shots">'+it.shots.map(function(s){
   var src=BASE+'img/'+s.id+'.'+CL+'.webp',alt=esc(tx(s.alt)||tx(s.caption));
   return '<figure class="shot"><button type="button" class="shot-btn" data-full="'+esc(src)+'" data-alt="'+alt+'" aria-label="'+alt+'"><img src="'+esc(src)+'" alt="'+alt+'" loading="lazy" width="260"></button>'+(s.caption?'<figcaption>'+esc(tx(s.caption))+'</figcaption>':'')+'</figure>';
  }).join('')+'</div>';
 }
 if(it.important)h+=lab(T.important,it.important);
 h+='<div class="chips">';
 if(it.plan)h+='<span class="chip">'+T.plan+': '+esc(it.plan)+'</span>';
 var meta=[];if(it.added)meta.push(T.added+' '+esc(it.added));if(it.updated)meta.push(T.updated+' '+esc(it.updated));
 if(meta.length)h+='<span class="meta">'+meta.join(' · ')+'</span>';
 return h+'</div></div></details>';
}
/* ---------- главная ---------- */
function pageHome(){
 Promise.all([loadContent('home'),getJSON(BASE+'content/sections.json')]).then(function(r){
  var H=r[0],secs=readySections(r[1]);
  var h='<p class="eyebrow">'+esc(H.eyebrow)+'</p><h1>'+esc(H.title)+'</h1><p class="lead">'+esc(H.lead)+'</p>';
  h+='<div class="searchrow"><label for="q" style="position:absolute;left:-9999px">'+T.searchLabel+'</label><input id="q" type="search" placeholder="'+esc(T.searchPh)+'" autocomplete="off"><a class="btn" href="'+(EMBED?link(BASE+'section/','s=quickstart'):'#steps')+'">'+T.start+'</a></div><div id="results" class="results" aria-live="polite"></div>';
  h+='<section class="block"><h2>'+esc(H.tasksTitle)+'</h2><div class="cards">';
  H.tasks.forEach(function(t){h+='<div class="card"><div class="tag">'+esc(t.label)+'</div><p>'+esc(t.text)+'</p></div>'});
  h+='</div></section>';
  h+='<section class="block"><h2>'+esc(H.connectTitle)+'</h2><p class="lead" style="margin:0">'+esc(H.connectText)+'</p></section>';
  h+='<section class="block" id="steps"><h2>'+esc(H.stepsTitle)+'</h2><div class="cards">';
  H.steps.forEach(function(s,i){h+='<div class="step"><div class="n">'+(i+1)+'</div><h3>'+esc(s.title)+'</h3><p>'+esc(s.text)+'</p></div>'});
  h+='</div><p class="note">'+esc(H.stepsNote)+(H.stepsMore?' <a href="'+link(BASE+'section/','s=quickstart')+'">'+esc(H.stepsMore)+' →</a>':'')+'</p></section>';
  h+='<section class="block"><h2>'+esc(H.plansTitle)+'</h2><p class="lead" style="margin:0">'+esc(H.plansText)+'</p></section>';
  h+='<section class="block"><h2>'+esc(H.sectionsTitle)+'</h2><div class="seclinks">';
  allSections(r[1]).forEach(function(s){h+='<a href="'+secLink(s)+'"'+(s.ready?'':' class="soon"')+'>'+esc(tx(s.title))+(s.ready?'':' <span class="soon-tag">'+T.soon+'</span>')+'</a>'});
  h+='</div></section>';
  h+='<div class="newsbar"><div><strong>'+esc(H.newsTitle)+'</strong><div class="meta">'+esc(H.newsText)+'</div></div><a class="btn ghost" href="'+link(BASE+'news/')+'">'+esc(H.newsBtn)+'</a></div>';
  shell('guide',h);
  setupSearch(secs);
 }).catch(fail);
}
function setupSearch(secs){
 var box=document.getElementById('q'),out=document.getElementById('results'),db=null;
 function load(){return db?Promise.resolve(db):Promise.all(secs.map(function(s){return loadSection(s.id).then(function(c){return {s:s,items:c.items||[]}})})).then(function(x){db=x;return x})}
 box.addEventListener('input',function(){
  var q=box.value.trim().toLowerCase();
  if(q.length<2){out.innerHTML='';return}
  load().then(function(all){
   var hits=[];
   all.forEach(function(g){g.items.forEach(function(it){
    var hay=[it.q,it.short,it.where,it.important].join(' ').toLowerCase();
    if(hay.indexOf(q)>-1)hits.push({s:g.s,it:it});
   })});
   if(!hits.length){out.innerHTML='<p class="note">'+T.nothing+'</p>';return}
   out.innerHTML='<p class="meta">'+T.found+': '+hits.length+'</p>'+hits.map(function(h){
    return '<a href="'+link(BASE+'section/','s='+encodeURIComponent(h.s.id))+'#i-'+esc(h.it.id)+'">'+esc(h.it.q)+'<small>'+esc(tx(h.s.title))+'</small></a>';
   }).join('');
  }).catch(function(){});
 });
}
/* ---------- раздел ---------- */
function pageSection(){
 var id=qs('s');
 getJSON(BASE+'content/sections.json').then(function(list){
  var all=allSections(list),cur=all.filter(function(s){return s.id===id})[0];
  var side='<aside class="side"><div class="lbl">'+T.sections+'</div><nav aria-label="'+T.sections+'">'+all.map(function(s){return '<a href="'+secLink(s)+'"'+(cur&&s.id===cur.id?' aria-current="page"':'')+(s.ready?'':' class="soon"')+'>'+esc(tx(s.title))+'</a>'}).join('')+'</nav></aside>';
  var help='<div class="help">'+T.noAnswer+' <a href="mailto:'+SUPPORT+'"'+(EMBED?' target="_top"':'')+'>'+SUPPORT+'</a></div>';
  if(!cur){shell('guide','<div class="layout">'+side+'<div class="content"><h1>'+T.notReady+'</h1><p><a href="'+link(BASE)+'">'+T.home+'</a></p></div></div>');return}
  document.title=tx(cur.title)+' — Simple Bake';
  var head='<p class="crumbs">'+T.crumb+' / '+esc(tx(cur.title))+'</p><h1>'+esc(tx(cur.title))+'</h1>';
  if(!cur.ready){
   shell('guide','<div class="layout">'+side+'<div class="content">'+head+'<div class="stub"><p><strong>'+T.stubLead+'</strong></p>'+(cur.desc?'<p>'+esc(tx(cur.desc))+'</p>':'')+'<p><a href="'+link(BASE)+'">'+T.stubBack+'</a></p></div>'+(EMBED?help:'')+'</div></div>');
   return;
  }
  return loadSection(cur.id).then(function(c){
   var h='<div class="layout">'+side+'<div class="content">'+head;
   if(cur.desc)h+='<p class="lead">'+esc(tx(cur.desc))+'</p>';
   h+=(c.items||[]).map(itemHTML).join('');
   if(EMBED)h+=help;
   h+='</div></div>';
   shell('guide',h);
   var m=/^#i-(.+)$/.exec(location.hash);
   if(m){var el=document.getElementById('i-'+m[1]);if(el){el.open=true;el.scrollIntoView()}}
  });
 }).catch(fail);
}
/* ---------- что нового ---------- */
function pageNews(){
 Promise.all([getJSON(BASE+'content/news.json'),getJSON(BASE+'content/sections.json')]).then(function(r){
  var ready={};readySections(r[1]).forEach(function(s){ready[s.id]=s});
  var h='<h1>'+T.news+'</h1><p class="lead">'+T.newsLead+'</p>';
  r[0].forEach(function(day){
   h+='<h2 class="news-day">'+esc(tx(day.date))+'</h2>';
   day.items.forEach(function(e){
    h+='<article class="entry"><span class="meta">'+T.build2+' '+esc(e.build)+'</span>'+(e.tag?'<span class="badge">'+esc(tx(e.tag))+'</span>':'')+'<h3>'+esc(tx(e.title))+'</h3><p>'+esc(tx(e.text))+'</p>';
    if(e.section&&ready[e.section])h+='<a href="'+link(BASE+'section/','s='+encodeURIComponent(e.section))+'">'+T.newsRead+' '+esc(tx(ready[e.section].title))+'</a>';
    h+='</article>';
   });
  });
  shell('news',h);
 }).catch(fail);
}
function fail(){
 document.documentElement.lang=LANG;
 document.getElementById('app').innerHTML=header('guide')+'<main><div class="wrap"><h1>'+T.notReady+'</h1><p><a href="'+link(BASE)+'">'+T.home+'</a></p></div></main>'+footer();bindLang();
}
if(EMBED)document.body.classList.add('embed');
bindShots();
var pg=document.body.getAttribute('data-page');
if(pg==='home')pageHome();else if(pg==='section')pageSection();else if(pg==='news')pageNews();
})();
