/* Part 4: bounded AI jobs, consistent buttons and validated history. */
(()=>{
'use strict';
let active=null,serial=0;
const interrupted=()=>new Error('Запрос остановлен');
function alive(job){if(!job.active||Date.now()>job.deadline)throw interrupted()}
const stop=document.createElement('button');stop.id='stop-ai';stop.type='button';stop.textContent='Остановить ожидание ИИ';stop.hidden=true;$('online').after(stop);
function stopJob(){if(!active)return;active.active=false;active.cancel();$('online').textContent='Ожидание ИИ остановлено. Карты и встроенное толкование сохранены.';stop.hidden=true}
stop.onclick=stopJob;
function normalize(r){
if(!r||typeof r!=='object'||!Array.isArray(r.ids)||r.ids.length!==7||!r.ids.every(i=>Number.isInteger(i)&&i>=0&&i<22)||!Number.isFinite(r.ts)||r.ts<0||typeof r.local!=='string'||(r.q!=null&&typeof r.q!=='string')||(r.ai!=null&&typeof r.ai!=='string'))return null;
const id=(typeof r.id==='string'||typeof r.id==='number')?String(r.id):'';
return {...r,id:id&&id!=='undefined'?id:'restored-'+r.ts+'-'+r.ids.join('-'),q:r.q||'',ai:r.ai||''};
}
valid=r=>!!normalize(r);
H=H.map(normalize).filter(Boolean);
let storageWarning=false;
save=function(){storageWarning=!store('history',H);if(storageWarning)$('status').textContent='Не удалось сохранить историю на устройстве. Записи остаются в этой вкладке — сделайте экспорт JSON.';renderHistory()};
$('file').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>10*1024*1024)throw new Error('Файл больше 10 МБ');const data=JSON.parse(await f.text());if(!Array.isArray(data))throw new Error('Нужен массив записей JSON');const batch=data.map(normalize);if(batch.some(x=>!x))throw new Error('Есть повреждённые записи; импорт не выполнен, история не изменена');const known=new Set(H.map(r=>r.id));let count=0;for(const r of batch)if(!known.has(r.id)){H.push(r);known.add(r.id);count++}H.sort((a,b)=>b.ts-a.ts);save();if(!storageWarning)$('status').textContent='Импортировано новых записей: '+count}catch(err){$('status').textContent='Импорт: '+(err.message||'неизвестная ошибка')}finally{e.target.value=''}};
let loader=null;
sdk=function(){if(!canOnline())return Promise.reject(new Error('Для ИИ нужен обычный адрес сайта HTTPS.'));if(window.puter)return Promise.resolve(window.puter);if(loader)return loader;loader=new Promise((resolve,reject)=>{const s=document.createElement('script');let done=false;const finish=(err)=>{if(done)return;done=true;clearTimeout(t);s.onload=s.onerror=null;if(err){s.remove();loader=null;reject(err)}else resolve(window.puter)};const t=setTimeout(()=>finish(new Error('Puter не загрузился за 12 секунд')),12000);s.src='https://js.puter.com/v2/';s.onload=()=>finish(window.puter?null:new Error('Puter не инициализирован'));s.onerror=()=>finish(new Error('Не удалось загрузить Puter'));document.head.append(s)});return loader};
async function chain(p,models,msgs,job){let last;for(const [label,model]of models){alive(job);try{const text=await ask(p,model,msgs,Math.min(30000,job.deadline-Date.now()));alive(job);return{label,text}}catch(e){last=e;alive(job);if(/auth|sign.?in|login|permission|quota|credit|balance|payment|billing|rate.?limit|429/i.test(String(e?.message||e)))throw e}}throw last||new Error('Нет ответа')}
online=async function(rec){if(!$('useAI').checked)return;const el=$('online');el.hidden=false;if(!canOnline()||navigator.onLine===false){el.textContent='Нет доступа к онлайн-чтению. Карты и встроенное толкование сохранены.';return}
const job={id:++serial,active:true,deadline:Date.now()+90000,cancel:null};active=job;const cancelled=new Promise(resolve=>job.cancel=resolve);stop.hidden=false;el.textContent='ИИ готовит толкование. Общее ожидание — не более 90 секунд; его можно остановить.';
const work=async()=>{const p=await sdk();alive(job);if(p.auth&&typeof p.auth.isSignedIn==='function'&&!await p.auth.isSignedIn())throw new Error('Нужно войти в Puter через меню настроек');alive(job);
const mode=$('model').value;const choices=mode==='one'?[MODELS.west]:mode==='cn'?[MODELS.deepseek,MODELS.qwen,MODELS.kimi,MODELS.glm]:[MODELS.west,MODELS.deepseek,MODELS.qwen];
const user=JSON.stringify({question:rec.q||'Общее чтение',positions:rec.ids.map((i,k)=>({position:k,card:N[i]}))});const msgs=[{role:'system',content:SYS},{role:'user',content:user}];
const results=await Promise.all(choices.map(c=>chain(p,c,msgs,job).then(r=>({...r,ok:true})).catch(e=>({ok:false,error:String(e?.message||e)}))));alive(job);const good=results.filter(r=>r.ok);if(!good.length)throw new Error(results.map(r=>r.error).join('; '));
let text=good[0].text,merged=false;if(good.length>1&&job.deadline-Date.now()>1000){try{text=await ask(p,MODELS.west[0][1],[{role:'system',content:SYS},{role:'user',content:'Составь единое толкование по исходному вопросу, картам и независимым чтениям. Данные: '+JSON.stringify({input:JSON.parse(user),readings:good})}],Math.min(30000,job.deadline-Date.now()));merged=true}catch(e){alive(job)}}
alive(job);if(!H.some(r=>r.id===rec.id))return;
rec.ai=(good.length>1?(merged?'Сводное чтение':'Сводка недоступна; показан первый успешный ответ')+NL+NL:'')+text+(good.length>1?NL+NL+good.map(r=>r.label+NL+r.text).join(NL+NL):'');save();el.textContent='Ответили: '+good.map(r=>r.label).join(', ')+NL+NL+rec.ai};
let timeout;try{await Promise.race([work(),cancelled,new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('Общее ожидание ИИ превысило 90 секунд')),90000)})])}catch(e){if(job.active)el.textContent='ИИ-чтение недоступно: '+String(e?.message||e)+'. Встроенное толкование сохранено. Для входа используйте «Подключить Puter» в меню ☰.'}finally{clearTimeout(timeout);job.active=false;if(active===job){active=null;stop.hidden=true}}};
function lock(on){['orb','again','ask','go','q'].forEach(id=>$(id).disabled=on)}
deal=async function(){if(busy)return;busy=true;lock(true);const q=question;const answer=$('result'),el=$('online');answer.hidden=true;el.hidden=true;el.textContent='';$('status').textContent='Раскладываю карты…';
try{const ids=spread(),text=reading(ids,q);const rec={id:Date.now()+'-'+Math.random().toString(36).slice(2),ts:Date.now(),q,ids,local:text,ai:''};H.unshift(rec);save();$('table').replaceChildren();const cards=ids.map((i,k)=>card(i,k));for(const c of cards){$('table').append(c);await wait(110)}await wait(200);for(const c of cards){c.classList.add('open');await wait(180)}$('question').textContent=q;answer.textContent=text;answer.hidden=false;if(!storageWarning)$('status').textContent='Расклад сохранён. При включённом ИИ ожидайте дополнительное чтение.';await online(rec)}catch(e){$('status').textContent='Не удалось завершить расклад: '+String(e?.message||e)}finally{busy=false;lock(false)}};
$('orb').onclick=$('again').onclick=deal;
$('go').onclick=()=>{if(busy)return;question=$('q').value.trim();$('dialog').close();deal()};
$('ask').onclick=()=>{if(!busy)$('dialog').showModal()};
$('diag').textContent+=' · Версия устойчивости: 4. Общее ожидание ИИ до 90 с; история не очищается при ошибках.';
renderHistory();
})();
