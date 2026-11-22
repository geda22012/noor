(function(){
const AA=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AdhanAlarm;
const L=m=>{try{window.__log&&__log('fs: '+m)}catch(e){}};
if(!AA){L('AdhanAlarm plugin not present (browser or old build)');return}
let canFS=true;
function warn(){try{if(canFS||document.getElementById('fsw')||st.get('fsw',0)>Date.now())return;
 const d=document.createElement('div');d.id='fsw';d.setAttribute('style','position:fixed;left:8px;right:8px;bottom:70px;z-index:98;background:#0f4a3e;color:#fff;border:1px solid #e3b85c;border-radius:12px;padding:10px 12px;font-size:13px;direction:rtl');
 d.innerHTML='عشان شاشة الأذان تظهر لوحدها فوق القفل لازم تسمح بـ "الإشعارات بملء الشاشة" للتطبيق.<br><button id="fsb" style="margin-top:8px;padding:8px 16px;border-radius:999px;border:0;background:#e3b85c;color:#1b1b1b">فتح الإعدادات</button> <button id="fsc" style="margin:8px 6px 0;padding:8px 14px;border-radius:999px;border:1px solid #fff;background:none;color:#fff">لاحقًا</button>';
 document.body.appendChild(d);
 document.getElementById('fsb').onclick=function(){AA.openSettings();d.remove()};
 document.getElementById('fsc').onclick=function(){st.set('fsw',Date.now()+864e5);d.remove()}}catch(e){}}
async function sched(){try{
 const now=Date.now(),A=[];
 for(let d=0;d<7;d++){const ts=calc(new Date(now+d*864e5),loc.lat,loc.lng);
  ts.forEach((t,i)=>{if(i===1||!cfg.on[i]||t<=now)return;A.push({at:+t,idx:i})})}
 A.sort((a,b)=>a.at-b.at);
 const r=await AA.schedule({alarms:A.slice(0,60)});canFS=r.canFullScreen!==false;L('scheduled '+r.scheduled+' fs='+canFS);if(!canFS)warn()
}catch(e){L('schedule err '+(e&&e.message||e))}}
async function chk(){try{const r=await AA.getLaunch();canFS=r.canFullScreen!==false;if(r.idx>=0){L('launched from alarm idx '+r.idx);if(window.__adhanScreen)__adhanScreen(r.idx)}}catch(e){L('getLaunch err '+(e&&e.message||e))}}
window.__fsSched=sched;
const _s=window.schedule;
if(_s)window.schedule=function(){const r=_s.apply(this,arguments);setTimeout(sched,2500);return r};
document.addEventListener('visibilitychange',function(){if(!document.hidden)chk()});
if(window.Capacitor&&Capacitor.Plugins.App&&Capacitor.Plugins.App.addListener){Capacitor.Plugins.App.addListener('appStateChange',function(s){if(s&&s.isActive)setTimeout(chk,200)})}
chk();sched();
})();
