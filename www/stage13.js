/* v3.1: إقامة من ملفات المستخدم (محلي). الملفين بيتحفظوا جوّه التطبيق بس، مش جزء من التطبيق ومش بيتنشروا. */
(function(){try{
var AA=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AdhanAlarm;
if(!AA||!AA.customInfo)return;
var SL=[{n:1,k:'iq1',t:'إقامة المسجد النبوي (١٤٢٠هـ)',sz:'٠٫٨',u:'archive.org/details/1420_20220701'},{n:2,k:'iq2',t:'إقامة الشيخ ماجد عباس (الحرم المكي)',sz:'٠٫٧',u:'archive.org/details/IqamaMakkahIsha3111434SheikhMajedAbbas'}];
var S=st.get('iqc',null)||{sel:1,has:[false,false],ms:[0,0],name:['','']};
if(!S.has||S.has.length!==2)S={sel:1,has:[false,false],ms:[0,0],name:['','']};
var paths=['',''],tst=null,tn=-1;
function save(){st.set('iqc',S)}
/* الأول هو الافتراضي: لو اتحدد ملفه شغّال، وإلا التاني، وإلا الإقامة العادية */
window.__iqSlot=function(){var o=S.sel===2?[1,0]:[0,1];for(var j=0;j<2;j++)if(S.has[o[j]])return o[j]+1;return 0};
function resched(){try{window.schedule&&window.schedule()}catch(e){}try{window.__fsSched&&window.__fsSched()}catch(e){}}
function fmt(ms){var s=Math.round(ms/1000),m=Math.floor(s/60);return m+':'+('0'+(s%60)).slice(-2)}
function $c(i){return document.getElementById(i)}
var box=document.createElement('div');box.id='iqcBox';box.style.cssText='margin-top:14px;padding:12px;border:1px solid rgba(128,128,128,.35);border-radius:12px';
var h='<h3 style="margin:0 0 6px;font-size:16px">إقامة من ملفاتك</h3><p class="note" style="margin:0 0 8px">دوس «تحميل» وكل إقامة بتتنزّل مرة واحدة من archive.org وبتتحفظ جوّه التطبيق بس. تقدر كمان تختار ملف من موبايلك. وبتشتغل بعد الأذان بالدقايق اللي حددتها والتطبيق مقفول. الإقامة المختارة (الأولى هي الافتراضية) هي اللي بتشتغل، ولو ملفها مش موجود بتشتغل التانية، وبعدها الإقامة العادية.</p>';
SL.forEach(function(s,j){h+='<div style="margin:8px 0;padding:8px;border-radius:10px;border:1px solid rgba(128,128,128,.25)"><div style="display:flex;justify-content:space-between;align-items:center"><b id="iqcT'+s.n+'">'+s.t+'</b><button class="btn" id="iqcS'+s.n+'"></button></div><div class="loc" style="margin-top:6px"><button class="btn" id="iqcL'+s.n+'" style="flex:1">تحميل ('+s.sz+' ميجا)</button><label class="btn" style="text-align:center">ملف<input type="file" id="iqcF'+s.n+'" accept="audio/*,.m4a,.mp3,.aac,.ogg,.wav" hidden></label><button class="btn" id="iqcP'+s.n+'">جرّب</button><button class="btn" id="iqcD'+s.n+'">احذف</button></div><p class="note" id="iqcM'+s.n+'" style="margin:6px 0 0"></p><p class="note" style="margin:2px 0 0;font-size:11px;opacity:.7;direction:ltr;text-align:left">'+s.u+'</p></div>'});
box.innerHTML=h;
try{var dg=document.createElement('button');dg.className='btn';dg.style.cssText='margin-top:10px;font-size:13px;opacity:.8';dg.textContent='تشخيص (سجل التنبيهات)';dg.onclick=function(){try{window.__diag()}catch(e){}};box.appendChild(dg)}catch(e){}
try{var sb=document.createElement('button');sb.className='btn';sb.id='silB';sb.style.cssText='display:block;width:100%;margin-top:12px';var sm=document.createElement('div');sm.id='silM';sm.className='note';sm.style.cssText='text-align:right;margin-top:6px';
async function sdraw(){try{var i=await AA.silentInfo();sb.textContent='سكوت الموبايل بعد الإقامة (١٥ دقيقة): '+(i.on?'مفعّل ✓':'متوقف');if(!sm.dataset.msg)sm.textContent='بعد ما الإقامة تخلص الموبايل بيبقى صامت ١٥ دقيقة وبعدين يرجع زي ما كان. التطبيق مش بيغيّر وضع الصوت إلا لو أنت فعّلت ده ومنحت الإذن.'}catch(e){}}
sb.onclick=async function(){try{var i=await AA.silentInfo();var r=await AA.setSilent({on:!i.on});if(r&&r.needAccess){sm.dataset.msg='1';sm.textContent='فتحت لك صفحة «الوصول إلى عدم الإزعاج». فعّل «نور المسلم» فيها وارجع، وبعدين دوس هنا تاني. لو ما فعّلتهاش التطبيق مش هيغيّر وضع الصوت.'}else{sm.dataset.msg='';}sdraw()}catch(e){}};
box.appendChild(sb);box.appendChild(sm);sdraw();document.addEventListener('visibilitychange',function(){if(!document.hidden)sdraw()})}catch(e){}
var anchor=document.getElementById('iqb');
if(anchor&&anchor.parentNode)anchor.parentNode.insertBefore(box,anchor.nextSibling);else return;
function draw(){SL.forEach(function(s,j){var has=S.has[j];
 $c('iqcM'+s.n).textContent=has?('الملف: '+(S.name[j]||'ملف الإقامة')+' ('+fmt(S.ms[j])+')'):'لسه ما اتحمّلتش. لحد ما تتحمّل بتشتغل الإقامة العادية.';
 $c('iqcP'+s.n).disabled=!has;$c('iqcD'+s.n).disabled=!has;
 var on=window.__iqSlot()===s.n;$c('iqcS'+s.n).textContent=on?'المستخدمة ✓':(S.sel===s.n?'مختارة':'استخدم دي');
 $c('iqcS'+s.n).style.cssText=on?'background:#0D463A;color:#fff':''})}
function stopT(){if(tst){try{tst.pause()}catch(e){}tst=null;if(tn>0)$c('iqcP'+tn).textContent='جرّب';tn=-1}}
function rd(f){return f.arrayBuffer?f.arrayBuffer():new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result)};r.onerror=function(){rej(r.error)};r.readAsArrayBuffer(f)})}
function b64(u8){var s='';for(var i=0;i<u8.length;i+=8192)s+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(s)}
async function doImport(n,f){var j=n-1,k=SL[j].k,M=$c('iqcM'+n);
 if(f.size>15*1024*1024){M.textContent='الملف كبير (أكتر من ١٥ ميجا). اختار ملف أصغر.';return}
 stopT();M.textContent='جاري الحفظ…';
 try{var u8=new Uint8Array(await rd(f)),CH=196608;
  for(var o=0;o<u8.length;o+=CH){await AA.customWrite({slot:k,data:b64(u8.subarray(o,o+CH)),append:o>0})}
  var r=await AA.customCommit({slot:k,name:f.name});var inf=await AA.customInfo({slot:k});paths[j]=inf.path||'';
  S.has[j]=true;S.name[j]=f.name;S.ms[j]=r.ms;save();draw();resched();
  M.textContent='تم حفظ الإقامة ('+fmt(r.ms)+'). اضغط جرّب تسمعها.'
 }catch(e){var m=String(e&&e.message||e);
  try{var i2=await AA.customInfo({slot:k});S.has[j]=!!i2.has;save()}catch(x){}draw();
  M.textContent=/not_audio/.test(m)?'الملف ده مش صوت أو ما اتفتحش. جرّب ملف MP3 أو M4A.':/too_big/.test(m)?'الملف كبير (أكتر من ١٥ ميجا).':'ما قدرتش أحفظ الملف. جرّب تاني.'}}
