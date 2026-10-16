const assert=require('assert');const els={};function element(id){return els[id]||(els[id]={id,hidden:false,disabled:false,value:'',checked:true,textContent:'',files:[],children:[],append(c){this.children.push(c)},after(){},replaceChildren(){this.children=[]},remove(){},classList:{add(){}},close(){},showModal(){}})}
global.document={getElementById:element,createElement:()=>new Proxy({remove(){}},{set(o,k,v){o[k]=v;if(k==='id')els[v]=o;return true}}),head:{append(){}}};global.window=global;global.navigator={onLine:true};let $=element,NL='\n',N=Array.from({length:22},(_,i)=>'card'+i),SYS='rules',MODELS={west:[['W','w']],deepseek:[['D','d']],qwen:[['Q','q']],kimi:[['K','k']],glm:[['G','g']]};
let reading=()=> 'detailed reading',valid=()=>true,save=()=>{},sdk=async()=>global.puter,ask=async()=>'',online=async()=>{},deal=async()=>{},H=[],busy=false,question='',renderHistory=()=>{},store=()=>true,canOnline=()=>true,wait=async()=>{},spread=()=>[0,1,2,3,2,1,3],card=()=>({classList:{add(){}}});
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{resolve,promise}};
global.puter={auth:{isSignedIn:()=>true}};

eval(require('fs').readFileSync('part4.js','utf8'));

;(async()=>{
const record=()=>({id:Math.random().toString(),ts:Date.now(),q:'',ids:[0,1,2,3,2,1,3],local:'text',ai:''});
$('model').value='one';
ask=async()=> 'AI OK';await deal();assert.equal(H.length,1);assert(H[0].ai.includes('AI OK'));assert.equal(busy,false);for(const i of ['orb','again','ask','go','q'])assert.equal($(i).disabled,false);
const initial=H.length;const pending=deferred();ask=()=>pending.promise;const a=deal();await new Promise(r=>setTimeout(r,0));const blockedQuestion=question;$('q').value='changed';$('go').onclick();assert.equal(question,blockedQuestion);await deal();assert.equal(H.length,initial+1);document.getElementById('stop-ai').onclick();await a;assert.equal(busy,false);assert($('online').textContent.includes('остановлено'));
const stale=H[0];ask=async()=> 'NEW';await deal();const fresh=H[0];pending.resolve('LATE');await new Promise(r=>setTimeout(r,0));assert.equal(stale.ai,'');assert.equal(fresh.ai,'NEW');assert(!$('online').textContent.includes('LATE'));
ask=async()=>{throw new Error('quota')};await deal();assert($('online').textContent.includes('недоступно'));assert.equal(busy,false);
navigator.onLine=false;await deal();assert($('online').textContent.includes('Нет доступа'));navigator.onLine=true;
store=()=>false;await deal();assert($('status').textContent.includes('экспорт'));store=()=>true;
const before=JSON.stringify(H);$('file').files=[{size:10,text:async()=>JSON.stringify([{ids:[99],ts:1}])}];await $('file').onchange({target:$('file')});assert.equal(JSON.stringify(H),before);
const sample=record();sample.id='repeat';$('file').files=[{size:100,text:async()=>JSON.stringify([sample,sample])}];await $('file').onchange({target:$('file')});assert.equal(H.filter(x=>x.id==='repeat').length,1);
$('file').files=[{size:99999999,text:async()=>{throw new Error('should not read')}}];await $('file').onchange({target:$('file')});assert($('status').textContent.includes('10 МБ'));
const beforeEmpty=H.length;question='';ask=async()=> 'OK';await deal();assert.equal(H.length,beforeEmpty+1);
console.log(JSON.stringify({checks:['AI success','buttons unlock','double click ignored','question locked','cancel','late response ignored','quota error','offline','storage failure','invalid import atomic','deduplication','large import rejected','empty question'],records:H.length}));
})().catch(e=>{console.error(e.stack);process.exitCode=1});
