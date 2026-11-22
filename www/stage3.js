(function(){
const main=document.querySelector('main'),nav=document.getElementById('nav');if(!main||!nav)return;
const API='https://api.alquran.cloud/v1/';
const REC=[['mishary-alafasy/r1','مشاري العفاسي'],['mahmoud-husary/r1','محمود خليل الحصري'],['muhammad-minshawi/r1','محمد صديق المنشاوي'],['maher-muaiqly/r1','ماهر المعيقلي'],['saud-shuraim/r1','سعود الشريم'],['abdulrahman-sudais/r1','عبدالرحمن السديس'],['ali-hudhaifi/r1','علي الحذيفي'],['yasser-dosari/r1','ياسر الدوسري'],['abdulbasit-abdulsamad/r3','عبدالباسط عبدالصمد (مرتل)'],['saad-ghamdi/r1','سعد الغامدي'],['ahmad-ajmi/r1','أحمد العجمي'],['nasser-qatami/r1','ناصر القطامي'],['badr-turki/r1','بدر التركي'],['muhammad-tablawi/r1','محمد الطبلاوي'],['mustafa-ismail/r1','مصطفى إسماعيل'],['mahmoud-banna/r1','محمود علي البنا'],['abubakr-shatri/r1','أبو بكر الشاطري']];
const AR=n=>Number(n).toLocaleString('ar-EG',{useGrouping:false});
let S=st.get('quran',{s:1,r:0,b:null}),list=null,cur=null,au=null;
const save=()=>st.set('quran',S);
const sec=document.createElement('section');sec.className='sec';sec.id='s-quran';
sec.innerHTML=`<style>
#qtxt{font-family:'Amiri',serif;font-size:25px;line-height:2.3;text-align:justify;color:var(--ink);padding:6px 4px}
#qtxt .ay{cursor:pointer;border-radius:8px}#qtxt .ay.bm{background:var(--accbg)}
#qtxt .no{color:var(--acc);font-size:.7em;margin:0 4px;white-space:nowrap}
.qb{text-align:center;font-family:'Amiri',serif;font-size:28px;color:var(--acc);margin:6px 0}
.qctl{display:flex;gap:8px;margin-bottom:8px}.qctl select{flex:1}
#qaudio{width:100%;margin:6px 0 10px}
</style>
<div class="qctl"><select id="qsur" aria-label="السورة"></select></div>
<div class="qctl"><select id="qrec" aria-label="القارئ">${REC.map((r,i)=>`<option value="${i}">${r[1]}</option>`).join('')}</select><button class="btn" id="qbm" style="flex:none">متابعة من علامتي</button></div>
<audio id="qaudio" controls preload="none"></audio>
<p class="note" id="qnote"></p>
<div class="qb" id="qbsm" hidden>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
<div id="qtxt"></div>
<p class="note">النص: القرآن الكريم برواية حفص عن عاصم (مصحف المدينة) (نص Tanzil عبر api.alquran.cloud). النص مخزّن داخل التطبيق ويعمل بدون إنترنت. التلاوات من cdn.mp3quran.net تُبثّ، ويمكنك تنزيلها لتعمل بدون إنترنت. اضغط على أي آية لوضع علامة متابعة.</p>`;
main.appendChild(sec);
const b=document.createElement('button');b.dataset.t='quran';
b.innerHTML='<svg viewBox="0 0 24 24"><path d="M12 6C10 4.5 7 4 4 4.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13C17 4 14 4.5 12 6z"/><path d="M12 6v12.5"/></svg>القرآن';
nav.insertBefore(b,nav.querySelector('button[data-t=more]')||null);
const E=id=>document.getElementById(id);
function note(t){E('qnote').textContent=t||''}
function loadQ(){return window.QDATA?Promise.resolve():new Promise((ok,no)=>{const x=document.createElement('script');x.src='quran.js';x.onload=ok;x.onerror=no;document.body.appendChild(x)})}
async function get(path,key){try{await loadQ();if(window.QDATA){if(path==='surah')return window.QDATA.list;const m=/^surah\/(\d+)\/quran-uthmani$/.exec(path);if(m&&window.QDATA.s[m[1]])return window.QDATA.s[m[1]]}}catch(e){}
 try{const c=localStorage.getItem(key);if(c)return JSON.parse(c)}catch(e){}
 const r=await fetch(API+path);if(!r.ok)throw new Error(r.status);const j=await r.json();const d=j.data;try{localStorage.setItem(key,JSON.stringify(d))}catch(e){}return d}
async function init(){
 try{list=await get('surah','q_list');E('qsur').innerHTML=list.map(s=>`<option value="${s.number}">${AR(s.number)}. ${s.name.replace('سُورَةُ ','')} (${s.numberOfAyahs} آية)</option>`).join('')}
 catch(e){E('qsur').innerHTML=Array.from({length:114},(_,i)=>`<option value="${i+1}">سورة ${AR(i+1)}</option>`).join('');note('مفيش إنترنت دلوقتي. الأسماء والنص هيظهروا لما النت يشتغل.')}
 E('qsur').value=S.s;E('qrec').value=S.r;load(S.s)}
async function load(n){S.s=n;save();E('qtxt').innerHTML='<p class="note">جاري التحميل…</p>';setAudio(n);
 try{const d=await get('surah/'+n+'/quran-uthmani','q_'+n);cur=d;note('');
  E('qbsm').hidden=(n===1||n===9);
  E('qtxt').innerHTML=d.ayahs.map(a=>{let t=a.text.replace(/^\uFEFF/,'');if(a.numberInSurah===1&&n!==1&&n!==9){t=t.split(' ').slice(4).join(' ')}
   return `<span class="ay ${S.b&&S.b[0]===n&&S.b[1]===a.numberInSurah?'bm':''}" data-a="${a.numberInSurah}">${t}<span class="no">﴿${AR(a.numberInSurah)}﴾</span></span> `}).join('');
  main.scrollTop=0;try{window.__qpInit&&__qpInit()}catch(e){}}
 catch(e){E('qtxt').innerHTML='';note('ماقدرتش أحمّل السورة. اتأكد من الإنترنت وجرب تاني.')}}
function setAudio(n){const a=E('qaudio');const was=!a.paused;const url='https://cdn.mp3quran.net/audio/'+REC[S.r][0]+'/'+String(n).padStart(3,'0')+'.mp3';const go=u=>{a.src=u;if(was)a.play().catch(()=>{})};if(window.__qOff)window.__qOff(url,go);else go(url)}
window.__qSetAudio=setAudio;window.__REC=REC;
E('qsur').onchange=e=>load(+e.target.value);
E('qrec').onchange=e=>{S.r=+e.target.value;save();setAudio(S.s)};
E('qaudio').onended=()=>{if(S.s<114){E('qsur').value=S.s+1;load(S.s+1);E('qaudio').play().catch(()=>{})}};
E('qaudio').onerror=()=>note('التلاوة مش بتشتغل دلوقتي. اتأكد من الإنترنت أو جرب قارئ تاني.');
E('qtxt').onclick=e=>{const a=e.target.closest('.ay');if(!a)return;S.b=[S.s,+a.dataset.a];save();document.querySelectorAll('#qtxt .ay.bm').forEach(x=>x.classList.remove('bm'));a.classList.add('bm');note('تم وضع علامة المتابعة عند الآية '+AR(a.dataset.a))};
E('qbm').onclick=()=>{if(!S.b){note('اضغط على آية الأول عشان تحط علامة.');return}const[s,a]=S.b;const go=()=>{const el=document.querySelector('#qtxt .ay[data-a="'+a+'"]');if(el){if(window.__qpGo)__qpGo(el);else el.scrollIntoView({block:'center'})}};if(S.s!==s){E('qsur').value=s;load(s).then(go)}else go()};
init();
})();