SL.forEach(function(s,j){var n=s.n;
 $c('iqcF'+n).onchange=function(e){var f=e.target.files&&e.target.files[0];if(f)doImport(n,f);e.target.value=''};
 $c('iqcS'+n).onclick=function(){S.sel=n;save();draw();resched()};
 $c('iqcD'+n).onclick=function(){stopT();AA.customClear({slot:s.k}).then(function(){S.has[j]=false;S.name[j]='';S.ms[j]=0;save();draw();resched()})};
 $c('iqcP'+n).onclick=function(){if(tst&&tn===n){stopT();return}stopT();try{if(typeof stopSound==='function')stopSound()}catch(e){}
  var p=paths[j],src=Capacitor.convertFileSrc?Capacitor.convertFileSrc(p.indexOf('file://')===0?p:'file://'+p):p;
  tst=new Audio(src+'?t='+Date.now());tn=n;tst.onended=stopT;
  tst.onerror=function(){$c('iqcM'+n).textContent='ما قدرتش أشغّل الملف هنا. جرّب ملف تاني.';stopT()};
  tst.play().then(function(){$c('iqcP'+n).textContent='إيقاف'}).catch(function(){$c('iqcM'+n).textContent='ما قدرتش أشغّل الملف هنا. جرّب ملف تاني.';stopT()})}});

