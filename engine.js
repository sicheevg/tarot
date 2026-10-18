/* Офлайн-алгоритм чтения «Путь Ходоровски» (авторская реализация программы).
   Опирается на: теософскую сумму из 7 позиций, десятиступенчатую нумерологию,
   пары карт через 10 и пары с суммой 21, язык взглядов фигур, чтение настоящего вместо предсказания. */
(()=>{
'use strict';
const D=window.TAROT_DATA;
// Направление взгляда фигуры на картах Jean Dodal (с точки зрения зрителя): R вправо, L влево, F на зрителя, D вниз, N фигуры нет.
const GAZE=['R','L','R','F','R','R','F','F','F','L','N','D','F','R','D','F','N','D','F','F','F','L'];
const ROMAN=['','I','II','III','IIII','V','VI','VII','VIII','VIIII','X','XI','XII','XIII','XIIII','XV','XVI','XVII','XVIII','XVIIII','XX','XXI'];
const RED=n=>{while(n>22)n=String(n).split('').reduce((a,b)=>a+Number(b),0);return n===22?0:n};
const degree=n=>n===0||n===21?null:(n%10===0?10:n%10);
const series=n=>n===0||n===21?0:(n<=10?1:2);
function rng(seed){let h=2166136261;const s=String(seed);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
const P={
ru:{
title:'РАЗВЁРНУТОЕ ЧТЕНИЕ · ПУТЬ ХОДОРОВСКИ',q:'Вопрос: ',noQ:'Вопрос не задан — читаем состояние настоящего момента.',
h:['1. ЗЕРКАЛО ВОПРОСА','2. ГЛАВНЫЙ АКЦЕНТ','3. СЦЕНА ВЗГЛЯДОВ','4. КАЖДАЯ КАРТА В СВОЕЙ ПОЗИЦИИ','5. ЧИСЛА И СТУПЕНИ','6. СОЧЕТАНИЯ И ПАРЫ','7. ПОВТОРЫ','8. РОДОВОЕ ДРЕВО','9. КУДА ВЕДЁТ НЫНЕШНЯЯ ЛИНИЯ','10. ИТОГ И СИМВОЛИЧЕСКИЙ ШАГ'],
themes:{love:'любовь и отношения',work:'работа и дело',money:'деньги и ресурсы',body:'тело и силы',path:'путь и смысл'},
themeLine:t=>'Тема вопроса, распознанная программой: '+t+'.',
themeNone:'Явной темы в вопросе нет — карты читаются как общий портрет момента.',
future:['Вопрос обращён к будущему. В методе «Пути Таро» карты — зеркало настоящего, поэтому переформулируем: «Что во мне сейчас определяет, как это сложится?»','Вы спрашиваете «что будет». Ходоровски предлагал спрашивать «что происходит со мной сейчас» — так ответ становится тем, с чем можно работать.'],
noQ2:'Без вопроса расклад работает как зеркало: он показывает, что сейчас занимает вас сильнее всего, даже если вы этого не называете.',present:['Вопрос уже обращён к настоящему — это лучшая точка входа для чтения.','Хороший вопрос: он касается того, что происходит сейчас и зависит от вас.'],
roles:['A · Исток','B · Центр','C · Направление','A+B+C · Скрытая основа','A+C · Внешние обстоятельства','A+B · Восприимчивое начало','B+C · Активное начало'],
lens:['То, из чего вырастает ситуация, — исходная установка.','Суть момента: через эту карту читаются остальные.','Куда склоняется движение, если продолжать.','Сумма трёх карт — то, что лежит под поверхностью.','Сумма крайних карт — среда и условия вокруг вас.','Сумма истока и центра — что полезно принять и услышать.','Сумма центра и направления — что можно сделать самому.'],
res:'Ресурс: ',sh:'Тень: ',voice:'Голос карты: ',ask:'Вопрос к себе: ',act:'Шаг: ',kw:'',
noNum:'без номера',
centre:(n,v)=>'В центре — '+n+'. '+v,
gazeWord:{R:'смотрит вправо',L:'смотрит влево',F:'смотрит прямо на вас',D:'смотрит вниз',N:'не имеет взгляда — это событие, а не фигура'},
gaze:(pos,g,n)=>{const m={A:{R:'— на центр расклада: исток обращён к сути.',L:'— за пределы расклада, в прошлое.',F:'— исток обращён к вам самим.',D:'— в землю, в материальное и конкретное.',N:'.'},B:{R:'— на направление: центр уже думает о следующем шаге.',L:'— на исток: центр оглядывается назад.',F:'— центр встречается с вами взглядом: вопрос о вас самих.',D:'— в материю: суть момента — в практических делах.',N:'.'},C:{R:'— за пределы расклада, в будущее: линия уходит дальше вопроса.',L:'— на центр: направление возвращается к сути.',F:'— направление обращено к вам: следующий шаг за вами.',D:'— на землю: направление требует воплощения.',N:'.'}};return n+' '+P.ru.gazeWord[g]+' '+m[pos][g]},
mutualAB:'Исток и центр смотрят друг на друга — между ними идёт живой диалог.',mutualBC:'Центр и направление обращены друг к другу — желание и движение согласованы.',
lonely:'На центр не смотрит ни одна соседняя карта: суть ситуации может оставаться незамеченной — уделите ей внимание.',
past:'Взгляды чаще обращены влево — к прошлому: что-то из прежнего ещё требует завершения.',fut:'Взгляды чаще обращены вправо — к будущему: ситуация уже тянется вперёд.',
gazeNote:'Направления определены по фигурам колоды Jean Dodal; левая сторона традиционно читается как прошлое, правая — как будущее.',
deg:['','потенциал','накопление и вынашивание','творческий взрыв','устойчивость','новый идеал и мост','удовольствие и встреча с собой','действие в мире','совершенство и полнота','кризис и переход','завершение цикла'],
degFool:'изначальная энергия вне шкалы',degWorld:'полная реализация вне шкалы',
degLine:(n,c,d,s)=>n+' ('+c+'): '+d+(s?' · '+s:''),
ser:['','первый ряд — сознательная жизнь в мире','второй ряд — глубина, бессознательное, дух'],
up:'Числа от истока к направлению растут: энергия поднимается к более зрелой ступени.',down:'Числа от истока к направлению снижаются: ситуация возвращается к более простой основе — иногда это необходимо, чтобы начать заново.',flat:'Исток и направление стоят на одной ступени: задача та же, меняется уровень.',
balance:(a,b)=>'Карт первого ряда: '+a+', второго ряда: '+b+'. '+(a>b?'Преобладает внешнее действие.':b>a?'Преобладает внутренняя работа.':'Внешнее и внутреннее уравновешены.'),
pair10:['','два начала','вынашивание и внутренняя жизнь','творческий или разрушительный взрыв','безопасность на небе и на земле','искушение во всех обличьях','появление удовольствия','действие в мире','лики совершенства','кризис и возрождение','то, что начинается, приходит к завершению'],
pairTen:(a,b,t)=>a+' и '+b+' — пара через десять: тема «'+t+'». Одна карта показывает эту тему в мире, другая — в глубине.',
path21:(a,b)=>a+' и '+b+' в сумме дают 21 — число Мира: это путь реализации. Соединив их качества, можно прийти к целостности.',
dia:[(a,b,ka,kb,r)=>a+' → '+b+'. Тема «'+ka+'» встречается с темой «'+kb+'». '+r,(a,b,ka,kb,r)=>a+' → '+b+'. Из темы «'+ka+'» вырастает тема «'+kb+'». '+r,(a,b,ka,kb,r)=>a+' → '+b+'. '+r+' Спросите себя: как тема «'+ka+'» может послужить теме «'+kb+'»?'],
rel:{same:'Одна и та же карта повторяется — тема требует особого внимания.',up:(x,y)=>'Ступень растёт: «'+x+'» → «'+y+'».',down:(x,y)=>'Ступень снижается: «'+x+'» → «'+y+'» — шаг назад ради опоры.',eq:x=>'Обе на ступени «'+x+'»: одна задача в двух обличьях.',pole:'Одна из карт вне числовой шкалы и задаёт всему раскладу особый тон.'},
pairLbl:['A → B','B → C','A → C','Центр и скрытая основа','Принятие и действие'],
special:'Особые связи в раскладе:',noSpecial:'Пар через десять и пар с суммой 21 среди семи карт нет.',
rep:(n,k)=>n+' — '+k+' позиции.',repNote:'Вычисленные карты зависят от исходных, поэтому повтор — акцент, а не независимое подтверждение.',noRep:'Повторов нет: каждая тема звучит один раз.',
family:{2:'Папесса — образ сдержанной, знающей матери или бабушки',3:'Императрица — образ творческой, плодовитой матери',4:'Император — образ отца, опоры и закона',5:'Папа — образ отца-учителя, деда, авторитета',6:'Влюблённый — выбор между родом и собственным желанием'},
famIntro:'В раскладе есть фигуры, связанные с семьёй. Ходоровски в «Метагенеалогии» связывал многие повторяющиеся сценарии с семейным древом:',famAsk:'Спросите себя: чей сценарий я сейчас повторяю — и хочу ли его продолжать?',noFamily:'Семейных фигур в раскладе нет: вопрос, скорее всего, касается вашего собственного выбора, а не семейного сценария.',
trend:(nC,kC,nX,tX)=>'Если ничего не менять, линия ведёт к теме «'+kC+'» ('+nC+'). Внешние обстоятельства ('+nX+') окрашивают её так: '+tX,
trend2:(nZ,lZ,nY,qY)=>'Если сделать сознательный шаг: '+nZ+' подсказывает — '+lZ+' А '+nY+' предлагает спросить: «'+qY+'»',
trendNote:'Это тенденция, а не приговор. Сам Ходоровски считал, что Таро говорит о настоящем, а будущее создаётся выбором.',
sum:(nB,tB,nS,shS)=>'Суть — '+nB+': '+tB+' Скрытая основа ('+nS+') предупреждает: '+shS,
actIntro:'Символический шаг на сегодня (в духе психомагии, безопасно): ',
after:'После шага запишите, что изменилось в ощущениях и понимании.',
disc:'Это символическое чтение по мотивам Марсельского Таро и метода «Пути Таро». Тексты — авторские тексты программы, не цитаты Ходоровски. Чтение не является прогнозом событий и не заменяет медицинских, финансовых и юридических консультаций.'
},
en:{
title:'DETAILED READING · THE WAY OF JODOROWSKY',q:'Question: ',noQ:'No question given — reading the state of the present moment.',
h:['1. MIRROR OF THE QUESTION','2. MAIN ACCENT','3. SCENE OF GAZES','4. EACH CARD IN ITS POSITION','5. NUMBERS AND DEGREES','6. COMBINATIONS AND PAIRS','7. REPEATS','8. FAMILY TREE','9. WHERE THE PRESENT LINE LEADS','10. CONCLUSION AND SYMBOLIC STEP'],
themes:{love:'love and relationships',work:'work and projects',money:'money and resources',body:'body and energy',path:'path and meaning'},
themeLine:t=>'Theme of the question detected by the app: '+t+'.',
themeNone:'No clear theme in the question — the cards are read as a general portrait of the moment.',
future:['The question looks to the future. In the method of The Way of Tarot the cards are a mirror of the present, so let us rephrase: “What in me right now shapes how this will turn out?”','You are asking “what will happen”. Jodorowsky suggested asking “what is happening to me now” — then the answer becomes something you can work with.'],
noQ2:'Without a question the spread works as a mirror: it shows what occupies you most right now, even if you do not name it.',present:['The question already faces the present — the best entry point for a reading.','A good question: it concerns what is happening now and depends on you.'],
roles:['A · Origin','B · Centre','C · Direction','A+B+C · Hidden basis','A+C · Outer circumstances','A+B · Receptive principle','B+C · Active principle'],
lens:['What the situation grows out of — the starting attitude.','The heart of the moment: the other cards are read through it.','Where the movement leans if things continue.','The sum of the three cards — what lies beneath the surface.','The sum of the outer cards — the setting and conditions around you.','The sum of origin and centre — what is worth accepting and hearing.','The sum of centre and direction — what you can do yourself.'],
res:'Resource: ',sh:'Shadow: ',voice:'Voice of the card: ',ask:'Question to yourself: ',act:'Step: ',kw:'',
noNum:'unnumbered',
centre:(n,v)=>'At the centre — '+n+'. '+v,
gazeWord:{R:'looks to the right',L:'looks to the left',F:'looks straight at you',D:'looks down',N:'has no gaze — it is an event, not a figure'},
gaze:(pos,g,n)=>{const m={A:{R:'— toward the centre: the origin faces the heart of the matter.',L:'— out of the spread, into the past.',F:'— the origin is turned toward you.',D:'— to the earth, to the material and concrete.',N:'.'},B:{R:'— toward the direction: the centre is already thinking of the next step.',L:'— toward the origin: the centre looks back.',F:'— the centre meets your eyes: the question is about you.',D:'— into matter: the heart of the moment lies in practical affairs.',N:'.'},C:{R:'— out of the spread, into the future: the line runs beyond the question.',L:'— toward the centre: the direction returns to the heart of the matter.',F:'— the direction faces you: the next step is yours.',D:'— to the earth: the direction asks to be embodied.',N:'.'}};return n+' '+P.en.gazeWord[g]+' '+m[pos][g]},
mutualAB:'Origin and centre look at each other — a living dialogue runs between them.',mutualBC:'Centre and direction face each other — desire and movement are aligned.',
lonely:'No neighbouring card looks at the centre: the heart of the situation may go unnoticed — give it attention.',
past:'The gazes turn mostly left — toward the past: something from before still needs completing.',fut:'The gazes turn mostly right — toward the future: the situation is already pulling forward.',
gazeNote:'Directions are taken from the figures of the Jean Dodal deck; the left side is traditionally read as the past, the right as the future.',
deg:['','potential','accumulation and gestation','creative explosion','stability','new ideal and bridge','pleasure and meeting oneself','action in the world','perfection and fullness','crisis and transition','end of a cycle'],
degFool:'primal energy outside the scale',degWorld:'full realisation outside the scale',
degLine:(n,c,d,s)=>n+' ('+c+'): '+d+(s?' · '+s:''),
ser:['','first series — conscious life in the world','second series — depth, the unconscious, spirit'],
up:'The numbers rise from origin to direction: energy climbs to a more mature degree.',down:'The numbers fall from origin to direction: the situation returns to a simpler base — sometimes necessary in order to start anew.',flat:'Origin and direction stand on the same degree: the task is the same, the level changes.',
balance:(a,b)=>'The spread holds '+a+' cards of the first series and '+b+' of the second. '+(a>b?'Outer action prevails.':b>a?'Inner work prevails.':'Outer and inner are balanced.'),
pair10:['','two beginnings','gestation and inner life','creative or destructive explosion','security in heaven and on earth','temptation in all its guises','the appearance of pleasure','action in the world','faces of perfection','crisis and regeneration','what begins comes to an end'],
pairTen:(a,b,t)=>a+' and '+b+' are a pair ten apart: theme “'+t+'”. One shows it in the world, the other in the depths.',
path21:(a,b)=>a+' and '+b+' add up to 21 — the number of the World: a path of realisation. Joining their qualities leads toward wholeness.',
dia:[(a,b,ka,kb,r)=>a+' → '+b+'. “'+ka+'” meets “'+kb+'”. '+r,(a,b,ka,kb,r)=>a+' → '+b+'. Out of “'+ka+'” grows “'+kb+'”. '+r,(a,b,ka,kb,r)=>a+' → '+b+'. '+r+' Ask yourself how “'+ka+'” can serve “'+kb+'”.'],
rel:{same:'The same card repeats — the theme needs special attention.',up:(x,y)=>'The degree rises: from “'+x+'” to “'+y+'”.',down:(x,y)=>'The degree falls: from “'+x+'” to “'+y+'” — a step back for the sake of footing.',eq:x=>'Both stand on the degree “'+x+'”: one task in two guises.',pole:'One of the cards lies outside the number scale and gives the whole spread a special tone.'},
pairLbl:['A → B','B → C','A → C','Centre and hidden basis','Receiving and acting'],
special:'Special links in the spread:',noSpecial:'There are no pairs ten apart and no pairs adding up to 21 among the seven cards.',
rep:(n,k)=>n+' — '+k+' positions.',repNote:'Derived cards depend on the drawn ones, so a repeat is an accent, not independent confirmation.',noRep:'No repeats: each theme sounds once.',
family:{2:'The High Priestess — an image of a reserved, knowing mother or grandmother',3:'The Empress — an image of a creative, fertile mother',4:'The Emperor — an image of the father, support and law',5:'The Pope — an image of the father as teacher, grandfather, authority',6:'The Lovers — a choice between the family and one’s own desire'},
famIntro:'Figures linked to the family appear in the spread. In Metagenealogy Jodorowsky linked many repeating scripts to the family tree:',famAsk:'Ask yourself: whose script am I repeating now — and do I want to continue it?',noFamily:'There are no family figures in the spread: the question most likely concerns your own choice rather than a family script.',
trend:(nC,kC,nX,tX)=>'If nothing changes, the line leads toward “'+kC+'” ('+nC+'). The outer circumstances ('+nX+') colour it like this: '+tX,
trend2:(nZ,lZ,nY,qY)=>'If you take a conscious step: '+nZ+' suggests — '+lZ+' And '+nY+' invites the question: “'+qY+'”',
trendNote:'This is a tendency, not a verdict. Jodorowsky himself held that the Tarot speaks of the present, while the future is created by choice.',
sum:(nB,tB,nS,shS)=>'The heart — '+nB+': '+tB+' The hidden basis ('+nS+') warns: '+shS,
actIntro:'Symbolic step for today (in the spirit of psychomagic, safe): ',
after:'After the step, note what changed in your feelings and understanding.',
disc:'This is a symbolic reading inspired by the Tarot of Marseille and the method of The Way of Tarot. The texts are the app’s own, not quotations from Jodorowsky. The reading is not a forecast of events and does not replace medical, financial or legal advice.'
}};
const THEME_RX={ru:{love:/любов|отношен|парн|девушк|\bмуж|жена|жён|брак|свидан|чувств|сердц|роман|бывш|любим/i,work:/работ|карьер|проект|бизнес|начальн|коллег|должност|учёб|учеб|экзамен|\bдел[оау]\b|компани|контракт|сделк|клиент/i,money:/деньг|денег|финанс|зарплат|долг|кредит|доход|инвест|покупк|прода|бюджет|ипотек/i,body:/здоров|болезн|\bтел[оау]\b|самочув|\bсон\b|устал|спорт|врач|похуд|энерги/i,path:/смысл|путь|жизн|выбор|духов|предназнач|творч|рисун|призван|себя/i},
en:{love:/love|relationship|partner|boyfriend|girlfriend|husband|wife|marri|date|dating|heart|romance|\bex\b/i,work:/work|job|career|project|business|boss|colleague|exam|study|client|contract|company/i,money:/money|financ|salary|debt|loan|income|invest|buy|sell|budget|mortgage/i,body:/health|ill|body|sleep|tired|sport|doctor|weight|energy/i,path:/meaning|path|life|choice|spirit|purpose|creativ|drawing|vocation|myself/i}};
const FUTURE_RX={ru:/будет|буду|будем|станет|случится|произойд|когда|получится|выйдет|ждёт|ждет|вернётся|вернется|\bли\b/i,en:/\bwill\b|\bwhen\b|going to|\bshall\b|happen|future/i};
function theme(q,lang){if(!q)return null;for(const [k,rx]of Object.entries(THEME_RX[lang]))if(rx.test(q))return k;return null}
function reading(ids,q,lang,seed){
lang=lang==='en'?'en':'ru';const L=P[lang],C=D[lang].cards,N=D[lang].names;
if(!Array.isArray(ids)||ids.length!==7||ids.some(i=>!Number.isInteger(i)||i<0||i>21))throw new Error(lang==='en'?'Invalid cards for the reading':'Неверные карты для толкования');
const r=rng(seed||ids.join('-')+'|'+(q||'')),pk=a=>a[Math.floor(r()*a.length)];
const nm=i=>N[i]+' ('+(ROMAN[i]||L.noNum)+')',kw=i=>C[i][0].split(',')[0].trim(),light=i=>pk(C[i][2]),shadow=i=>pk(C[i][3]),quest=i=>pk(C[i][4]),act=i=>pk(C[i][5]);
const lc=t=>t.charAt(0).toLowerCase()+t.slice(1);
const th=theme(q,lang),T=th||'path',thText=i=>C[i][6][T];
const dname=i=>i===0?L.degFool:i===21?L.degWorld:L.deg[degree(i)];
const [a,b,c,s,x,y,z]=ids,out=[];
out.push(L.title,q?L.q+q:L.noQ);
// 1. Зеркало вопроса
out.push(L.h[0],(q&&FUTURE_RX[lang].test(q)?pk(L.future):q?pk(L.present):L.noQ2)+' '+(th?L.themeLine(L.themes[th]):L.themeNone));
// 2. Главный акцент
out.push(L.h[1],L.centre(nm(b),L.voice+'«'+C[b][1]+'»').replace(/«/g,lang==='en'?'“':'«').replace(/»/g,lang==='en'?'”':'»'),light(b)+' '+thText(b));
// 3. Взгляды
const gA=GAZE[a],gB=GAZE[b],gC=GAZE[c],g=[L.gaze('A',gA,N[a]),L.gaze('B',gB,N[b]),L.gaze('C',gC,N[c])];
if(gA==='R'&&gB==='L')g.push(L.mutualAB);if(gB==='R'&&gC==='L')g.push(L.mutualBC);
if(gA!=='R'&&gC!=='L'&&a!==b&&c!==b)g.push(L.lonely);
const lefts=[gA,gB,gC].filter(v=>v==='L').length,rights=[gA,gB,gC].filter(v=>v==='R').length;if(lefts>rights)g.push(L.past);else if(rights>lefts)g.push(L.fut);
g.push(L.gazeNote);out.push(L.h[2],g.join(' '));
// 4. Карты в позициях
out.push(L.h[3]);
ids.forEach((i,k)=>{const lines=[L.roles[k]+' — '+nm(i)+' · '+C[i][0],L.lens[k]];
if(k===0)lines.push(L.res+light(i),L.sh+shadow(i));
else if(k===1)lines.push(L.res+light(i),L.sh+shadow(i));
else if(k===2)lines.push(L.res+light(i)+' '+thText(i));
else if(k===3)lines.push(L.sh+shadow(i),L.res+light(i));
else if(k===4)lines.push(thText(i));
else if(k===5)lines.push(L.res+light(i),L.ask+quest(i));
else lines.push(L.res+light(i),L.act+act(i));
out.push(lines.join('\n'))});
// 5. Числа
const dl=[a,b,c].map((i,k)=>L.degLine(['A','B','C'][k]+' · '+N[i],ROMAN[i]||L.noNum,dname(i),series(i)?L.ser[series(i)]:''));
const da=degree(a)??(a===0?0:11),dc=degree(c)??(c===0?0:11);
dl.push(da<dc?L.up:da>dc?L.down:L.flat);
const s1=ids.filter(i=>series(i)===1).length,s2=ids.filter(i=>series(i)===2).length;dl.push(L.balance(s1,s2));
out.push(L.h[4],dl.join('\n'));
// 6. Сочетания и пары
const relOf=(p,q2)=>{if(p===q2)return L.rel.same;const dp=degree(p),dq=degree(q2);if(dp==null||dq==null)return L.rel.pole;if(dp===dq)return L.rel.eq(L.deg[dp]);return dp<dq?L.rel.up(L.deg[dp],L.deg[dq]):L.rel.down(L.deg[dp],L.deg[dq])};
const pairs=[[a,b],[b,c],[a,c],[b,s],[y,z]],pl=[];
pairs.forEach(([p,q2],k)=>{pl.push(L.pairLbl[k]+': '+N[p]+' + '+N[q2],pk(L.dia)(N[p],N[q2],kw(p),kw(q2),relOf(p,q2)))});
const uniq=[...new Set(ids)],sp=[];
for(let i=0;i<uniq.length;i++)for(let j=i+1;j<uniq.length;j++){const u=Math.min(uniq[i],uniq[j]),v=Math.max(uniq[i],uniq[j]);if(v-u===10&&u>=1&&u<=10)sp.push(L.pairTen(N[u],N[v],L.pair10[u]));if(u+v===21)sp.push(L.path21(N[u],N[v]))}
pl.push(sp.length?L.special+'\n'+sp.join('\n'):L.noSpecial);
out.push(L.h[5],pl.join('\n\n'));
// 7. Повторы
const cnt=new Map();ids.forEach(i=>cnt.set(i,(cnt.get(i)||0)+1));const reps=[...cnt].filter(([,n])=>n>1);
out.push(L.h[6],reps.length?reps.map(([i,n])=>L.rep(N[i],n)).join(' ')+' '+L.repNote:L.noRep);
// 8. Родовое древо
const fam=uniq.filter(i=>L.family[i]);
out.push(L.h[7],fam.length?L.famIntro+'\n'+fam.map(i=>'• '+L.family[i]).join('\n')+'\n'+L.famAsk:L.noFamily);
// 9. Тенденция
out.push(L.h[8],L.trend(N[c],kw(c),N[x],lc(thText(x)))+'\n'+L.trend2(N[z],lc(light(z)),N[y],quest(y))+'\n'+L.trendNote);
// 10. Итог
out.push(L.h[9],L.sum(N[b],lc(thText(b)),N[s],lc(shadow(s))),L.ask+quest(b),L.actIntro+pk([act(b),act(c),act(z)]),L.after,L.disc);
return out.join('\n\n');
}
function spread(){const p=Array.from({length:22},(_,i)=>i);const rnd=(n)=>{if(window.crypto&&crypto.getRandomValues){const u=new Uint32Array(1);crypto.getRandomValues(u);return u[0]%n}return Math.floor(Math.random()*n)};for(let i=21;i>0;i--){const j=rnd(i+1);[p[i],p[j]]=[p[j],p[i]]}const [a,b,c]=p;return [a,b,c,RED(a+b+c),RED(a+c),RED(a+b),RED(b+c)]}
window.TarotEngine={reading,spread,RED,GAZE,ROMAN,degree,series,theme};
})();
