(function(){
const sec=document.getElementById('s-settings');if(!sec||window.__s7)return;window.__s7=1;
const dig=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const P=['الفجر','الظهر','العصر','المغرب','العشاء'];
const get=()=>{const v=st.get('iq',null);return v&&v.m&&v.m.length===5?v:{on:true,m:[10,10,10,10,10]}};
let iq=get();
const sv=()=>{st.set('iq',iq);if(window.schedule)setTimeout(window.schedule,200)};
const css=document.createElement('style');css.textContent='#iqb{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:12px;margin:14px 0}#iqb h3{margin:0 0 8px;font-family:"Reem Kufi",sans-serif;font-size:17px}#iqb .r{display:flex;justify-content:space-between;align-items:center;padding:6px 0}#iqb .r input{width:84px;text-align:center;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--bg)}#duac{position:fixed;top:0;right:0;bottom:0;left:0;z-index:150;background:#000a;display:flex;align-items:center;justify-content:center;padding:18px}#duac>div{background:var(--surf);color:var(--ink);border-radius:20px;max-width:460px;width:100%;padding:20px;text-align:center;max-height:90%;overflow:auto}#duac h3{margin:0 0 10px;color:var(--acc);font-family:"Reem Kufi",sans-serif}#duac p.d{font-family:"Amiri",serif;font-size:calc(24px*var(--fs,1));line-height:2.1;margin:0 0 10px}#duac small{display:block;color:var(--mut);line-height:1.8;margin-bottom:12px}';document.head.appendChild(css);
const b=document.createElement('div');b.id='iqb';
function draw(){b.innerHTML='<h3>الإقامة</h3><button type="button" class="btn" id="iqt" style="width:100%;margin-bottom:8px">'+(iq.on?'الإقامة مفعّلة ✓':'الإقامة متوقفة')+'</button>'+P.map((n,i)=>'<div class="r"><span>'+n+'</span><span><input type="number" inputmode="numeric" min="1" max="60" data-i="'+i+'" value="'+iq.m[i]+'"> دقيقة بعد الأذان</span></div>').join('')+'<p class="note">الإقامة بتشتغل بصوتها بعد الأذان بالدقايق اللي تحددها لكل صلاة، زي الأذان حتى لو التطبيق مقفول. بتستخدم الإقامة اللي نزّلتها لو موجودة، ولو لأ بتستخدم الإقامة المدمجة (ويكيميديا كومنز CC0). التغيير بيتطبق على التنبيهات الجاية.</p>'}
draw();sec.appendChild(b);window.__iq={get:()=>iq,set:(i,v)=>{iq.m[i]=v;sv();draw()},toggle:()=>{iq.on=!iq.on;sv();draw()}};
b.addEventListener('click',e=>{if(e.target.id==='iqt'){iq.on=!iq.on;sv();draw()}});
b.addEventListener('change',e=>{const t=e.target;if(t.dataset.i===undefined)return;let v=Math.round(+t.value);if(!(v>=1))v=10;if(v>60)v=60;iq.m[+t.dataset.i]=v;t.value=v;sv()});
/* دعاء بعد الأذان عند فتح التطبيق وقت الأذان */
function dua(i){if(document.getElementById('duac'))return;const d=document.createElement('div');d.id='duac';
 d.innerHTML='<div><h3>دعاء بعد الأذان</h3><p class="d">اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ، [إِنَّكَ لا تُخْلِفُ الْمِيعَادَ]</p><small>قال النبي ﷺ: «من قال حين يسمع النداء: اللهم رب هذه الدعوة التامة... حلّت له شفاعتي يوم القيامة». رواه البخاري. (زيادة «إنك لا تخلف الميعاد» عند البيهقي، ولذلك هي بين قوسين في حصن المسلم.)<br>رددها بعد أن تجيب المؤذن وتصلي على النبي ﷺ، وادعُ لنفسك بين الأذان والإقامة فالدعاء لا يُردّ.</small><button type="button" class="btn pri" id="duax" style="width:100%">آمين</button></div>';
 document.body.appendChild(d);document.getElementById('duax').onclick=()=>d.remove()}

const ADL=['اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ','اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ','أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ','أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ','أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ','أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ','حَيَّ عَلَى الصَّلَاةِ','حَيَّ عَلَى الصَّلَاةِ','حَيَّ عَلَى الْفَلَاحِ','حَيَّ عَلَى الْفَلَاحِ'];
const ADF=['الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ','الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ'];
const ADE=['اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ','لَا إِلَهَ إِلَّا اللَّهُ'];
/* بداية كل سطر بالثواني داخل ملف الصوت (من تحليل فترات السكوت في التسجيل). الملفات التانية بدون مزامنة. */
const TM={main:[0.3,6.8,15.33,26.41,36.85,47.65,61.11,69.5,84.22,93.46,107.76,116.82],adhan4:[1.05,20.4,38.4,53.1,72.3,86.6,107.7,119.1,134.3,145.9,161.4,177.1],adhan2:[0.3,8.1,18.2,35.1,55.8,77.9,99.5,118.6,134.0,156.8,177.1,190.0],adhan1:[2.5,17.4,33,44.5,56.1,68,85.3,95,113,123.6,136.6,150.6],adhan3:[0.6,6.1,11.5,19.2,28.8,37.6,47.9,53.7,60.2,65.8,72,77.7]};
const DUR={main:129.4,adhan4:186.6,adhan2:197,adhan1:158.2,adhan3:86.5};
const DUA='اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ';
let adT=null;
function adhanScreen(i,label,play,firedAt){try{if(document.getElementById('adhs'))return;window.__adhI=i;
const d=document.createElement('div');d.id='adhs';
d.setAttribute('style','position:fixed;top:0;right:0;bottom:0;left:0;z-index:9000;overflow:hidden;background:#06100e url(mosque.jpg) center/cover no-repeat;color:#fff;direction:rtl;text-align:center');
const dk=(window.__cuBundled&&window.__cuBundled(i))?'main':cfg.snd;const tm=(window.__cuOn&&window.__cuOn(i)&&dk!=='main')?null:(TM[dk]||null);let L=ADL.slice();if(i===0&&!tm)L.splice(8,0,...ADF);L=L.concat(ADE);
d.innerHTML='<div style="position:absolute;top:0;right:0;bottom:0;left:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.35) 35%,rgba(0,0,0,.78) 100%)"></div>'+
'<div id="adl" style="position:absolute;top:0;right:0;bottom:70px;left:0;overflow:auto;-webkit-overflow-scrolling:touch;padding:46px 22px 24px;box-sizing:border-box">'+L.map(function(t,k){return '<div class="adln" data-k="'+k+'" style="font-family:Amiri,\'Traditional Arabic\',serif;font-size:26px;line-height:2.15;color:#fff;opacity:'+(tm?'.55':'.95')+';text-shadow:0 2px 8px #000;transition:all .35s">'+t+'</div>'}).join('')+'</div>'+
'<div style="position:absolute;bottom:14px;left:0;right:0;display:flex;justify-content:center;gap:10px"><button id="adhsp" style="padding:11px 22px;border-radius:999px;border:1px solid rgba(255,255,255,.7);background:rgba(0,0,0,.45);color:#fff;font-size:16px;font-family:inherit">تشغيل</button><button id="adhsx" style="padding:11px 26px;border-radius:999px;border:0;background:#e3b85c;color:#1b1b1b;font-size:16px;font-family:inherit">إغلاق</button></div>';
document.body.appendChild(d);
function close(){try{if(typeof stopSound==='function')stopSound()}catch(e){}clearInterval(adT);d.remove()}
document.getElementById('adhsp').onclick=function(){try{playSound();firedAt=0}catch(e){window.__log&&__log('play err '+e)}};
if(play){try{playSound()}catch(e){window.__log&&__log('play err '+e)}}
document.getElementById('adhsx').onclick=close;
let aduT=setInterval(function(){try{if(!document.getElementById('adhs')){clearInterval(aduT);return}if(typeof au!=='undefined'&&au&&au.ended&&!document.getElementById('adua')){const bx=document.getElementById('adl');bx.querySelectorAll('.adln').forEach(function(r){r.style.display='none'});bx.style.display='flex';bx.style.alignItems='center';bx.style.justifyContent='center';const du=document.createElement('div');du.id='adua';du.style.cssText='font-family:Amiri,serif;font-size:28px;line-height:2.1;color:#fff;text-shadow:0 2px 8px #000;padding:0 8px';du.innerHTML='<div style="font-size:16px;color:#e3b85c;margin-bottom:10px">دعاء بعد الأذان</div>'+DUA;bx.appendChild(du)}}catch(e){}},600);
if(tm){let cur=-1;try{if(dk==='main'&&window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AdhanAlarm&&Capacitor.Plugins.AdhanAlarm.adhanPos){var npT=setInterval(function(){if(!document.getElementById('adhs')){clearInterval(npT);return}Capacitor.Plugins.AdhanAlarm.adhanPos().then(function(r){window.__np={pos:r.pos,done:!!r.done,at:Date.now()}}).catch(function(){})},300)}}catch(e){}const rows=d.querySelectorAll('.adln'),box=document.getElementById('adl');box.style.display='flex';box.style.alignItems='center';box.style.justifyContent='center';rows.forEach(function(r){r.style.display='none'});
 clearInterval(adT);adT=setInterval(function(){let t=-1;
  try{var np=window.__np;if(dk==='main'&&np&&Date.now()-np.at<2500&&np.pos>=0)t=np.pos/1000+(Date.now()-np.at)/1000;else if(dk==='main'&&np&&np.done&&Date.now()-np.at<2500)t=9999;else if(typeof au!=='undefined'&&au&&!au.paused&&au.currentTime>0)t=au.currentTime;else if(firedAt){const e=(Date.now()-firedAt)/1000;if(e>=0&&e<(DUR[dk]||52)+3)t=e}if(typeof au!=='undefined'&&au&&au.ended)t=9999}catch(e){}
  if(t<0)return;if(DUR[dk]&&t>DUR[dk]-0.3){if(cur!==99){cur=99;rows.forEach(function(r){r.style.display='none'});let du=document.getElementById('adua');if(!du){du=document.createElement('div');du.id='adua';du.style.cssText='font-family:Amiri,serif;font-size:28px;line-height:2.1;color:#fff;text-shadow:0 2px 8px #000;padding:0 8px';du.innerHTML='<div style="font-size:16px;color:#e3b85c;margin-bottom:10px">دعاء بعد الأذان</div>'+DUA;box.appendChild(du)}}return}
  let k=-1;for(let j=0;j<tm.length;j++)if(t>=tm[j]-0.15)k=j;
  if(k===cur)return;cur=k;rows.forEach(function(r,j){const on=j===k;r.style.display=on?'block':'none';r.style.opacity=1;r.style.color='#fff';r.style.fontSize='38px'});
  },150)}
}catch(e){window.__log&&__log('adhanScreen err '+e)}}
window.__adhanScreen=adhanScreen;
try{const LN=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;if(LN&&LN.addListener){LN.addListener('localNotificationActionPerformed',function(ev){try{const b=(ev&&ev.notification&&(ev.notification.body||ev.notification.title))||'';if(b.indexOf('الإقامة')>=0)return;let k=-1;if(typeof names!=='undefined')names.forEach(function(n,j){if(b.indexOf(n)>=0&&k<0)k=j});if(k===1)return;adhanScreen(k<0?2:k)}catch(e){}});LN.addListener('localNotificationReceived',function(ev){try{const b=(ev&&ev.notification&&ev.notification.body)||'';if(b.indexOf('حان الآن')<0)return;let k=-1;names.forEach(function(n,j){if(b.indexOf(n)>=0&&k<0)k=j});if(k>=0&&k!==1)adhanScreen(k)}catch(e){}})}}catch(e){}
window.__dua=dua;
try{if(typeof fire==='function'){const f0=fire;fire=function(i){f0.apply(this,arguments);try{if(i!==1&&cfg.on[i])setTimeout(function(){adhanScreen(i,null,false,Date.now()-400)},400)}catch(e){}}}}catch(e){}
if(window.schedule)setTimeout(window.schedule,500);
})();
