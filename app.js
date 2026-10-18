/* Таро Марсель — интерфейс. Полностью офлайн: без Puter, без внешних запросов. */
'use strict';
const ROOT=new URL('.',document.currentScript&&document.currentScript.src||location.href).href;
const E=window.TarotEngine,DATA=window.TAROT_DATA,NL='\n';
const $=id=>document.getElementById(id),wait=ms=>new Promise(r=>setTimeout(r,ms));
const SYM=['✧','⚚','☾','❀','♔','☩','♡','⚔','⚖','⌛','☸','♌','↕','☠','⚱','♑','ϟ','★','☽','☀','♬','◎'];
const THEMES=[['#10091c','#d8b366','☿ ☉ ☽'],['#09090e','#dc8993','✝ ☾ ✝'],['#09231a','#a8d99a','⚔ ❀ ⚔'],['#64113e','#ffd6ee','♡ ✧ ♡'],['#161333','#efcd75','♛ ⚜ ♛'],['#102632','#ace7f3','❄ ♧ ❄'],['#380b0f','#f0ca72','龍 ☯ 鳳'],['#38200f','#ecc680','◆ ✦ ◆'],['#070c27','#adc3ff','✦ ☄ ✦'],['#291621','#f2bacb','❀ ⛩ ❀']];
const UI={
ru:{title:'ТАРО МАРСЕЛЬ',doc:'Марсельское Таро онлайн бесплатно · Гадание по методу Ходоровски',lang:'EN',menu:'Настройки',orb:'Гадать',again:'Гадать снова',ask:'Задать вопрос',cancel:'Отмена',go:'Гадать',qTitle:'Ваш вопрос',qHint:'Лучше спрашивать о настоящем: «что происходит со мной в…», «что мне важно понять о…»',
tgTitle:'Мои рисунки в Telegram',tgText:'Загляните в мой канал с рисунками.',tgBtn:'🎨 Смотреть рисунки →',
settings:'Оформление',stTitle:'Статистика (видна только вам)',stNow:'Сейчас на сайте',stToday:'Посещений сегодня',stUToday:'Посетителей сегодня',stTotal:'Всего посещений',stUnique:'Уникальных устройств',stReadings:'Раскладов сделано',stWeek:'Посещения за 7 дней',stRefresh:'Обновить',stUpd:'Обновлено: ',stOff:'Нет связи со счётчиком — проверьте интернет.',stNote:'«Сейчас на сайте» — устройства с открытой страницей за последние 1–2 минуты. Ваши собственные посещения не считаются. Даты — по иркутскому времени.',ready:'Расклад готов.',adminOn:'Режим администратора включён на этом устройстве: история раскладов видна и сохраняется только здесь.',adminOffBtn:'Выключить режим администратора',adminBad:'Неверный код администратора.',history:'История',search:'Поиск по вопросу или карте',export:'Экспорт JSON',import:'Импорт',del:'Удалить',delQ:'Удалить запись?',
themes:['Ходоровски · космическая сага','Готика','Фэнтези · орки и эльфы','Барби','Королевский','Сибирь','Китай','Африка','Космос','Япония'],
offline:'Работает без интернета: все тексты, алгоритм и изображения карт хранятся в приложении. Аккаунты и ИИ-сервисы не нужны. Есть анонимный счётчик посещений — без cookie и личных данных.',
method:'О методе',methodText:'Расклад из семи позиций — «теософская сумма»: три карты (исток, центр, направление) и четыре производные, вычисленные сложением их номеров. Толкование учитывает десятиступенчатую нумерологию, пары карт через десять и пары с суммой 21, направление взглядов фигур и чтение настоящего вместо предсказания — по мотивам книги Алехандро Ходоровски и Марианны Косты «Путь Таро». Тексты программы — авторские, не цитаты. Изображения — колода Jean Dodal (около 1701 г.), общественное достояние, Wikimedia Commons.',
dealing:'Раскладываю карты…',saved:'Расклад сохранён в истории.',storeFail:'История не записалась на устройство. Сделайте экспорт — записи остаются в этой вкладке.',
imported:n=>'Импортировано новых записей: '+n,impErr:'Импорт: ',tooBig:'Файл больше 10 МБ',notArr:'Нужен массив записей JSON',broken:'Есть повреждённые записи; импорт не выполнен, история не изменена',err:'Не удалось завершить расклад: ',
archiveAI:'Онлайн-чтение (архив прежней версии):',foot:'Символическое чтение по мотивам Марсельского Таро. Не является прогнозом событий и не заменяет медицинских, финансовых и юридических консультаций.',locale:'ru-RU'},
en:{title:'TAROT OF MARSEILLE',doc:'Free Tarot Reading Online · Marseille Tarot · Jodorowsky Method',lang:'RU',menu:'Settings',orb:'Read',again:'Read again',ask:'Ask a question',cancel:'Cancel',go:'Read',qTitle:'Your question',qHint:'It is better to ask about the present: “what is happening to me in…”, “what do I need to understand about…”',
tgTitle:'My drawings on Telegram',tgText:'Take a look at my channel with drawings.',tgBtn:'🎨 See the drawings →',
settings:'Appearance',stTitle:'Statistics (visible only to you)',stNow:'On the site now',stToday:'Visits today',stUToday:'Visitors today',stTotal:'Total visits',stUnique:'Unique devices',stReadings:'Spreads made',stWeek:'Visits over 7 days',stRefresh:'Refresh',stUpd:'Updated: ',stOff:'No connection to the counter — check the internet.',stNote:'“On the site now” means devices with the page open in the last 1–2 minutes. Your own visits are not counted. Dates use Irkutsk time.',ready:'Your spread is ready.',adminOn:'Admin mode is on for this device: the history of spreads is visible and saved only here.',adminOffBtn:'Turn off admin mode',adminBad:'Wrong admin code.',history:'History',search:'Search by question or card',export:'Export JSON',import:'Import',del:'Delete',delQ:'Delete this entry?',
themes:['Jodorowsky · cosmic saga','Gothic','Fantasy · orcs and elves','Barbie','Royal','Siberia','China','Africa','Cosmos','Japan'],
offline:'Works without internet: all texts, the algorithm and the card images are stored in the app. No accounts or AI services are needed. An anonymous visit counter is used — no cookies or personal data.',
method:'About the method',methodText:'The seven-position spread is the “theosophical sum”: three cards (origin, centre, direction) and four derived cards computed by adding their numbers. The reading uses the ten-degree numerology, pairs of cards ten apart and pairs adding up to 21, the direction of the figures’ gazes, and reading the present instead of predicting — inspired by The Way of Tarot by Alejandro Jodorowsky and Marianne Costa. The texts are the app’s own, not quotations. Images: the Jean Dodal deck (c. 1701), public domain, Wikimedia Commons.',
dealing:'Laying out the cards…',saved:'Spread saved to history.',storeFail:'History could not be saved on the device. Export it — the entries stay in this tab.',
imported:n=>'New entries imported: '+n,impErr:'Import: ',tooBig:'File is larger than 10 MB',notArr:'A JSON array of entries is required',broken:'Some entries are damaged; nothing was imported and history is unchanged',err:'Could not complete the spread: ',
archiveAI:'Online reading (archive from the previous version):',foot:'A symbolic reading inspired by the Tarot of Marseille. Not a forecast of events and not a substitute for medical, financial or legal advice.',locale:'en-GB'}};
function load(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}}
function store(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
const urlLang=document.documentElement.dataset.lang||new URLSearchParams(location.search).get('lang');if(urlLang==='ru'||urlLang==='en')store('lang_v6',urlLang);
const ADMIN_HASH='cde1f5c1a7ba84c7cab8a25d89439983d67bd086aba46f273d97f46dd6a5e1eb';
let isAdmin=load('admin_v1','')===ADMIN_HASH;
async function sha256(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
let lang=load('lang_v6','en')==='ru'?'ru':'en',busy=false,question='',storageWarning=false,current=null;
let N=[...DATA[lang].names];
function normalize(r){
if(!r||typeof r!=='object'||!Array.isArray(r.ids)||r.ids.length!==7||!r.ids.every(i=>Number.isInteger(i)&&i>=0&&i<22)||!Number.isFinite(r.ts)||r.ts<0||typeof r.local!=='string'||(r.q!=null&&typeof r.q!=='string')||(r.ai!=null&&typeof r.ai!=='string'))return null;
const id=(typeof r.id==='string'||typeof r.id==='number')?String(r.id):'';
return {...r,id:id&&id!=='undefined'?id:'restored-'+r.ts+'-'+r.ids.join('-'),q:r.q||'',ai:r.ai||''};
}
let H=load('history',[]);if(!Array.isArray(H))H=[];H=H.map(normalize).filter(Boolean);
const T=()=>UI[lang];
function save(){if(!isAdmin){storageWarning=false;return}storageWarning=!store('history',H);if(storageWarning)$('status').textContent=T().storeFail;renderHistory()}
function renderHistory(){const term=$('search').value.toLowerCase(),t=T();$('count').textContent='('+H.length+')';$('history').replaceChildren();
H.filter(r=>!term||(r.q+' '+r.ids.map(i=>DATA.ru.names[i]+' '+DATA.en.names[i]).join(' ')).toLowerCase().includes(term)).forEach(r=>{const e=document.createElement('details');e.className='entry';const sm=document.createElement('summary');sm.textContent=new Date(r.ts).toLocaleString(t.locale)+' · '+(r.q||r.ids.slice(0,3).map(i=>N[i]).join(' · '));e.append(sm);const tx=document.createElement('div');tx.className='text';tx.textContent=r.local+(r.ai?NL+NL+t.archiveAI+NL+r.ai:'');e.append(tx);const del=document.createElement('button');del.type='button';del.textContent=t.del;del.onclick=()=>{if(confirm(t.delQ)){H=H.filter(x=>x.id!==r.id);save()}};e.append(del);$('history').append(e)})}
function theme(i){i=THEMES[i]?i:0;const th=THEMES[i];document.documentElement.style.setProperty('--back','url("'+ROOT+'backs/'+i+'.jpg")');document.documentElement.style.setProperty('--orb','url("'+ROOT+'backs/orb-'+i+'.jpg")');document.querySelectorAll('#themePick button').forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));document.documentElement.style.setProperty('--bg',th[0]);document.documentElement.style.setProperty('--a',th[1]);$('orn').textContent=th[2];$('theme').value=String(i);store('theme_v6',i)}
function card(i,k){const e=document.createElement('div');e.className='card'+(k>2?' derived':'');e.dataset.card=i;e.innerHTML='<div class="flip"><div class="face back"></div><div class="face front"><small>'+(E.ROMAN[i]||'')+'</small><div class="symbol">'+SYM[i]+'</div><small class="nm"></small></div></div>';e.querySelector('.nm').textContent=N[i];const img=document.createElement('img');img.alt=N[i];img.src=ROOT+'cards/'+i+'.jpg';img.decoding='async';img.onerror=()=>img.remove();e.querySelector('.front').append(img);return e}
function lock(on){['orb','again','ask','go','q'].forEach(id=>$(id).disabled=on)}
async function deal(){if(busy)return;busy=true;lock(true);const q=question,t=T();$('result').hidden=true;$('status').textContent=t.dealing;
try{const ids=E.spread(),id=Date.now()+'-'+Math.random().toString(36).slice(2),text=E.reading(ids,q,lang,id);const rec={id,ts:Date.now(),q,ids,local:text,ai:'',lang};H.unshift(rec);save();track('readings');current=rec;
$('table').replaceChildren();const cs=ids.map((i,k)=>card(i,k));let first=true;for(const c of cs){$('table').append(c);if(first){first=false;$('table').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})}await wait(110)}await wait(200);for(const c of cs){c.classList.add('open');await wait(180)}
$('question').textContent=q;$('result').textContent=text;$('result').hidden=false;if(!storageWarning)$('status').textContent=isAdmin?t.saved:t.ready}
catch(e){$('status').textContent=t.err+String(e&&e.message||e)}finally{busy=false;lock(false)}}
function applyLang(){const t=T();N.splice(0,22,...DATA[lang].names);document.documentElement.lang=lang;document.title=t.doc;
const set={stTitle:t.stTitle,stRefresh:t.stRefresh,stNote:t.stNote,lNow:t.stNow,lToday:t.stToday,lUToday:t.stUToday,lTotal:t.stTotal,lUnique:t.stUnique,lReadings:t.stReadings,lWeek:t.stWeek,h1:t.title,lang:t.lang,orb:t.orb,again:t.again,ask:t.ask,cancel:t.cancel,go:t.go,qTitle:t.qTitle,qHint:t.qHint,tgTitle:t.tgTitle,tgText:t.tgText,tgBtn:t.tgBtn,setTitle:t.settings,histTitle:t.history,export:t.export,import:t.import,offline:t.offline,methodTitle:t.method,methodText:t.methodText,foot:t.foot};
for(const[id,v]of Object.entries(set)){const el=id==='h1'?document.querySelector('h1'):$(id);if(el)el.textContent=v}
$('menu').setAttribute('aria-label',t.menu);$('search').placeholder=t.search;[...$('theme').options].forEach((o,i)=>o.textContent=t.themes[i]);document.querySelectorAll('#themePick button').forEach((b,i)=>{b.title=t.themes[i];b.setAttribute('aria-label',t.themes[i])});
document.querySelectorAll('.card').forEach(c=>{const i=Number(c.dataset.card);c.querySelector('.nm').textContent=N[i];const im=c.querySelector('img');if(im)im.alt=N[i]});
if(current&&!$('result').hidden){if(current.lang!==lang){current.local=E.reading(current.ids,current.q,lang,current.id);current.lang=lang;save()}$('result').textContent=current.local}
if($('status').textContent)$('status').textContent='';applyAdmin()}
function applyAdmin(){const t=T();$('histBox').hidden=!isAdmin;$('statsBox').hidden=!isAdmin;if(isAdmin)loadStats();$('adminLine').hidden=!isAdmin;$('adminOff').hidden=!isAdmin;$('adminLine').textContent=t.adminOn;$('adminOff').textContent=t.adminOffBtn;if(isAdmin)renderHistory()}
async function adminFromLink(){const m=location.hash.match(/(?:^#|&)admin=([^&]+)/);if(!m)return;history.replaceState(null,'',location.pathname+location.search);let ok=false;try{ok=(await sha256(decodeURIComponent(m[1])))===ADMIN_HASH}catch(e){}if(ok){isAdmin=true;store('admin_v1',ADMIN_HASH);H=load('history',[]);if(!Array.isArray(H))H=[];H=H.map(normalize).filter(Boolean);applyAdmin();$('status').textContent=T().adminOn}else $('status').textContent=T().adminBad}
THEMES.forEach((_,i)=>{const o=document.createElement('option');o.value=i;$('theme').append(o);const b=document.createElement('button');b.type='button';b.dataset.theme=i;b.style.backgroundImage='url("'+ROOT+'backs/orb-'+i+'.jpg")';b.onclick=()=>theme(i);$('themePick').append(b)});
theme(load('theme_v6',0));$('theme').onchange=()=>theme(Number($('theme').value));
$('menu').onclick=()=>{$('settings').hidden=!$('settings').hidden};
$('lang').onclick=()=>{if(busy)return;lang=lang==='en'?'ru':'en';store('lang_v6',lang);applyLang()};
$('orb').onclick=$('again').onclick=deal;
$('ask').onclick=()=>{if(!busy)$('dialog').showModal()};$('cancel').onclick=()=>$('dialog').close();
$('go').onclick=()=>{if(busy)return;question=$('q').value.trim();$('dialog').close();deal()};
$('search').oninput=renderHistory;
$('export').onclick=()=>{const a=document.createElement('a');const u=URL.createObjectURL(new Blob([JSON.stringify(H,null,2)],{type:'application/json'}));a.href=u;a.download='tarot-history.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),10000)};
$('import').onclick=()=>$('file').click();
$('file').onchange=async e=>{const t=T();try{const f=e.target.files[0];if(!f)return;if(f.size>10*1024*1024)throw new Error(t.tooBig);const data=JSON.parse(await f.text());if(!Array.isArray(data))throw new Error(t.notArr);const batch=data.map(normalize);if(batch.some(x=>!x))throw new Error(t.broken);const known=new Set(H.map(r=>r.id));let n=0;for(const r of batch)if(!known.has(r.id)){H.push(r);known.add(r.id);n++}H.sort((a,b)=>b.ts-a.ts);save();if(!storageWarning)$('status').textContent=t.imported(n)}catch(err){$('status').textContent=t.impErr+(err&&err.message||'?')}finally{e.target.value=''}};
$('stRefresh').onclick=loadStats;
$('adminOff').onclick=()=>{isAdmin=false;try{localStorage.removeItem('admin_v1')}catch(e){}applyAdmin()};

/* Анонимный счётчик посещений (abacus.jasoncameron.dev): только числа, без cookie и личных данных. Администратор не учитывается. */
const STATS='https://abacus.jasoncameron.dev',NS=(()=>{const v=load('stats_ns','');return /^test-[a-z0-9-]{3,40}$/.test(v)?v:'sicheevg-tarot-live'})();
const dayOf=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Irkutsk',year:'numeric',month:'2-digit',day:'2-digit'}).format(d).replace(/-/g,'');
const minute=()=>Math.floor(Date.now()/60000),isBot=/bot|crawl|spider|slurp|headless|lighthouse/i.test(navigator.userAgent);
function hit(k){return fetch(STATS+'/hit/'+NS+'/'+k,{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)}
function getv(k){return fetch(STATS+'/get/'+NS+'/'+k,{cache:'no-store'}).then(r=>r.status===404?{value:0}:r.ok?r.json():null).then(j=>j?Number(j.value)||0:null).catch(()=>null)}
function track(k){if(!isAdmin&&!isBot)hit(k)}
let lastBeat=0,statsTimer=0;
function beat(){if(isAdmin||isBot||document.visibilityState!=='visible')return;const m=minute();if(m!==lastBeat&&load('beat_v1',0)!==m){lastBeat=m;store('beat_v1',m);hit('on-'+m)}}
function startStats(){if(isAdmin||isBot||/(?:^#|&)admin=/.test(location.hash))return;const today=dayOf(new Date());let first=false;try{first=!sessionStorage.getItem('visit_v1');sessionStorage.setItem('visit_v1','1')}catch(e){first=true}
if(first){hit('visits');hit('day-'+today);if(!load('visitor_v1',false)){store('visitor_v1',true);hit('visitors')}if(load('vday_v1','')!==today){store('vday_v1',today);hit('uday-'+today)}}
beat();setInterval(beat,20000);document.addEventListener('visibilitychange',beat)}
async function loadStats(){if(!isAdmin)return;clearTimeout(statsTimer);const t=T(),m=minute(),days=[...Array(7)].map((_,k)=>dayOf(new Date(Date.now()-k*864e5)));
const keys=['on-'+m,'on-'+(m-1),'visits','visitors','readings','uday-'+days[0],...days.map(d=>'day-'+d)];const v=await Promise.all(keys.map(getv));
if(v.every(x=>x===null)){$('stUpd').textContent=t.stOff}else{const n=x=>x===null?'—':String(x);$('vNow').textContent=n(v[0]===null&&v[1]===null?null:Math.max(v[0]||0,v[1]||0));$('vTotal').textContent=n(v[2]);$('vUnique').textContent=n(v[3]);$('vReadings').textContent=n(v[4]);$('vUToday').textContent=n(v[5]);$('vToday').textContent=n(v[6]);
const wk=v.slice(6),mx=Math.max(1,...wk.map(x=>x||0));$('vWeek').replaceChildren(...days.map((d,k)=>{const r=document.createElement('div');r.className='bar';const lb=document.createElement('span');lb.textContent=d.slice(6,8)+'.'+d.slice(4,6);const b=document.createElement('i');b.style.width=Math.round((wk[k]||0)/mx*100)+'%';const c=document.createElement('b');c.textContent=n(wk[k]);r.append(lb,b,c);return r}).reverse());
$('stUpd').textContent=t.stUpd+new Date().toLocaleTimeString(t.locale)}
if(document.visibilityState==='visible')statsTimer=setTimeout(loadStats,30000)}
document.addEventListener('visibilitychange',()=>{if(isAdmin&&document.visibilityState==='visible')loadStats()});
applyLang();adminFromLink();startStats();window.addEventListener('hashchange',adminFromLink);
if('serviceWorker'in navigator&&/^https?:$/.test(location.protocol))navigator.serviceWorker.register(ROOT+'sw.js',{scope:ROOT}).catch(()=>{});
