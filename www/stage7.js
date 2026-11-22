(function(){
const sec=document.getElementById('s-settings');if(!sec||window.__s7)return;window.__s7=1;
const dig=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const P=['الفجر','الظهر','العصر','المغرب','العشاء'];
const get=()=>{const v=st.get('iq',null);return v&&v.m&&v.m.length===5?v:{on:true,m:[10,10,10,10,10]}};
let iq=get();
const sv=()=>{st.set('iq',iq);if(window.schedule)setTimeout(window.schedule,200)};
const css=document.createElement('style');css.textContent='#iqb{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:12px;margin:14px 0}#iqb h3{margin:0 0 8px;font-family:"Reem Kufi",sans-serif;font-size:17px}#iqb .r{display:flex;justify-content:space-between;align-items:center;padding:6px 0}#iqb .r input{width:84px;text-align:center;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--bg)}#duac{position:fixed;inset:0;z-index:150;background:#000a;display:flex;align-items:center;justify-content:center;padding:18px}#duac>div{background:var(--surf);color:var(--ink);border-radius:20px;max-width:460px;width:100%;padding:20px;text-align:center;max-height:90%;overflow:auto}#duac h3{margin:0 0 10px;color:var(--acc);font-family:"Reem Kufi",sans-serif}#duac p.d{font-family:"Amiri",serif;font-size:calc(24px*var(--fs,1));line-height:2.1;margin:0 0 10px}#duac small{display:block;color:var(--mut);line-height:1.8;margin-bottom:12px}';document.head.appendChild(css);
const b=document.createElement('div');b.id='iqb';
function draw(){b.innerHTML='<h3>الإقامة</h3><button type="button" class="btn" id="iqt" style="width:100%;margin-bottom:8px">'+(iq.on?'إشعار الإقامة مفعّل ✓':'إشعار الإقامة متوقف')+'</button>'+P.map((n,i)=>'<div class="r"><span>'+n+'</span><span><input type="number" inputmode="numeric" min="1" max="60" data-i="'+i+'" value="'+iq.m[i]+'"> دقيقة بعد الأذان</span></div>').join('')+'<p class="note">بتجيلك إشعار بصوت الإقامة بعد الأذان بالدقايق اللي تحددها لكل صلاة. تسجيل الإقامة من ويكيميديا كومنز (CC0). التغيير بيتطبق على التنبيهات الجاية.</p>'}
draw();sec.appendChild(b);
b.addEventListener('click',e=>{if(e.target.id==='iqt'){iq.on=!iq.on;sv();draw()}});
b.addEventListener('change',e=>{const t=e.target;if(t.dataset.i===undefined)return;let v=Math.round(+t.value);if(!(v>=1))v=10;if(v>60)v=60;iq.m[+t.dataset.i]=v;t.value=v;sv()});
/* دعاء بعد الأذان عند فتح التطبيق وقت الأذان */
function dua(i){if(document.getElementById('duac'))return;const d=document.createElement('div');d.id='duac';
 d.innerHTML='<div><h3>دعاء بعد الأذان</h3><p class="d">اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ، [إِنَّكَ لا تُخْلِفُ الْمِيعَادَ]</p><small>قال النبي ﷺ: «من قال حين يسمع النداء: اللهم رب هذه الدعوة التامة... حلّت له شفاعتي يوم القيامة». رواه البخاري. (زيادة «إنك لا تخلف الميعاد» عند البيهقي، ولذلك هي بين قوسين في حصن المسلم.)<br>رددها بعد أن تجيب المؤذن وتصلي على النبي ﷺ، وادعُ لنفسك بين الأذان والإقامة فالدعاء لا يُردّ.</small><button type="button" class="btn pri" id="duax" style="width:100%">آمين</button></div>';
 document.body.appendChild(d);document.getElementById('duax').onclick=()=>d.remove()}
window.__dua=dua;
try{if(typeof fire==='function'){const f0=fire;fire=function(i){f0.apply(this,arguments);try{if(i!==1&&cfg.on[i])setTimeout(function(){dua(i)},1500)}catch(e){}}}}catch(e){}
if(window.schedule)setTimeout(window.schedule,500);
})();
