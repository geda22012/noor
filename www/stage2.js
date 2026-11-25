(function(){
const sec=document.getElementById('s-more');if(!sec)return;
const AR=n=>Number(n).toLocaleString('ar-EG',{useGrouping:false});
function hij(d){try{const p=new Intl.DateTimeFormat('en-u-ca-islamic-umalqura',{day:'numeric',month:'numeric',year:'numeric'}).formatToParts(d);const g=t=>+p.find(x=>x.type===t).value;return {d:g('day'),m:g('month'),y:g('year')}}catch(e){return null}}
const HM=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
const OCC=[[1,1,'رأس السنة الهجرية'],[9,1,'تاسوعاء (يُستحب صيامه)'],[10,1,'عاشوراء (يُستحب صيامه)'],[12,3,'المولد النبوي الشريف'],[27,7,'الإسراء والمعراج'],[15,8,'ليلة النصف من شعبان'],[1,9,'أول رمضان'],[27,9,'ليلة القدر (تقريبًا، ليلة ٢٧)'],[1,10,'عيد الفطر'],[9,12,'يوم عرفة (يُستحب صيامه)'],[10,12,'عيد الأضحى']];
const occOf=h=>h?OCC.filter(o=>o[0]===h.d&&o[1]===h.m).map(o=>o[2]):[];
const key=d=>d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();
/* ---------- جدول الشهر ---------- */
let mo=new Date();mo=new Date(mo.getFullYear(),mo.getMonth(),1);
const dow=['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
function monthTable(){
 const y=mo.getFullYear(),m=mo.getMonth(),n=new Date(y,m+1,0).getDate(),today=key(new Date());
 let rows='';
 for(let i=1;i<=n;i++){const d=new Date(y,m,i),t=calc(d,loc.lat,loc.lng),h=hij(d);
  rows+=`<tr class="${key(d)===today?'td':''}"><th>${AR(i)}<small>${dow[d.getDay()]}</small></th><td class="hj">${h?AR(h.d)+' '+HM[h.m-1]:''}</td>${[0,2,3,4,5].map(k=>`<td>${fmt(t[k]).replace(' ','<br>')}</td>`).join('')}</tr>`}
 document.getElementById('mtab').innerHTML=`<div class="ln row"><button class="btn" id="mprev">◀</button><b>${mo.toLocaleDateString('ar-EG',{month:'long',year:'numeric'})}</b><button class="btn" id="mnext">▶</button></div><div style="overflow-x:auto"><table class="mt"><thead><tr><th>اليوم</th><th>هجري</th><th>الفجر</th><th>الظهر</th><th>العصر</th><th>المغرب</th><th>العشاء</th></tr></thead><tbody>${rows}</tbody></table></div><p class="note">${loc.n} — حسب طريقة الحساب المختارة في الإعدادات.</p>`;
 document.getElementById('mprev').onclick=()=>{mo=new Date(y,m-1,1);monthTable()};
 document.getElementById('mnext').onclick=()=>{mo=new Date(y,m+1,1);monthTable()};
}
/* ---------- التقويم الهجري والمناسبات ---------- */
function hijriCal(){
 const now=new Date(),h=hij(now);let up=[];
 for(let i=0;i<400;i++){const d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i),hh=hij(d);occOf(hh).forEach(o=>up.push([i,o,d]))}
 const hd=h?`${AR(h.d)} ${HM[h.m-1]} ${AR(h.y)} هـ`:'';
 document.getElementById('hcal').innerHTML=`<p class="q" style="font-size:20px;text-align:center">${hd}</p>`+
 (h&&h.d>=13&&h.d<=15?'<p class="note">النهارده من الأيام البيض (١٣ و١٤ و١٥)، يُستحب صيامها.</p>':'')+
 '<div>'+up.slice(0,8).map(([i,o,d])=>`<div class="ln row"><b>${o}</b><span>${d.toLocaleDateString('ar-EG',{weekday:'short',day:'numeric',month:'short'})} — ${i===0?'النهارده':'بعد '+AR(i)+' يوم'}</span></div>`).join('')+'</div>'+
 '<p class="note">التاريخ الهجري محسوب بالتقويم الرقمي (أم القرى) وممكن يختلف يوم عن إعلان دار الإفتاء المصرية، والمناسبات تقريبية لحد الرؤية.</p>';
}
/* ---------- تذكيرات السنن ---------- */
let sn=Object.assign({fri:1,mt:1,wd:1},st.get('sunna',{}));
function sunnaUI(){const b=(k,t)=>`<button class="btn" data-k="${k}" style="width:100%;margin-bottom:8px">${t}: ${sn[k]?'مفعّل ✓':'متوقف'}</button>`;
 document.getElementById('sunna').innerHTML=b('fri','الجمعة: سورة الكهف والصلاة على النبي ﷺ (٩ص)')+b('mt','صيام الاثنين والخميس (تذكير ٨م اليوم اللي قبله)')+b('wd','الأيام البيض (تذكير ٨م قبلها)')}
function sunnaNotes(startId){const out=[],now=Date.now();let id=startId;
 for(let i=0;i<8;i++){const d=new Date(new Date().getFullYear(),new Date().getMonth(),new Date().getDate()+i);
  const at=(dd,h)=>new Date(dd.getFullYear(),dd.getMonth(),dd.getDate(),h,0,0).getTime();
  const add=(t,body)=>{if(t>now)out.push({id:id++,title:'نور المسلم',body,schedule:{at:new Date(t),allowWhileIdle:true},channelId:'remind'})};
  if(sn.fri&&d.getDay()===5)add(at(d,9),'يوم الجمعة: اقرأ سورة الكهف وأكثر من الصلاة على النبي ﷺ');
  const nx=new Date(d.getFullYear(),d.getMonth(),d.getDate()+1);
  if(sn.mt&&(nx.getDay()===1||nx.getDay()===4))add(at(d,20),'غدًا '+(nx.getDay()===1?'الاثنين':'الخميس')+': تنوي الصيام؟');
  const hn=hij(nx);if(sn.wd&&hn&&hn.d>=13&&hn.d<=15)add(at(d,20),'غدًا من الأيام البيض: تنوي الصيام؟')}
 return out}
window.sunnaNotes=sunnaNotes;
const mk=(t,id,open)=>{const x=document.createElement('details');if(open)x.open=true;x.innerHTML=`<summary>${t}</summary><div id="${id}"></div>`;sec.appendChild(x);return x};
const dm=mk('جدول مواقيت الشهر','mtab'),dh=mk('التقويم الهجري والمناسبات','hcal'),ds=mk('تذكيرات السنن (الجمعة والصيام)','sunna');
const css=document.createElement('style');css.textContent='.mt{width:100%;border-collapse:collapse;font-size:12px;text-align:center}.mt th,.mt td{padding:6px 2px;border-bottom:1px solid var(--line)}.mt th small{display:block;color:var(--mut);font-weight:400;font-size:10px}.mt thead th{color:var(--mut);font-size:11px}.mt .td{background:var(--accbg)}.mt .hj{font-size:10px;color:var(--mut)}';document.head.appendChild(css);
dm.addEventListener('toggle',()=>{if(dm.open)monthTable()});dh.addEventListener('toggle',()=>{if(dh.open)hijriCal()});
sunnaUI();
ds.onclick=e=>{const b=e.target.closest('button[data-k]');if(!b)return;sn[b.dataset.k]=sn[b.dataset.k]?0:1;st.set('sunna',sn);sunnaUI();if(typeof schedule==='function')schedule()};
})();
