(function(){
const AA=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AdhanAlarm;
const L=m=>{try{window.__log&&__log('fs: '+m)}catch(e){}};
if(!AA){L('AdhanAlarm plugin not present (browser or old build)');return}
let canFS=true;
const LNp=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;
function wizItems(s){return [
 ['notif','إشعارات الأذان','عشان التطبيق يقدر ينبّهك',s.notif!==false,async function(){try{if(LNp){const r=await LNp.requestPermissions();if(r&&r.display==='denied'){AA.openSettings2({what:'app'})}}else AA.openSettings2({what:'app'})}catch(e){AA.openSettings2({what:'app'})}}],
 ['loc','تحديد الموقع','عشان مواقيت الصلاة والقبلة تبقى حسب مكانك',s.loc!==false,function(){return AA.requestLocation()}],
 ['battery','تشغيل في الخلفية بدون قيود','عشان النظام ما يقفلش الأذان',s.battery!==false,function(){return AA.requestBattery()}],
 ['overlay','الظهور فوق التطبيقات الأخرى','عشان شاشة الأذان تفتح لوحدها والموبايل شغال (هتفتح لك صفحة التطبيق، فعّل الزرار)',s.overlay!==false,function(){try{var d=document.createElement('div');d.id='ovhint';d.style.cssText='position:fixed;left:10px;right:10px;top:70px;z-index:9999;background:#1f5a3a;color:#fff;font-size:15px;line-height:1.6;padding:14px;border-radius:12px;direction:rtl;text-align:center';d.textContent='هتفتح صفحة إعدادات الموبايل. دوس على «نور المسلم» في القائمة وفعّل «السماح بالعرض فوق التطبيقات الأخرى»، وبعدين ارجع للتطبيق.';document.body.appendChild(d);setTimeout(function(){d.remove()},9000)}catch(e){}return new Promise(function(r){setTimeout(r,2500)}).then(function(){return AA.openSettings2({what:'overlay'})})}],
 ['fs','الإشعارات بملء الشاشة','عشان تظهر فوق القفل (أندرويد ١٤ وأعلى بس)',s.fullScreen!==false,function(){return AA.openSettings()}]]}
let autoBusy=0;
function autoNext(its,miss){
 if(autoBusy&&Date.now()-autoBusy<25000)return true;
 if(document.hidden)return true;
 its.forEach(function(x){if(x[3]&&st.get('aut_'+x[0],0))st.set('aut_'+x[0],0)});
 const nx=miss.find(function(x){return st.get('aut_'+x[0],0)<2});
 if(!nx)return false;
 st.set('aut_'+nx[0],st.get('aut_'+nx[0],0)+1);autoBusy=Date.now();L('auto-request '+nx[0]);
 var run=nx[0]==='notif'&&LNp?function(){return LNp.requestPermissions()}:nx[4];
 Promise.resolve().then(run).catch(function(){}).then(function(){if(nx[0]==='notif'){autoBusy=0;setTimeout(function(){wiz(true)},700)}});
 return true}
function autoResume(){autoBusy=0}
let wizBusy=false;
async function wiz(force){try{
 if(window.__adhLaunched||document.getElementById('adhs')||document.getElementById('adq')){var w0=document.getElementById('wiz');if(w0)w0.remove();return}
 if(!force&&st.get('fsw',0)>Date.now())return;
 const s=await AA.status();const its=wizItems(s),miss=its.filter(x=>!x[3]);
 if(miss.length&&autoNext(its,miss))return;
 let d=document.getElementById('wiz');
 if(!miss.length){if(d){d.innerHTML='<div style="font-size:22px;margin-bottom:12px">تمام، الأذان جاهز ✓</div><button id="wzx" style="padding:11px 28px;border-radius:999px;border:0;background:#e3b85c;color:#1b1b1b;font-size:16px">إغلاق</button>';document.getElementById('wzx').onclick=function(){d.remove()};setTimeout(function(){var e=document.getElementById('wiz');if(e)e.remove()},3000)}return}
 if(!d){d=document.createElement('div');d.id='wiz';d.setAttribute('style','position:fixed;top:0;right:0;bottom:0;left:0;z-index:9600;background:rgba(6,16,14,.96);color:#fff;direction:rtl;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;font-family:inherit');document.body.appendChild(d)}
 let h='<div style="font-size:22px;margin-bottom:6px">تجهيز الأذان</div><div style="font-size:14px;opacity:.8;margin-bottom:16px">خطوات سريعة عشان الأذان يشتغل بصوته والتطبيق مقفول</div><div style="width:100%;max-width:420px;text-align:right">';
 its.forEach(function(x){h+='<div style="display:flex;gap:10px;align-items:flex-start;margin:8px 0;opacity:'+(x[3]?'.55':'1')+'"><span style="font-size:20px">'+(x[3]?'✓':'○')+'</span><span><b>'+x[1]+'</b><br><span style="font-size:13px;opacity:.85">'+x[2]+'</span></span></div>'});
 h+='</div><button id="wzn" style="margin-top:18px;padding:12px 30px;border-radius:999px;border:0;background:#e3b85c;color:#1b1b1b;font-size:17px">فعّل: '+miss[0][1]+'</button><button id="wzl" style="margin-top:10px;padding:8px 18px;border-radius:999px;border:1px solid #fff;background:none;color:#fff;font-size:14px">لاحقًا</button>';
 var sg=its.map(x=>x[3]?1:0).join('');if(d.dataset.sig===sg&&document.getElementById('wzn'))return;d.dataset.sig=sg;
 d.innerHTML=h;
 document.getElementById('wzn').onclick=async function(){try{await miss[0][4]()}catch(e){}};
 document.getElementById('wzl').onclick=function(){st.set('fsw',Date.now()+864e5);d.remove()};
}catch(e){}}
async function sched(){try{
 const now=Date.now(),A=[];
 for(let d=0;d<7;d++){const ts=calc(new Date(now+d*864e5),loc.lat,loc.lng);
  ts.forEach((t,i)=>{if(i===1||!cfg.on[i]||t<=now)return;const m='حان الآن موعد صلاة '+names[i];A.push({at:+t,idx:i,ch:(/^adhan[1-6]$/.test(cfg.snd)?'adhan_'+cfg.snd.slice(5):'adhan'),cu:(window.__cuOn&&window.__cuOn(i))?1:0,body:m,big:m+'\n\nدعاء بعد الأذان: اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ'});try{var IQs=window.__iqSlot?window.__iqSlot():0,IQc=st.get('iq',{on:true,m:[10,10,10,10,10]}),qi=[0,2,3,4,5].indexOf(i);if(IQs>0&&IQc.on&&qi>=0){var iat=+t+(+IQc.m[qi]||10)*6e4;if(iat>now)A.push({at:iat,idx:i,ch:'iqamah',iq:IQs,body:'الإقامة: صلاة '+names[i]})}}catch(e){}})}
 A.sort((a,b)=>a.at-b.at);
 const r=await AA.schedule({alarms:A.slice(0,60)});canFS=r.canFullScreen!==false;L('scheduled '+r.scheduled+' fs='+canFS);warn()
}catch(e){L('schedule err '+(e&&e.message||e));if(window.__nativeAdhan){window.__nativeAdhan=false;try{window.schedule&&window.schedule()}catch(x){}}}}
function warn(){setTimeout(function(){wiz(false)},1200)}
window.__fsWiz=function(){wiz(true)};
function showAd(i,fa,n){try{window.__adhLaunched=1;var w1=document.getElementById('wiz');if(w1)w1.remove();if(window.__adhanScreen){const e=document.getElementById('intro');if(e)e.remove();__adhanScreen(i,null,false,fa);console.log('NOORT adhs '+Math.round(performance.now()));setTimeout(function(){var q=document.getElementById('adq');if(q)q.remove()},400);return}if(n<60)setTimeout(function(){showAd(i,fa,n+1)},500)}catch(e){}}
async function chk(){try{const r=await AA.getLaunch();canFS=r.canFullScreen!==false;if(r.azkar&&window.__openAzkar)try{window.__openAzkar(r.azkar)}catch(e){}
 if(r.idx>=0){window.__adhLaunched=1;var w2=document.getElementById('wiz');if(w2)w2.remove();L('launched from alarm idx '+r.idx);showAd(r.idx,r.firedAt||Date.now(),0)}}catch(e){L('getLaunch err '+(e&&e.message||e))}}
window.__fsSched=sched;window.__fsChk=chk;
try{const _ss=window.stopSound;if(_ss)window.stopSound=function(){try{AA.stopAdhan()}catch(e){}return _ss.apply(this,arguments)}}catch(e){}
const _s=window.schedule;
if(_s)window.schedule=function(){const r=_s.apply(this,arguments);setTimeout(sched,2500);return r};
document.addEventListener('visibilitychange',function(){if(!document.hidden){autoResume();chk();setTimeout(function(){if(document.getElementById('wiz'))wiz(true)},400)}});
if(window.Capacitor&&Capacitor.Plugins.App&&Capacitor.Plugins.App.addListener){Capacitor.Plugins.App.addListener('appStateChange',function(s){if(s&&s.isActive){autoResume();setTimeout(chk,200);setTimeout(function(){if(document.getElementById('wiz'))wiz(true)},500)}})}
setInterval(function(){if(document.getElementById('wzx'))return;if(document.getElementById('wiz'))wiz(true);else if(st.get('fsw',0)<=Date.now()&&!document.hidden)wiz(false)},1500);
chk();sched();setTimeout(function(){wiz(false)},2500);
})();
