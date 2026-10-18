/* Проверка офлайн-версии 8 в WebKit (движок Safari) и Chromium. Запуск: node offline.test.cjs */
const pw=require('playwright');const fs=require('fs'),path=require('path'),http=require('http');
const ROOT=__dirname,results=[];let failed=0;
const TYPES={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webmanifest':'application/manifest+json'};
function check(env,name,ok,detail){results.push({env,name,passed:!!ok,detail:detail===undefined?undefined:String(detail)});if(!ok)failed++;console.log((ok?'OK   ':'FAIL ')+env+' · '+name+(detail!==undefined?' — '+detail:''))}
function serve(){return new Promise(res=>{const s=http.createServer((q,r)=>{let p=decodeURIComponent(new URL(q.url,'http://x').pathname);if(p.endsWith('/'))p+='index.html';const f=path.join(ROOT,p);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':TYPES[path.extname(f)]||'application/octet-stream','cache-control':'no-cache'});fs.createReadStream(f).pipe(r)});s.listen(0,'127.0.0.1',()=>res(s))})}
(async()=>{const srv=await serve(),base='http://localhost:'+srv.address().port+'/';
for(const [bname,devName] of [['webkit','iPhone SE'],['webkit','iPhone 16'],['webkit','iPhone 16 Pro Max'],['chromium','iPhone 16']]){
const env=bname+' / '+devName;const browser=await pw[bname].launch();
try{const dev={...pw.devices[devName]};delete dev.defaultBrowserType;const ctx=await browser.newContext({...dev,acceptDownloads:true});
const external=[];ctx.on('request',r=>{const u=new URL(r.url());if(u.hostname!=='localhost'&&!u.protocol.startsWith('data')&&!u.protocol.startsWith('blob'))external.push(r.url())});
const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base,{waitUntil:'load'});
check(env,'Нет ошибок JavaScript при запуске',errors.length===0,errors.join(' | ')||undefined);
check(env,'Новый посетитель видит английскую версию',await page.evaluate(()=>document.documentElement.lang==='en'&&document.querySelector('h1').textContent==='TAROT OF MARSEILLE'&&document.querySelector('#orb').textContent==='Read'&&document.querySelector('#tgTitle').textContent==='My drawings on Telegram'));
const seo=await page.evaluate(()=>{const m=n=>document.querySelector(n);let ld=null;try{ld=JSON.parse(m('script[type="application/ld+json"]').textContent)}catch(e){}return{title:document.title,desc:(m('meta[name=description]')||{}).content||'',canon:(m('link[rel=canonical]')||{}).href,og:(m('meta[property="og:image"]')||{}).content,robots:(m('meta[name=robots]')||{}).content,ld:ld&&ld['@type'],hreflang:document.querySelectorAll('link[hreflang]').length,about:(m('#about')||{}).textContent||''}});
check(env,'Поисковые метки: описание, canonical, Open Graph, schema.org, hreflang',seo.desc.length>=120&&seo.desc.length<=170&&seo.canon==='https://sicheevg.github.io/tarot/'&&/og-image\.png$/.test(seo.og)&&/index/.test(seo.robots)&&seo.ld==='WebApplication'&&seo.hreflang===3,JSON.stringify({desc:seo.desc.length,ld:seo.ld,hreflang:seo.hreflang}));
check(env,'Видимый английский текст для поисковиков',seo.about.includes('Jodorowsky')&&seo.about.split(/\s+/).length>150,seo.about.split(/\s+/).length+' слов');
check(env,'Заголовок страницы на английском',/^Free Tarot Reading Online · Marseille Tarot · Jodorowsky/.test(seo.title),seo.title);
const rp=await page.request.get(base+'robots.txt'),sm=await page.request.get(base+'sitemap.xml'),og=await page.request.get(base+'og-image.png');
check(env,'robots.txt, sitemap.xml и картинка превью доступны',rp.ok()&&sm.ok()&&og.ok()&&(await sm.text()).includes('<loc>https://sicheevg.github.io/tarot/</loc>'));
const p2=await ctx.newPage();await p2.goto(base+'?lang=ru');check(env,'Ссылка ?lang=ru открывает русскую версию',await p2.locator('h1').textContent()==='ТАРО МАРСЕЛЬ');await p2.goto(base+'ru/');const ru=await p2.evaluate(()=>({lang:document.documentElement.lang,h1:document.querySelector('h1').textContent,title:document.title,canon:document.querySelector('link[rel=canonical]').href,desc:document.querySelector('meta[name=description]').content,about:document.querySelector('#about').textContent,orb:document.querySelector('#orb').textContent}));
check(env,'Русская страница /ru/: язык, заголовок и canonical',ru.lang==='ru'&&ru.h1==='ТАРО МАРСЕЛЬ'&&ru.orb==='Гадать'&&ru.canon==='https://sicheevg.github.io/tarot/ru/'&&/Марсельское Таро/.test(ru.title)&&/Ходоровски/.test(ru.title),ru.title);
check(env,'Русская страница содержит «Марсельское Таро», «Ходоровски», «Таро Ходоровски»',/Марсельск/.test(ru.desc)&&/Ходоровски/.test(ru.desc)&&ru.about.includes('Марсельского Таро')&&ru.about.includes('Таро Ходоровски')&&ru.about.split(/\s+/).length>150,ru.about.split(/\s+/).length+' слов');
await p2.locator('#orb').tap({force:true});await p2.waitForFunction(()=>!busy&&document.querySelectorAll('.card.open').length===7,undefined,{timeout:20000});
check(env,'Русская страница: расклад и картинки работают',await p2.evaluate(()=>[...document.querySelectorAll('.card img')].every(i=>i.naturalWidth>0)&&document.querySelector('#result').textContent.includes('ПУТЬ ХОДОРОВСКИ')));
check(env,'Английская страница содержит Marseille Tarot, Tarot de Marseille, Jodorowsky',await page.evaluate(()=>{const t=document.title+' '+document.querySelector('meta[name=description]').content+' '+document.querySelector('#about').textContent;return /Marseille Tarot/.test(t)&&/Tarot de Marseille/.test(t)&&/Jodorowsky Tarot/.test(t)}));
await p2.evaluate(()=>{H.length=0;localStorage.setItem('history','[]')});
await p2.close();
await page.evaluate(()=>localStorage.setItem('lang_v6','"en"'));await page.reload();
check(env,'Puter полностью удалён',await page.evaluate(()=>!window.puter&&!document.documentElement.outerHTML.toLowerCase().includes('puter')&&![...document.scripts].some(s=>/puter/i.test(s.src))));
const lay=await page.evaluate(()=>{const o=document.querySelector('#orb').getBoundingClientRect(),b=document.querySelector('#telegram-art').getBoundingClientRect();return{orbBottom:o.bottom,orbTop:o.top,bannerBottom:b.bottom,vh:innerHeight}});
check(env,'Кнопка «Гадать» целиком видна на первом экране',lay.orbBottom<=lay.vh&&lay.orbTop>0,'низ кнопки '+Math.round(lay.orbBottom)+' из '+lay.vh+' px');
check(env,'Баннер Telegram сверху, над кнопкой',lay.bannerBottom<=lay.orbTop);
check(env,'Ссылка Telegram не изменилась',await page.locator('#telegram-art a').getAttribute('href')==='https://t.me/'+'print'.repeat(6));
check(env,'Нет горизонтальной прокрутки до расклада',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('#lang').tap();
await page.locator('#orb').tap({force:true});await page.waitForFunction(()=>!busy,undefined,{timeout:20000});
check(env,'Касание «Гадать» открывает 7 карт',await page.locator('.card.open').count()===7);
await page.waitForFunction(()=>[...document.images].every(i=>i.complete),undefined,{timeout:10000}).catch(()=>{});
check(env,'Все 7 изображений загружены из приложения',await page.evaluate(()=>{const im=[...document.querySelectorAll('.card img')];return im.length===7&&im.every(i=>i.naturalWidth>0&&new URL(i.src).hostname==='localhost')}));
const txt=await page.locator('#result').textContent();
const secs=['ЗЕРКАЛО ВОПРОСА','ГЛАВНЫЙ АКЦЕНТ','СЦЕНА ВЗГЛЯДОВ','КАЖДАЯ КАРТА','ЧИСЛА И СТУПЕНИ','СОЧЕТАНИЯ','ПОВТОРЫ','РОДОВОЕ ДРЕВО','КУДА ВЕДЁТ','ИТОГ'];
check(env,'Чтение содержит все 10 разделов',secs.every(s=>txt.includes(s)),secs.filter(s=>!txt.includes(s)).join(',')||undefined);
const words=txt.split(/\s+/).length;check(env,'Объём чтения 600–1300 слов',words>=600&&words<=1300,words+' слов');
check(env,'В тексте нет undefined/NaN',!/undefined|NaN/.test(txt));
check(env,'Чтение сохранено в истории',await page.evaluate(()=>H.length===1&&JSON.parse(localStorage.getItem('history')).length===1));
check(env,'Нет переполнения после расклада',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
await page.locator('#ask').tap();await page.locator('#q').fill('Что будет в моих отношениях с любимым человеком? '+'https://example.com/'+'a'.repeat(300));await page.locator('#go').tap();await page.waitForFunction(()=>!busy,undefined,{timeout:20000});
const t2=await page.locator('#result').textContent();
check(env,'Вопрос о будущем переформулирован в настоящее',/зеркало настоящего|что происходит со мной сейчас/.test(t2));
check(env,'Распознана тема «любовь и отношения»',t2.includes('любовь и отношения'));
check(env,'Длинный вопрос не ломает ширину',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
const variety=await page.evaluate(()=>{const ids=[3,9,14,TarotEngine.RED(26),TarotEngine.RED(17),TarotEngine.RED(12),TarotEngine.RED(23)];const s=new Set();for(let i=0;i<30;i++)s.add(TarotEngine.reading(ids,'','ru','seed'+i));return s.size});
check(env,'Одни и те же карты дают разные тексты',variety>=25,variety+' из 30 вариантов различны');
const fuzz=await page.evaluate(()=>{for(let i=0;i<1500;i++){const ids=TarotEngine.spread();for(const l of['ru','en']){const t=TarotEngine.reading(ids,i%3?'':(l==='en'?'money and work':'деньги и долг'),l,String(i));if(/undefined|NaN/.test(t)||(l==='en'&&/[А-Яа-яЁё]/.test(t)))return 'сбой: '+ids.join(',')+' '+l}}return 'ok'});
check(env,'1500 случайных раскладов RU/EN без сбоев',fuzz==='ok',fuzz);
await page.locator('#lang').tap();
check(env,'Переключение на английский',await page.locator('h1').textContent()==='TAROT OF MARSEILLE'&&await page.locator('#orb').textContent()==='Read'&&await page.locator('#tgTitle').textContent()==='My drawings on Telegram');
const en=await page.locator('#result').textContent();
check(env,'Текущее чтение пересобрано на английском',en.includes('DETAILED READING')&&en.includes('SCENE OF GAZES')&&!/[А-Яа-яЁё]/.test(en.replace(/Вопрос|Что будет[^\n]*/g,'').replace(/Question: [^\n]*/,'')));
check(env,'Названия карт на английском',await page.evaluate(()=>[...document.querySelectorAll('.card .nm')].every(s=>!/[А-Яа-яЁё]/.test(s.textContent))));
await page.reload();
check(env,'Язык и история сохраняются после перезагрузки',await page.locator('#orb').textContent()==='Read'&&await page.evaluate(()=>H.length===2));
await page.locator('#lang').tap();
await page.locator('#menu').tap();for(let i=0;i<10;i++)await page.locator('#theme').selectOption(String(i));await page.reload();
check(env,'Тема оформления сохраняется',await page.locator('#theme').inputValue()==='9');
await page.evaluate(()=>{const old={id:'old-1',ts:1700000000000,q:'старый',ids:[1,2,3,6,4,3,5],local:'Старое чтение',ai:'Старый ответ ИИ'};const h=JSON.parse(localStorage.getItem('history'));h.push(old);localStorage.setItem('history',JSON.stringify(h))});await page.reload();
check(env,'Старые записи с ИИ-ответом открываются как архив',await page.evaluate(()=>document.querySelector('#history').textContent.includes('архив прежней версии')&&H.length===3));
await page.evaluate(()=>document.querySelector('#search').closest('details').open=true);await page.locator('#search').fill('старый');check(env,'Поиск по истории',await page.locator('#history .entry').count()===1);await page.locator('#search').fill('');
const [dl]=await Promise.all([page.waitForEvent('download'),page.evaluate(()=>document.querySelector('#export').click())]);const exported=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));
check(env,'Экспорт JSON',Array.isArray(exported)&&exported.length===3);
const tmp=path.join(require('os').tmpdir(),'imp-'+Date.now()+'.json');fs.writeFileSync(tmp,JSON.stringify([{id:'new-1',ts:1700000001000,q:'',ids:[0,1,2,3,4,1,3],local:'x'}]));await page.setInputFiles('#file',tmp);await page.waitForTimeout(300);
check(env,'Импорт корректной записи',await page.evaluate(()=>H.length===4));
fs.writeFileSync(tmp,JSON.stringify([{id:'bad',ts:1,ids:[99],local:'x'}]));await page.setInputFiles('#file',tmp);await page.waitForTimeout(300);
check(env,'Повреждённый импорт отклонён целиком',await page.evaluate(()=>H.length===4));
// Офлайн: сервис-воркер кэширует всё, затем сеть выключается
const swOk=await page.evaluate(async()=>{if(!('serviceWorker'in navigator))return 'нет API';const r=await Promise.race([navigator.serviceWorker.ready.then(()=>'ok'),new Promise(r=>setTimeout(()=>r('таймаут'),15000))]);return r});
if(swOk==='ok'){await page.waitForTimeout(1500);await ctx.setOffline(true);await page.reload({waitUntil:'load'}).catch(()=>{});
let offOk=false;try{await page.locator('#orb').tap({force:true,timeout:5000});await page.waitForFunction(()=>!busy&&document.querySelectorAll('.card.open').length===7,undefined,{timeout:20000});offOk=await page.evaluate(()=>[...document.querySelectorAll('.card img')].length===7&&[...document.querySelectorAll('.card img')].every(i=>i.naturalWidth>0))}catch(e){}
check(env,'Без интернета: страница, расклад и картинки работают',offOk);
let ruOff=false;try{await page.goto(base+'ru/',{waitUntil:'load'});ruOff=await page.locator('h1').textContent()==='ТАРО МАРСЕЛЬ'}catch(e){}check(env,'Без интернета: русская страница открывается',ruOff);await ctx.setOffline(false)}
else check(env,'Сервис-воркер для офлайна зарегистрирован',false,swOk);
check(env,'Ни одного внешнего сетевого запроса',external.length===0,external.slice(0,3).join(' ')||undefined);
check(env,'Нет ошибок JavaScript за весь сценарий',errors.length===0,errors.join(' | ')||undefined);
if(bname==='webkit'&&devName==='iPhone SE'){await page.goto(base);await page.screenshot({path:path.join(ROOT,'..','shot-se-start.png')})}
if(bname==='webkit'&&devName==='iPhone 16'){await page.goto(base);await page.locator('#orb').tap({force:true});await page.waitForFunction(()=>!busy);await page.waitForTimeout(800);check(env,'После нажатия экран прокручен к картам',await page.evaluate(()=>scrollY>100),'scrollY');await page.screenshot({path:path.join(ROOT,'..','shot-16-reading.png')});await page.evaluate(()=>document.querySelector('#result').scrollIntoView());await page.screenshot({path:path.join(ROOT,'..','shot-16-text.png')});await page.screenshot({path:path.join(ROOT,'..','shot-16-full.png'),fullPage:true})}
await ctx.close()}catch(e){check(env,'Сценарий завершён без исключения',false,e.message.split('\n')[0])}finally{await browser.close()}}
srv.close();fs.writeFileSync(path.join(ROOT,'test-results.json'),JSON.stringify({version:10,environment:'Playwright WebKit (движок Safari) и Chromium с профилями iPhone; локальный сервер; внешние запросы отслеживаются',timestamp:new Date().toISOString(),passed:results.filter(r=>r.passed).length,total:results.length,results},null,1));
console.log('\nИТОГ: '+results.filter(r=>r.passed).length+'/'+results.length);process.exitCode=failed?1:0})();
