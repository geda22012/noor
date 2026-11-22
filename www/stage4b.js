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
})();
