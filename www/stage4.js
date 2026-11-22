(function(){
const main=document.querySelector('main'),nav=document.getElementById('nav');if(!main||!nav)return;
const E=id=>document.getElementById(id);
/* ================= القبلة ================= */
const norm=a=>((a%360)+360)%360;
let target=null,shown=0,raf=0,got=0,srcs=[],started=false,lastEv=0,noEvTimer=0,jit=[];
function fromAbs(e){ // heading من alpha/beta/gamma (حساب مصحح بالميل)
 if(e.webkitCompassHeading!=null&&!isNaN(e.webkitCompassHeading))return e.webkitCompassHeading;
 if(e.alpha==null)return null;
 const r=Math.PI/180,z=e.alpha*r,x=(e.beta||0)*r,y=(e.gamma||0)*r;
 const cA=Math.cos(z),sA=Math.sin(z),sB=Math.sin(x),cB=Math.cos(x),sG=Math.sin(y),cG=Math.cos(y);
 const Vx=-cA*sG-sA*sB*cG,Vy=-sA*sG+cA*sB*cG; // اتجاه ضهر الموبايل (لما يكون واقف)
 const Tx=-sA*cB,Ty=cA*cB; // اتجاه راس الموبايل (لما يكون مسطح)
 return Math.hypot(Vx,Vy)>Math.hypot(Tx,Ty)?norm(Math.atan2(Vx,Vy)/r):norm(Math.atan2(Tx,Ty)/r);
}
function scr(){try{return (screen.orientation&&screen.orientation.angle)||window.orientation||0}catch(e){return 0}}
function feed(h){if(h==null||isNaN(h))return;h=norm(h+scr());got++;lastEv=Date.now();
 if(target==null){target=h;shown=h}else{target=h}
 jit.push(h);if(jit.length>30)jit.shift();
 sensingOn()}
function sensingOn(){if(!sensing){sensing=true}const c=E('compass');if(c)c.textContent='البوصلة شغّالة ✓';E('qmanual').hidden=true;clearTimeout(noEvTimer);
 if(!raf)raf=requestAnimationFrame(loop)}
function loop(){raf=0;if(target==null)return;
 const d=((target-shown+540)%360)-180;shown=norm(shown+d*0.18);
 heading=shown;drawQibla();
 // تلميح المعايرة لو القراءات بتقفز
 if(jit.length>=20){let m=0;for(let i=1;i<jit.length;i++)m+=Math.abs(((jit[i]-jit[i-1]+540)%360)-180);E('qcal').hidden=!(m/jit.length>6)}
 if(Math.abs(d)>0.2||Date.now()-lastEv<500)raf=requestAnimationFrame(loop)}
function onAbs(e){if(e.absolute===false&&!srcs.includes('abs'))return;srcs.push('abs');feed(fromAbs(e))}
function onRel(e){ // deviceorientation: نستخدمه بس لو مطلق أو فيه webkitCompassHeading ومفيش absolute
 if(srcs.includes('abs'))return;
 if(e.webkitCompassHeading!=null||e.absolute===true)feed(fromAbs(e))}
async function startCompass(){
 if(started&&got)return;started=true;
 try{
  const D=window.DeviceOrientationEvent;
  if(D&&typeof D.requestPermission==='function'){const r=await D.requestPermission();if(r!=='granted'){E('qnote').textContent='لازم تسمح بالوصول لحساسات الحركة.';manual();return}}
 }catch(e){}
 window.addEventListener('deviceorientationabsolute',onAbs,true);
 window.addEventListener('deviceorientation',onRel,true);
 try{ if('AbsoluteOrientationSensor' in window){const s=new AbsoluteOrientationSensor({frequency:30,referenceFrame:'screen'});s.addEventListener('reading',()=>{const q=s.quaternion;if(!q)return;const [x,y,z,w]=q;const yaw=Math.atan2(2*(w*z+x*y),1-2*(y*y+z*z));if(!srcs.includes('abs')){srcs.push('sensor');feed(norm(-yaw*180/Math.PI))}});s.addEventListener('error',()=>{});s.start()} }catch(e){}
 clearTimeout(noEvTimer);noEvTimer=setTimeout(()=>{if(!got)manual()},3500)}
function manual(){E('qmanual').hidden=false;E('compass').textContent='جرّب تشغيل البوصلة تاني';started=false;
 if(!got)E('qnote').textContent='الجهاز مش بيبعت قراءات بوصلة (الحساس مش موجود أو مقفول). استخدم المؤشر اللي تحت: لف الدايرة لحد ما الشمال يتوافق مع شمال حقيقي، أو وجّه الموبايل ناحية الزاوية المكتوبة.'}
const q=E('s-qibla');
q.insertAdjacentHTML('beforeend',`<p class="note" id="qcal" hidden>القراءات مش ثابتة. عشان تظبط البوصلة: حرّك الموبايل في الهوا على شكل رقم ٨ كذا مرة، وابعد عن المعادن والمغناطيس وجراب الموبايل المغناطيسي.</p>
<div id="qmanual" hidden style="margin-top:10px"><label class="fld"><span>اتجاه الموبايل بالدرجات (٠ = شمال)</span><input type="range" id="qrange" min="0" max="359" value="0" style="width:100%"></label></div>`);
E('qrange').oninput=e=>{target=shown=+e.target.value;heading=shown;sensing=true;drawQibla()};
E('compass').onclick=()=>{started=false;got=0;srcs=[];startCompass()};
E('qnote').textContent='ضع الموبايل أفقيًا (مسطّح) وبعيدًا عن المعادن والمغناطيس. لما الكعبة تبقى فوق، أنت في اتجاه القبلة.';
nav.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.t==='qibla')setTimeout(startCompass,50)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){target=target}});
/* ================= أيقونة إعدادات التطبيق ================= */
const css=document.createElement('style');css.textContent=`#gear{position:fixed;z-index:8;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--surf);color:var(--ink);display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;box-shadow:0 2px 8px #0002}#gear svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
html{--fs:1}#qtxt{font-size:calc(25px*var(--fs))!important}.card p{font-size:calc(21px*var(--fs))!important}
.sg{margin-bottom:14px}.sg h3{font-family:'Reem Kufi',sans-serif;margin:0 0 8px;font-size:17px}`;document.head.appendChild(css);
const g=document.createElement('button');g.id='gear';g.setAttribute('aria-label','إعدادات التطبيق');
g.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
document.body.appendChild(g);
const AP=st.get('app',{fs:1,vib:1});
const sec=document.createElement('section');sec.className='sec';sec.id='s-app';
sec.innerHTML=`<h2 style="margin-bottom:12px">إعدادات التطبيق</h2>
<div class="sg"><h3>حجم الخط</h3><div class="loc" style="margin:0"><button class="btn" data-fs="0.9">صغير</button><button class="btn" data-fs="1">عادي</button><button class="btn" data-fs="1.2">كبير</button><button class="btn" data-fs="1.4">كبير جدًا</button></div><p class="note">بيتطبق على القرآن والأذكار.</p></div>
<div class="sg"><h3>الاهتزاز</h3><button class="btn" id="avib" style="width:100%"></button><p class="note">اهتزاز السبحة والأذكار عند الضغط.</p></div>
<div class="sg"><h3>اختصارات لإعدادات موجودة</h3><button class="btn" data-go="times" style="width:100%;margin-bottom:8px">المدينة والموقع (صفحة المواقيت)</button><button class="btn" data-go="settings" style="width:100%;margin-bottom:8px">تنبيهات الأذان والصوت</button><button class="btn" data-go="more" style="width:100%">طريقة الحساب والشكل والتذكيرات (المزيد)</button><p class="note">الإعدادات دي فضلت في أماكنها زي ما هي، والأزرار دي بتفتحلك الصفحة بس.</p></div>
<div class="sg"><h3>البيانات</h3><button class="btn" id="aclr" style="width:100%">مسح نصوص القرآن المحفوظة</button><p class="note" id="amsg">مش هيمسح إعداداتك ولا مدينتك ولا متابعتك.</p></div>
<div class="sg" style="text-align:center;padding:14px;border:1px solid var(--line);border-radius:16px;background:var(--surf)"><h3 style="color:var(--acc)">صدقة جارية</h3><p style="font-family:'Amiri',serif;font-size:22px;line-height:2;margin:0">هذا التطبيق صدقة جارية عن روح والدي ووالدتي.<br>اللهم ارحمهما واغفر لهما، وأسكنهما فسيح جناتك، واجعل هذا العمل في ميزان حسناتهما.<br>ولا تنسوهما من دعائكم.</p></div>
<div class="sg" style="margin-top:14px"><h3>عن نور</h3><p class="note">نسخة 1.8. صدقة جارية عن روح والدي ووالدتي. أصوات الأذان من ويكيميديا كومنز (التفاصيل في README المشروع). نص القرآن من api.alquran.cloud والتلاوات من cdn.mp3quran.net.</p></div>`;
main.appendChild(sec);
function applyApp(){document.documentElement.style.setProperty('--fs',AP.fs);E('avib').textContent='الاهتزاز: '+(AP.vib?'مفعّل ✓':'متوقف');sec.querySelectorAll('[data-fs]').forEach(b=>b.style.outline=(+b.dataset.fs===AP.fs)?'2px solid var(--acc)':'none')}
applyApp();
const ov=navigator.vibrate&&navigator.vibrate.bind(navigator);if(ov){navigator.vibrate=function(p){return AP.vib?ov(p):false}}
sec.onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.fs){AP.fs=+b.dataset.fs;st.set('app',AP);applyApp()}
 else if(b.id==='avib'){AP.vib=AP.vib?0:1;st.set('app',AP);applyApp()}
 else if(b.dataset.go){show(b.dataset.go)}
 else if(b.id==='aclr'){let n=0;try{Object.keys(localStorage).filter(k=>/^q_\d+$|^q_list$/.test(k)).forEach(k=>{localStorage.removeItem(k);n++})}catch(x){}E('amsg').textContent='اتمسح '+n+' عنصر محفوظ.'}};
g.onclick=()=>{show('app');document.querySelectorAll('nav button').forEach(x=>x.classList.remove('on'))};
})();
