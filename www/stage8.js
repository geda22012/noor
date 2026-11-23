(function(){
const AA=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AdhanAlarm;
const L=m=>{try{window.__log&&__log('fs: '+m)}catch(e){}};
if(!AA){L('AdhanAlarm plugin not present (browser or old build)');return}
let canFS=true;
const LNp=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.LocalNotifications;
function wizItems(s){return [
 ['notif','إشعارات الأذان','عشان التطبيق يقدر ينبّهك',s.notif!==false,async function(){try{if(LNp){const r=await LNp.requestPermissions();if(r&&r.display==='denied'){AA.openSettings2({what:'app'})}}else AA.openSettings2({what:'app'})}catch(e){AA.openSettings2({what:'app'})}}],
 ['battery','تشغيل في الخلفية بدون قيود','عشان النظام ما يقفلش الأذان',s.battery!==false,function(){return AA.requestBattery()}],
 ['overlay','الظهور فوق التطبيقات الأخرى','عشان شاشة الأذان تفتح لوحدها والموبايل شغال (هتفتح لك صفحة التطبيق، فعّل الزرار)',s.overlay!==false,function(){return AA.openSettings2({what:'overlay'})}],
 ['fs','الإشعارات بملء الشاشة','عشان تظهر فوق القفل (أندرويد ١٤ وأعلى بس)',s.fullScreen!==false,function(){return AA.openSettings()}]]}
let wizBusy=false;
async function wiz(force){try{
 if(document.getElementById('adhs')||document.getElementById('adq'))return;
 if(!force&&st.get('fsw',0)>Date.now())return;
 const s=await AA.status();const its=wizItems(s),miss=its.filter(x=>!x[3]);
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
  ts.forEach((t,i)=>{if(i===1||!cfg.on[i]||t<=now)return;const m='حان الآن موعد صلاة '+names[i];A.push({at:+t,idx:i,ch:(/^adhan[1-6]$/.test(cfg.snd)?'adhan_'+cfg.snd.slice(5):'adhan'),body:m,big:m+'\n\nدعاء بعد الأذان: اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ'})})}
 A.sort((a,b)=>a.at-b.at);
 const r=await AA.schedule({alarms:A.slice(0,60)});canFS=r.canFullScreen!==false;L('scheduled '+r.scheduled+' fs='+canFS);warn()
}catch(e){L('schedule err '+(e&&e.message||e));if(window.__nativeAdhan){window.__nativeAdhan=false;try{window.schedule&&window.schedule()}catch(x){}}}}
function warn(){setTimeout(function(){wiz(false)},1200)}
window.__fsWiz=function(){wiz(true)};
function showAd(i,fa,n){try{if(window.__adhanScreen){const e=document.getElementById('intro');if(e)e.remove();__adhanScreen(i,null,false,fa);console.log('NOORT adhs '+Math.round(performance.now()));setTimeout(function(){var q=document.getElementById('adq');if(q)q.remove()},400);return}if(n<60)setTimeout(function(){showAd(i,fa,n+1)},500)}catch(e){}}
async function chk(){try{const r=await AA.getLaunch();canFS=r.canFullScreen!==false;if(r.idx>=0){L('launched from alarm idx '+r.idx);showAd(r.idx,r.firedAt||Date.now(),0)}}catch(e){L('getLaunch err '+(e&&e.message||e))}}
window.__fsSched=sched;window.__fsChk=chk;
try{const _ss=window.stopSound;if(_ss)window.stopSound=function(){try{AA.stopAdhan()}catch(e){}return _ss.apply(this,arguments)}}catch(e){}
const _s=window.schedule;
if(_s)window.schedule=function(){const r=_s.apply(this,arguments);setTimeout(sched,2500);return r};
document.addEventListener('visibilitychange',function(){if(!document.hidden){chk();setTimeout(function(){if(document.getElementById('wiz'))wiz(true)},400)}});
if(window.Capacitor&&Capacitor.Plugins.App&&Capacitor.Plugins.App.addListener){Capacitor.Plugins.App.addListener('appStateChange',function(s){if(s&&s.isActive){setTimeout(chk,200);setTimeout(function(){if(document.getElementById('wiz'))wiz(true)},500)}})}
setInterval(function(){if(document.getElementById('wiz')&&!document.getElementById('wzx'))wiz(true)},1500);
chk();sched();setTimeout(function(){wiz(false)},5000);
})();
