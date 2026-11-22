(function(){
const sec=document.getElementById('s-settings');if(!sec||window.__s7)return;window.__s7=1;
const dig=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const P=['الفجر','الظهر','العصر','المغرب','العشاء'];
const get=()=>{const v=st.get('iq',null);return v&&v.m&&v.m.length===5?v:{on:true,m:[10,10,10,10,10]}};
let iq=get();
const sv=()=>{st.set('iq',iq);if(window.schedule)setTimeout(window.schedule,200)};
const css=document.createElement('style');css.textContent='#iqb{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:12px;margin:14px 0}#iqb h3{margin:0 0 8px;font-family:"Reem Kufi",sans-serif;font-size:17px}#iqb .r{display:flex;justify-content:space-between;align-items:center;padding:6px 0}#iqb .r input{width:84px;text-align:center;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--bg)}#duac{position:fixed;top:0;right:0;bottom:0;left:0;z-index:150;background:#000a;display:flex;align-items:center;justify-content:center;padding:18px}#duac>div{background:var(--surf);color:var(--ink);border-radius:20px;max-width:460px;width:100%;padding:20px;text-align:center;max-height:90%;overflow:auto}#duac h3{margin:0 0 10px;color:var(--acc);font-family:"Reem Kufi",sans-serif}#duac p.d{font-family:"Amiri",serif;font-size:calc(24px*var(--fs,1));line-height:2.1;margin:0 0 10px}#duac small{display:block;color:var(--mut);line-height:1.8;margin-bottom:12px}';document.head.appendChild(css);
const b=document.createElement('div');b.id='iqb';
function draw(){b.innerHTML='<h3>الإقامة</h3><button type="button" class="btn" id="iqt" style="width:100%;margin-bottom:8px">'+(iq.on?'إشعار الإقامة مفعّل ✓':'إشعار الإقامة متوقف')+'</button>'+P.map((n,i)=>'<div class="r"><span>'+n+'</span><span><input type="number" inputmode="numeric" min="1" max="60" data-i="'+i+'" value="'+iq.m[i]+'"> دقيقة بعد الأذان</span></div>').join('')+'<p class="note">بتجيلك إشعار بصوت الإقامة بعد الأذان بالدقايق اللي تحددها لكل صلاة. تسجيل الإقامة من ويكيميديا كومنز (CC0). التغيير بيتطبق على التنبيهات الجاية.</p>'}
draw();sec.appendChild(b);
b.addEventListener('click',e=>{if(e.target.id==='iqt'){iq.on=!iq.on;sv();draw()}});
b.addEventListener('change',e=>{const t=e.target;if(t.dataset.i===undefined)return;let v=Math.round(+t.value);if(!(v>=1))v=10;if(v>60)v=60;iq.m[+t.dataset.i]=v;t.value=v;sv()});
/* دعاء بعد الأذان عند فتح التطبيق وقت الأذان */
function dua(i){if(document.getElementById('duac'))return;const d=document.createElement('div');d.id='duac';
 d.innerHTML='<div><h3>دعاء بعد الأذان</h3><p class="d">اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ، [إِنَّكَ لا تُخْلِفُ الْمِيعَادَ]</p><small>قال النبي ﷺ: «من قال حين يسمع النداء: اللهم رب هذه الدعوة التامة... حلّت له شفاعتي يوم القيامة». رواه البخاري. (زيادة «إنك لا تخلف الميعاد» عند البيهقي، ولذلك هي بين قوسين في حصن المسلم.)<br>رددها بعد أن تجيب المؤذن وتصلي على النبي ﷺ، وادعُ لنفسك بين الأذان والإقامة فالدعاء لا يُردّ.</small><button type="button" class="btn pri" id="duax" style="width:100%">آمين</button></div>';
 document.body.appendChild(d);document.getElementById('duax').onclick=()=>d.remove()}

function adhanScreen(i,label,play){try{if(document.getElementById('adhs'))return;
const d=document.createElement('div');d.id='adhs';
d.setAttribute('style','position:fixed;top:0;right:0;bottom:0;left:0;z-index:9000;overflow:auto;-webkit-overflow-scrolling:touch;background:linear-gradient(180deg,#0a2f2a 0%,#0f4a3e 55%,#1a6b57 100%);color:#fff;direction:rtl;text-align:center');
const nm=(typeof names!=='undefined'&&names[i])?names[i]:'';
const svg='<svg viewBox="0 0 400 220" style="width:100%;max-width:420px;display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="adg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d58a"/><stop offset="1" stop-color="#e3b85c"/></linearGradient></defs><circle cx="318" cy="48" r="22" fill="#f3d58a"/><circle cx="328" cy="42" r="19" fill="#0f4a3e"/><g fill="url(#adg)"><rect x="40" y="70" width="14" height="130"/><polygon points="38,70 47,40 56,70"/><rect x="36" y="95" width="22" height="6"/><rect x="346" y="70" width="14" height="130"/><polygon points="344,70 353,40 362,70"/><rect x="342" y="95" width="22" height="6"/><path d="M110 200 V140 Q110 85 200 85 Q290 85 290 140 V200 Z"/><rect x="198" y="58" width="4" height="30"/><circle cx="200" cy="54" r="5"/><rect x="80" y="170" width="240" height="30"/></g><g fill="#0a2f2a"><path d="M175 200 V160 Q175 135 200 135 Q225 135 225 160 V200 Z"/></g></svg>';
d.innerHTML='<div style="padding:26px 18px 40px;max-width:520px;margin:0 auto">'+svg+
'<div style="margin-top:6px;font-size:15px;color:#f3d58a">'+(label||'حان الآن موعد الأذان')+'</div>'+
'<div style="font-size:30px;font-weight:700;margin:4px 0 14px;font-family:Amiri,serif">'+(nm?'أذان '+nm:'الأذان')+'</div>'+
'<div style="font-family:Amiri,\'Traditional Arabic\',serif;font-size:25px;line-height:2.1;background:rgba(0,0,0,.22);border-radius:18px;padding:16px 12px">اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ<br>اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ<br>أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ<br>أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ<br>أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ<br>أَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ<br>حَيَّ عَلَى الصَّلَاةِ<br>حَيَّ عَلَى الصَّلَاةِ<br>حَيَّ عَلَى الْفَلَاحِ<br>حَيَّ عَلَى الْفَلَاحِ'+(i===0?'<br>الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ<br>الصَّلَاةُ خَيْرٌ مِنَ النَّوْمِ':'')+'<br>اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ<br>لَا إِلَهَ إِلَّا اللَّهُ</div>'+
'<div style="margin-top:16px;font-family:Amiri,serif;font-size:21px;line-height:2;opacity:.95"><b style="color:#f3d58a">دعاء بعد الأذان</b><br>اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ</div>'+
'<button id="adhsp" style="margin-top:22px;margin-left:8px;padding:13px 26px;border-radius:999px;border:1px solid #e3b85c;background:none;color:#e3b85c;font-size:18px;font-family:inherit">تشغيل الأذان</button> <button id="adhsx" style="margin-top:22px;padding:13px 40px;border-radius:999px;border:0;background:#e3b85c;color:#1b1b1b;font-size:18px;font-family:inherit">إغلاق وإيقاف الصوت</button></div>';
document.body.appendChild(d);
document.getElementById('adhsp').onclick=function(){try{playSound()}catch(e){window.__log&&__log('play err '+e)}};
if(play){try{playSound()}catch(e){window.__log&&__log('play err '+e)}}
document.getElementById('adhsx').onclick=function(){try{if(typeof stopSound==='function')stopSound()}catch(e){}d.remove()}
}catch(e){window.__log&&__log('adhanScreen err '+e)}}
window.__adhanScreen=adhanScreen;
try{const LN=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;if(LN&&LN.addListener){LN.addListener('localNotificationActionPerformed',function(ev){try{const b=(ev&&ev.notification&&(ev.notification.body||ev.notification.title))||'';if(b.indexOf('الإقامة')>=0)return;let k=-1;if(typeof names!=='undefined')names.forEach(function(n,j){if(b.indexOf(n)>=0&&k<0)k=j});if(k===1)return;adhanScreen(k<0?2:k)}catch(e){}});LN.addListener('localNotificationReceived',function(ev){try{const b=(ev&&ev.notification&&ev.notification.body)||'';if(b.indexOf('حان الآن')<0)return;let k=-1;names.forEach(function(n,j){if(b.indexOf(n)>=0&&k<0)k=j});if(k>=0&&k!==1)adhanScreen(k)}catch(e){}})}}catch(e){}
window.__dua=dua;
try{if(typeof fire==='function'){const f0=fire;fire=function(i){f0.apply(this,arguments);try{if(i!==1&&cfg.on[i])setTimeout(function(){adhanScreen(i)},400)}catch(e){}}}}catch(e){}
if(window.schedule)setTimeout(window.schedule,500);
})();
