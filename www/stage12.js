/* v3.1: أذان من ملف المستخدم (محلي). الملف بيتحفظ جوّه التطبيق بس، مش جزء من التطبيق ومش بيتنشر. */
(function(){try{
var AA=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AdhanAlarm;
if(!AA||!AA.customInfo)return;
var DEF=[0,0,1,1,1,1]; /* الافتراضي مؤقت لحد ما أحمد يحسم: الفجر مقفول، الأربع صلوات التانية شغالة */
var NM=['الفجر',null,'الظهر','العصر','المغرب','العشاء'];
var cu=st.get('cu',null)||{on:DEF.slice(),name:'',ms:0,has:false};
if(!cu.on||cu.on.length!==6)cu.on=DEF.slice();
var path='',tst=null;
function save(){st.set('cu',cu)}
window.__cuOn=function(i){return !!(cu.has&&i!==1&&cu.on[i]===1)};
function resched(){try{window.__fsSched&&window.__fsSched()}catch(e){}}
function fmt(ms){var s=Math.round(ms/1000),m=Math.floor(s/60);return m+':'+('0'+(s%60)).slice(-2)}
var old=document.getElementById('file');if(old&&old.parentNode&&old.parentNode.parentNode){old.parentNode.style.display='none'}
var box=document.createElement('div');box.id='cuBox';box.style.cssText='margin-top:14px;padding:12px;border:1px solid rgba(128,128,128,.35);border-radius:12px';
box.innerHTML='<h3 style="margin:0 0 6px;font-size:16px">أذان من ملفك</h3>'+
'<p class="note" style="margin:0 0 8px">اختار ملف الأذان من موبايلك. بيتحفظ جوّه التطبيق بس ومش بيتشارك مع حد، وبيشتغل والتطبيق مقفول والشاشة مقفولة. لو الملف مش موجود أو ما اشتغلش، بيشتغل الأذان العادي اللي اخترته فوق.</p>'+
'<div class="loc"><label class="btn" style="flex:1;text-align:center">اختر ملف<input type="file" id="cuFile" accept="audio/*,.m4a,.mp3,.aac,.ogg,.wav" hidden></label><button class="btn" id="cuTest">جرّب</button><button class="btn" id="cuDel">احذف</button></div>'+
'<p class="note" id="cuSt" style="margin:8px 0"></p><div id="cuRows" style="display:flex;flex-wrap:wrap;gap:8px"></div>'+
'<p class="note" style="margin:8px 0 0">الصلوات المفعّلة بتستخدم ملفك. الباقي بيستخدم الأذان العادي.</p>';
var anchor=document.getElementById('snote');
if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(box,anchor.nextSibling);else return;
function $c(i){return document.getElementById(i)}
function draw(){
 $c('cuSt').textContent=cu.has?('الملف: '+(cu.name||'ملف الأذان')+' ('+fmt(cu.ms)+')'):'لسه ما اخترتش ملف.';
 $c('cuTest').disabled=!cu.has;$c('cuDel').disabled=!cu.has;
 var h='';[0,2,3,4,5].forEach(function(i){var on=cu.on[i]===1;h+='<button class="btn cuP" data-i="'+i+'" aria-pressed="'+on+'" style="min-width:76px;'+(on?'background:#0D463A;color:#fff':'')+'">'+NM[i]+(on?' ✓':'')+'</button>'});
 $c('cuRows').innerHTML=h;$c('cuRows').style.opacity=cu.has?'1':'.5'}
$c('cuRows').addEventListener('click',function(e){var b=e.target.closest('.cuP');if(!b)return;var i=+b.dataset.i;cu.on[i]=cu.on[i]===1?0:1;save();draw();resched()});
function stopT(){if(tst){try{tst.pause()}catch(e){}tst=null;$c('cuTest').textContent='جرّب'}}
$c('cuTest').onclick=function(){if(tst){stopT();return}
 try{if(typeof stopSound==='function')stopSound()}catch(e){}
 var src=Capacitor.convertFileSrc?Capacitor.convertFileSrc(path.indexOf('file://')===0?path:'file://'+path):path;
 tst=new Audio(src+'?t='+Date.now());tst.onended=stopT;tst.onerror=function(){$c('cuSt').textContent='ما قدرتش أشغّل الملف هنا. جرّب ملف تاني.';stopT()};
 tst.play().then(function(){$c('cuTest').textContent='إيقاف'}).catch(function(){$c('cuSt').textContent='ما قدرتش أشغّل الملف هنا. جرّب ملف تاني.';stopT()})};
$c('cuDel').onclick=function(){stopT();AA.customClear().then(function(){cu.has=false;cu.name='';cu.ms=0;save();draw();resched()})};
function rd(f){return f.arrayBuffer?f.arrayBuffer():new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result)};r.onerror=function(){rej(r.error)};r.readAsArrayBuffer(f)})}
function b64(u8){var s='';for(var i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s)}
async function doImport(f){
 var MAX=15*1024*1024;
 if(f.size>MAX){$c('cuSt').textContent='الملف كبير (أكتر من ١٥ ميجا). اختار ملف أصغر.';return}
 stopT();$c('cuSt').textContent='جاري الحفظ…';
 try{var ab=await rd(f),u8=new Uint8Array(ab),CH=196608;
  for(var o=0;o<u8.length;o+=CH){await AA.customWrite({data:b64(u8.subarray(o,o+CH)),append:o>0});$c('cuSt').textContent='جاري الحفظ… '+Math.min(100,Math.round((o+CH)*100/u8.length))+'%'}
  var r=await AA.customCommit({name:f.name});
  var inf=await AA.customInfo();path=inf.path||'';
  cu.has=true;cu.name=f.name;cu.ms=r.ms;save();draw();resched();
  $c('cuSt').textContent='تم حفظ الأذان من ملفك ('+fmt(r.ms)+'). اضغط جرّب تسمعه.'
 }catch(e){var m=String(e&&e.message||e);
  try{var i2=await AA.customInfo();cu.has=!!i2.has;save()}catch(x){}draw();
  $c('cuSt').textContent=/not_audio/.test(m)?'الملف ده مش صوت أو ما اتفتحش. جرّب ملف MP3 أو M4A.':/too_big/.test(m)?'الملف كبير (أكتر من ١٥ ميجا).':'ما قدرتش أحفظ الملف. جرّب تاني.'}}
$c('cuFile').onchange=function(e){var f=e.target.files&&e.target.files[0];if(f)doImport(f);e.target.value=''};
window.__cuImport=doImport;
AA.customInfo().then(function(i){path=i.path||'';if(!i.has&&cu.has){cu.has=false;save()}if(i.has&&!cu.has){cu.has=true;cu.name=i.name||'';cu.ms=i.ms||0;save()}draw();resched()}).catch(function(){draw()});
draw();
/* لو شاشة الأذان اتفتحت لصلاة مفعّل لها ملفك: نفس الصوت، من غير توقيت الكلمات بتاع الأذانات الجاهزة */
try{var _as=window.__adhanScreen;if(_as){window.__adhanScreen=function(i){window.__cuCur=i;return _as.apply(this,arguments)}}}catch(e){}
try{var _ps=window.playSound;window.playSound=function(){if(window.__cuCur!=null&&window.__cuOn(window.__cuCur)&&path){try{stopSound()}catch(x){}
 var src=Capacitor.convertFileSrc(path.indexOf('file://')===0?path:'file://'+path);au=new Audio(src+'?t='+Date.now());au.play().catch(function(){});return}return _ps.apply(this,arguments)}}catch(e){}
}catch(e){window.__log&&__log('stage12 err '+e)}})();
