(function(){
window.__nativeAdhan=!!(window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AdhanAlarm);
const LN=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;
const dk=()=>{const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
/* صوت الأذان: ملف الأذان المضمّن ثم جرس احتياطي */
playSound=function(){stopSound();if(/^adhan[1-8]$/.test(cfg.snd)){au=new Audio(cfg.snd+'.mp3');au.play().catch(()=>beep([440,330]));return}if(cfg.snd==='adhan'){au=new Audio(adhanData||'adhan.mp3');au.play().catch(()=>beep([440,330]));return}beep(cfg.snd==='chime'?[523,659,784]:[440,330])};
$('#test').onclick=()=>playSound();
/* تنبيهات أندرويد الأصلية: 7 أيام قدام */
async function schedule(){if(!LN)return;try{
 const pr=await LN.requestPermissions();if(pr.display==='denied')return;
 await LN.createChannel({id:'adhan',name:'الأذان',importance:5,sound:'adhan.mp3',vibration:true});
 await LN.createChannel({id:'adhan_1',name:'الأذان (صباح فخري)',importance:5,sound:'adhan1.mp3',vibration:true});
 await LN.createChannel({id:'adhan_2',name:'الأذان (الحرم المكي)',importance:5,sound:'adhan2.mp3',vibration:true});
 await LN.createChannel({id:'adhan_3',name:'الأذان (آقب عزيز)',importance:5,sound:'adhan3.mp3',vibration:true});
 await LN.createChannel({id:'adhan_4',name:'الأذان (قونيا)',importance:5,sound:'adhan4.mp3',vibration:true});
 await LN.createChannel({id:'adhan_5',name:'الأذان (إسطنبول)',importance:5,sound:'adhan5.mp3',vibration:true});
 await LN.createChannel({id:'adhan_6',name:'الأذان (الحرم المكي مغرب)',importance:5,sound:'adhan6.mp3',vibration:true});
 await LN.createChannel({id:'adhan_7',name:'الأذان (مسجد الحسن الثاني)',importance:5,sound:'adhan7.mp3',vibration:true});
 await LN.createChannel({id:'adhan_8',name:'الأذان (الحرم المكي ٢)',importance:5,sound:'adhan8.mp3',vibration:true});
 const CH=/^adhan[1-8]$/.test(cfg.snd)?'adhan_'+cfg.snd.slice(5):'adhan';
 await LN.createChannel({id:'remind',name:'تذكير قبل الصلاة',importance:4});
 await LN.createChannel({id:'iqamah',name:'الإقامة',importance:5,sound:'iqamah.mp3',vibration:true});
 const pend=await LN.getPending();if(pend.notifications.length)await LN.cancel({notifications:pend.notifications});
 const L=[],now=Date.now();let id=1;
 for(let d=0;d<7;d++){const ts=calc(new Date(now+d*864e5),loc.lat,loc.lng);
  ts.forEach((t,i)=>{if(!cfg.on[i]||t<=now)return;
   if(!window.__nativeAdhan||i===1)L.push({id:id++,title:'نور',body:i===1?'الشمس تشرق الآن':'حان الآن موعد صلاة '+names[i],schedule:{at:t,allowWhileIdle:true},channelId:CH,largeBody:(i===1?'الشمس تشرق الآن':'حان الآن موعد صلاة '+names[i])+'\n\nدعاء بعد الأذان: اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ'});
   try{const IQ=st.get('iq',{on:true,m:[10,10,10,10,10]}),q=[0,2,3,4,5].indexOf(i);if(IQ.on&&q>=0){const iq=new Date(+t+(+IQ.m[q]||10)*6e4);if(iq>now)L.push({id:id++,title:'نور',body:'الإقامة: صلاة '+names[i],schedule:{at:iq,allowWhileIdle:true},channelId:'iqamah'})}}catch(e){}
   const r=new Date(t-15*6e4);
   if(cfg.pre&&i!==1&&r>now)L.push({id:id++,title:'نور',body:'باقي ١٥ دقيقة على صلاة '+names[i],schedule:{at:r,allowWhileIdle:true},channelId:'remind'})})}
 try{if(window.sunnaNotes)L.push(...window.sunnaNotes(10000))}catch(e){}
 if(L.length)await LN.schedule({notifications:L});
}catch(e){}}
window.schedule=schedule;const _r=refresh;let tm;refresh=function(){_r();clearTimeout(tm);tm=setTimeout(schedule,1500)};
$('#alerts').addEventListener('click',()=>setTimeout(schedule,300));
$('#snd').addEventListener('change',()=>setTimeout(schedule,300));
/* في نسخة APK الإشعارات أصلية */
if(window.Capacitor){const p=$('#perm');if(p)p.style.display='none';$('#snote').textContent='التنبيهات بتشتغل والشاشة مقفولة. اختار الأذان من القائمة (١ أو ٢) وجرّب الصوت. تسجيلات الأذان من ويكيميديا كومنز: صباح فخري وآقب عزيز وقونيا وإسطنبول والحرم المكي، والتفاصيل في README.'}
schedule();
/* تبويب المزيد */
const sec=document.createElement('section');sec.className='sec';sec.id='s-more';
sec.innerHTML=`<details open><summary>متابعة صلواتي اليوم</summary><div id="trk"></div><p class="note" id="streak"></p></details>
<details><summary>ختمة القرآن</summary><div class="bar"><i id="khb"></i></div><p class="note" id="kht"></p><div class="ln"><button class="btn" data-p="1">+١ صفحة</button><button class="btn" data-p="5">+٥</button><button class="btn" data-p="-1">−١</button><select id="khg" style="width:auto"><option value="30">٣٠ يوم</option><option value="60">٦٠ يوم</option><option value="90">٩٠ يوم</option></select></div></details>
<details><summary>حاسبة الزكاة</summary>
<label class="fld"><span>النقد والمدخرات (بالجنيه)</span><input id="z1" type="number" inputmode="decimal" placeholder="مثال: 50000"></label>
<label class="fld"><span>وزن الذهب بالجرام (عيار ٢١ أو ٢٤)</span><input id="z2" type="number" inputmode="decimal" placeholder="مثال: 10"></label>
<label class="fld"><span>سعر جرام الذهب اليوم (بالجنيه)</span><input id="z3" type="number" inputmode="decimal" placeholder="مثال: 3800"></label>
<label class="fld"><span>الديون المستحقة عليك (تُخصم)</span><input id="z4" type="number" inputmode="decimal" placeholder="مثال: 0"></label>
<p class="q" id="zr" style="font-size:18px"></p><p class="note">النصاب ٨٥ جرام ذهب والمقدار ٢٫٥٪ بعد مرور سنة هجرية. النتيجة تقريبية، راجع دار الإفتاء.</p></details>
<details><summary>طريقة حساب المواقيت</summary><select id="mth"><option value="0">الهيئة المصرية (١٩٫٥ / ١٧٫٥)</option><option value="1">رابطة العالم الإسلامي (١٨ / ١٧)</option><option value="2">أم القرى (١٨٫٥ / العشاء بعد المغرب ٩٠ د)</option><option value="3">كراتشي (١٨ / ١٨)</option></select><select id="asr" style="margin-top:8px"><option value="1">العصر: المذهب الشافعي</option><option value="2">العصر: المذهب الحنفي</option></select><div id="adj" style="margin-top:8px"></div></details>
<details><summary>المظهر والتذكير</summary><button class="btn" id="pre" style="width:100%;margin-bottom:8px"></button><button class="btn" id="thm" style="width:100%;margin-bottom:8px"></button><label class="fld"><span>شكل التطبيق (الواجهة والخلفية)</span><select id="skin"><option value="">أخضر وذهبي (الأصلي)</option><option value="emerald">زمردي بزخارف إسلامية</option><option value="night">ليل بنجوم وهلال</option><option value="sand">رمل ذهبي بأرابيسك</option></select></label></details>`;
document.querySelector('main').appendChild(sec);
const nb=document.createElement('button');nb.dataset.t='more';
nb.innerHTML='<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>المزيد';
$('#nav').appendChild(nb);
/* متابعة الصلوات */
const P5=[0,2,3,4,5];let trk=st.get('trk',{});
function drawTrk(){const t=trk[dk()]||[0,0,0,0,0];
 $('#trk').innerHTML=P5.map((p,i)=>`<div class="ln row"><b>${names[p]}</b><button class="btn" data-i="${i}">${t[i]?'صلّيت ✓':'لسه'}</button></div>`).join('');
 let s=0,d=new Date();const full=x=>{const k=x.getFullYear()+'-'+(x.getMonth()+1)+'-'+x.getDate();return (trk[k]||[]).filter(Boolean).length===5};
 if(!full(d))d.setDate(d.getDate()-1);while(full(d)){s++;d.setDate(d.getDate()-1)}
 $('#streak').textContent='أيام متتالية بالخمس صلوات: '+ar(s)}
$('#trk').onclick=e=>{const b=e.target.closest('button');if(!b)return;const k=dk(),t=trk[k]||[0,0,0,0,0];t[+b.dataset.i]^=1;trk[k]=t;st.set('trk',trk);drawTrk()};
/* ختمة */
let kh=st.get('kh',{r:0,g:30});
function drawKh(){const left=604-kh.r,per=Math.ceil(left/kh.g);
 $('#khb').style.width=Math.min(100,kh.r/604*100)+'%';$('#khg').value=kh.g;
 $('#kht').textContent=left>0?`قرأت ${ar(kh.r)} من ٦٠٤ صفحة. وردك اليومي ${ar(per)} صفحة.`:'ما شاء الله، أتممت الختمة 🤍';st.set('kh',kh)}
sec.querySelector('#khb').closest('details').onclick=e=>{const b=e.target.closest('button[data-p]');if(!b)return;kh.r=Math.max(0,Math.min(604,kh.r+ +b.dataset.p));drawKh()};
$('#khg').onchange=e=>{kh.g=+e.target.value;drawKh()};
/* زكاة */
const zc=()=>{const v=i=>+$('#z'+i).value||0,nis=85*v(3),w=v(1)+v(2)*v(3)-v(4);
 $('#zr').textContent=!v(3)?'أدخل سعر جرام الذهب لحساب النصاب.':w>=nis?'زكاتك حوالي '+ar((w*.025).toFixed(2))+' جنيه':'مالك أقل من النصاب ('+ar(Math.round(nis))+' جنيه) فلا زكاة عليك.'};
[1,2,3,4].forEach(i=>$('#z'+i).oninput=zc);zc();
/* طريقة الحساب */
const MT=[[19.5,17.5,0],[18,17,0],[18.5,17,90],[18,18,0]];
function saveMet(){st.set('met',MET);refresh()}
$('#mth').onchange=e=>{const m=MT[+e.target.value];MET.f=m[0];MET.i=m[1];MET.im=m[2];MET.k=+e.target.value;saveMet()};
$('#asr').onchange=e=>{MET.h=+e.target.value;saveMet()};
$('#mth').value=String(MET.k||0);$('#asr').value=String(MET.h);
function drawAdj(){$('#adj').innerHTML=names.map((n,i)=>`<div class="ln row"><b>${n}</b><span><button class="btn" data-i="${i}" data-d="-1">−</button> <span>${ar(MET.adj[i])} د</span> <button class="btn" data-i="${i}" data-d="1">+</button></span></div>`).join('')}
$('#adj').onclick=e=>{const b=e.target.closest('button');if(!b)return;MET.adj[+b.dataset.i]+=+b.dataset.d;drawAdj();saveMet()};
/* مظهر وتذكير */
const th=['تلقائي','فاتح','داكن'],tv=[null,'light','dark'];let ti=st.get('thm',0);
function drawSet(){$('#pre').textContent='تذكير قبل الصلاة بـ ١٥ دقيقة: '+(cfg.pre?'مفعّل ✓':'متوقف');$('#thm').textContent='المظهر: '+th[ti];
 tv[ti]?document.documentElement.setAttribute('data-theme',tv[ti]):document.documentElement.removeAttribute('data-theme')}
$('#pre').onclick=()=>{cfg.pre=cfg.pre?0:1;st.set('cfg',cfg);drawSet();schedule()};
$('#thm').onclick=()=>{ti=(ti+1)%3;st.set('thm',ti);drawSet()};
function applySkin(v){v?document.documentElement.setAttribute('data-skin',v):document.documentElement.removeAttribute('data-skin')}
let skin=st.get('skin','');applySkin(skin);$('#skin').value=skin;$('#skin').onchange=e=>{skin=e.target.value;st.set('skin',skin);applySkin(skin)};
drawTrk();drawKh();drawAdj();drawSet();
})();