async function dl(n,test){var j=n-1,k=SL[j].k,M=$c('iqcM'+n),B=$c('iqcL'+n);B.disabled=true;M.textContent='جاري التحميل…';
 try{var a=test?{slot:k,name:SL[j].t,testurl:test.url,testsize:test.size}:{slot:k,name:SL[j].t};var r=await AA.customDownload(a);var inf=await AA.customInfo({slot:k});paths[j]=inf.path||'';
  S.has[j]=true;S.name[j]=SL[j].t;S.ms[j]=r.ms;save();draw();resched();M.textContent='تم التحميل ('+fmt(r.ms)+'). اضغط جرّب تسمعها.';B.disabled=false;return 'ok'
 }catch(e){var m=String(e&&e.message||e);B.disabled=false;
  M.textContent=/offline/.test(m)?'مفيش إنترنت دلوقتي. الإقامة العادية هتشتغل لحد ما تحمّل. جرّب تاني لما النت يرجع.':/http_/.test(m)?'الموقع مش بيرد دلوقتي ('+m.replace(/\D/g,'')+'). جرّب بعدين.':/size_mismatch/.test(m)?'الملف اللي نزل مش هو المتوقع (حجمه مختلف). ما اتحفظش.':/not_audio/.test(m)?'الملف اللي نزل مش صوت. ما اتحفظش.':'التحميل ما نفعش. جرّب تاني.';return m}}
window.__iqcDl=dl;
try{if(AA.addListener)AA.addListener('dl',function(e){var j=e.slot==='iq2'?1:0,M=$c('iqcM'+(j+1));if(M&&e.total)M.textContent='جاري التحميل… '+Math.min(100,Math.round(e.done*100/e.total))+'%'})}catch(e){}
SL.forEach(function(s){var b=$c('iqcL'+s.n);if(b)b.onclick=function(){dl(s.n)}});
/* مرة واحدة بعد خطوات الصلاحيات: عرض تحميل الإقامتين */
(function(){var tries=0;function ask(){try{if(st.get('iqdlq',0))return;if(++tries>200)return;
 if(document.getElementById('wiz')||document.getElementById('adhs')||document.getElementById('intro')||S.has[0]&&S.has[1]){if(S.has[0]&&S.has[1])st.set('iqdlq',1);return setTimeout(ask,3000)}
 st.set('iqdlq',1);var d=document.createElement('div');d.id='iqdlq';d.setAttribute('style','position:fixed;left:14px;right:14px;top:30%;z-index:9400;background:#10261f;color:#fff;border:1px solid #e3b85c;border-radius:16px;padding:18px;direction:rtl;text-align:center;font-family:inherit');
 d.innerHTML='<div style="font-size:17px;margin-bottom:8px">تحميل الإقامتين</div><div style="font-size:14px;opacity:.9;line-height:1.7">إقامة المسجد النبوي وإقامة الشيخ ماجد عباس، حوالي ١٫٦ ميجا (من archive.org). بيتحفظوا جوّه التطبيق وبيشتغلوا بعد الأذان. لو مفيش نت بتشتغل الإقامة العادية.</div><div style="margin-top:12px"><button id="iqdy" style="padding:10px 26px;border-radius:999px;border:0;background:#e3b85c;color:#1b1b1b;font-size:16px">تحميل</button> <button id="iqdn" style="padding:8px 18px;border-radius:999px;border:1px solid #fff;background:none;color:#fff;font-size:14px">لاحقًا</button></div>';
 document.body.appendChild(d);$c('iqdn').onclick=function(){d.remove()};$c('iqdy').onclick=function(){d.remove();dl(1).then(function(){return dl(2)})}}catch(e){}}
setTimeout(ask,4000)})();
window.__iqcDlAsk=function(){st.set('iqdlq',0)};
window.__iqcImport=doImport;window.__iqcT=function(){return tst};
Promise.all(SL.map(function(s){return AA.customInfo({slot:s.k})})).then(function(a){a.forEach(function(i,j){paths[j]=i.path||'';if(!i.has&&S.has[j])S.has[j]=false;if(i.has&&!S.has[j]){S.has[j]=true;S.name[j]=i.name||'';S.ms[j]=i.ms||0}});save();draw();resched()}).catch(function(){draw()});
draw();
}catch(e){try{window.__log&&__log('stage13 '+e)}catch(x){}}})();
