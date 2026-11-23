(function(){
const AA=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AdhanAlarm;
const L=m=>{try{window.__log&&__log('fs: '+m)}catch(e){}};
if(!AA){L('AdhanAlarm plugin not present (browser or old build)');return}
let canFS=true;
function warn(){try{if(document.getElementById('fsw'))return;if(st.get('fsw',0)>Date.now())return;
 AA.status().then(function(s){try{
  const need=[];
  if(s.overlay===false)need.push(['overlay','اسمح بـ "الظهور فوق التطبيقات الأخرى" عشان شاشة الأذان تفتح لوحدها حتى والموبايل شغال']);
  if(s.fullScreen===false)need.push(['fs','اسمح بـ "الإشعارات بملء الشاشة" عشان تظهر فوق القفل']);
  if(s.battery===false)need.push(['battery','اختر "بدون قيود" للبطارية عشان النظام ما يقفلش التنبيه']);
  if(!need.length||document.getElementById('fsw'))return;
  const d=document.createElement('div');d.id='fsw';d.setAttribute('style','position:fixed;left:8px;right:8px;bottom:70px;z-index:98;background:#0f4a3e;color:#fff;border:1px solid #e3b85c;border-radius:12px;padding:10px 12px;font-size:13px;direction:rtl');
  let h='<b>عشان الأذان يشتغل بصوته والتطبيق مقفول:</b><br>';
  need.forEach(function(n){h+='<div style="margin-top:6px">'+n[1]+'<br><button data-w="'+n[0]+'" style="margin-top:4px;padding:7px 14px;border-radius:999px;border:0;background:#e3b85c;color:#1b1b1b">فتح الإعداد</button></div>'});
  h+='<button id="fsc" style="margin-top:10px;padding:7px 14px;border-radius:999px;border:1px solid #fff;background:none;color:#fff">لاحقًا</button>';
  d.innerHTML=h;document.body.appendChild(d);
  d.querySelectorAll('button[data-w]').forEach(function(b){b.onclick=function(){const w=b.getAttribute('data-w');if(w==='fs')AA.openSettings();else AA.openSettings2({what:w});d.remove();st.set('fsw',Date.now()+36e5)}});
  document.getElementById('fsc').onclick=function(){st.set('fsw',Date.now()+864e5);d.remove()}
 }catch(e){}}).catch(function(){})}catch(e){}}
async function sched(){try{
 const now=Date.now(),A=[];
 for(let d=0;d<7;d++){const ts=calc(new Date(now+d*864e5),loc.lat,loc.lng);
  ts.forEach((t,i)=>{if(i===1||!cfg.on[i]||t<=now)return;const m='حان الآن موعد صلاة '+names[i];A.push({at:+t,idx:i,ch:(/^adhan[1-6]$/.test(cfg.snd)?'adhan_'+cfg.snd.slice(5):'adhan'),body:m,big:m+'\n\nدعاء بعد الأذان: اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ'})})}
 A.sort((a,b)=>a.at-b.at);
 const r=await AA.schedule({alarms:A.slice(0,60)});canFS=r.canFullScreen!==false;L('scheduled '+r.scheduled+' fs='+canFS);warn()
}catch(e){L('schedule err '+(e&&e.message||e));if(window.__nativeAdhan){window.__nativeAdhan=false;try{window.schedule&&window.schedule()}catch(x){}}}}
function showAd(i,fa,n){try{if(window.__adhanScreen){const e=document.getElementById('intro');if(e)e.remove();__adhanScreen(i,null,false,fa);console.log('NOORT adhs '+Math.round(performance.now()));setTimeout(function(){var q=document.getElementById('adq');if(q)q.remove()},400);return}if(n<60)setTimeout(function(){showAd(i,fa,n+1)},500)}catch(e){}}
async function chk(){try{const r=await AA.getLaunch();canFS=r.canFullScreen!==false;if(r.idx>=0){L('launched from alarm idx '+r.idx);showAd(r.idx,r.firedAt||Date.now(),0)}}catch(e){L('getLaunch err '+(e&&e.message||e))}}
window.__fsSched=sched;window.__fsChk=chk;
try{const _ss=window.stopSound;if(_ss)window.stopSound=function(){try{AA.stopAdhan()}catch(e){}return _ss.apply(this,arguments)}}catch(e){}
const _s=window.schedule;
if(_s)window.schedule=function(){const r=_s.apply(this,arguments);setTimeout(sched,2500);return r};
document.addEventListener('visibilitychange',function(){if(!document.hidden)chk()});
if(window.Capacitor&&Capacitor.Plugins.App&&Capacitor.Plugins.App.addListener){Capacitor.Plugins.App.addListener('appStateChange',function(s){if(s&&s.isActive)setTimeout(chk,200)})}
chk();sched();
})();
