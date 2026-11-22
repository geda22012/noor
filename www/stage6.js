(function(){
const a=document.getElementById('qaudio'),sel=document.getElementById('qsur'),rec=document.getElementById('qrec');
if(!a||!sel||!rec||window.__s6)return;window.__s6=1;
const CN='noor-audio-v1',REC=window.__REC||[];
const hasC=!!(window.caches&&window.fetch);
const dig=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const mb=b=>dig((b/1048576).toFixed(b>1073741824?0:1))+' م.ب';
const url=(r,n)=>'https://cdn.mp3quran.net/audio/'+REC[r][0]+'/'+String(n).padStart(3,'0')+'.mp3';
let blobU=null,busy=false,stop=false;
window.__qOff=async function(u,go){
 if(hasC){try{const c=await caches.open(CN),m=await c.match(u);if(m){const b=await m.blob();if(blobU)URL.revokeObjectURL(blobU);blobU=URL.createObjectURL(b);go(blobU);return}}catch(e){}}
 go(u)};
const st=document.createElement('style');st.textContent='#q6{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:12px;margin:0 0 12px}#q6 h4{margin:0 0 8px;font-family:"Reem Kufi",sans-serif;font-size:16px}#q6 .r{display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap}#q6 .r .btn{flex:1;min-width:130px;padding:9px 8px;font-size:14px}#q6 .bar{height:8px;border-radius:6px;background:var(--line);overflow:hidden;margin:6px 0}#q6 .bar i{display:block;height:100%;width:0;background:var(--acc)}#q6 small{color:var(--mut);display:block;font-size:12.5px;line-height:1.7}';document.head.appendChild(st);
const p=document.createElement('div');p.id='q6';
p.innerHTML='<h4>التلاوة بدون إنترنت</h4><div class="r"><button type="button" class="btn" id="q6one">تنزيل هذه السورة</button><button type="button" class="btn pri" id="q6all">تنزيل المصحف كله</button></div><div class="bar" hidden id="q6bw"><i id="q6b"></i></div><small id="q6s"></small><div class="r" style="margin:8px 0 0"><button type="button" class="btn" id="q6stop" hidden>إيقاف التنزيل</button><button type="button" class="btn" id="q6del">حذف تنزيلات هذا القارئ</button></div>';
a.parentNode.insertBefore(p,a.nextSibling);
const E=id=>document.getElementById(id);const S=t=>{E('q6s').textContent=t};
async function usage(){let t='';if(!hasC)return 'التنزيل غير مدعوم على هذا الجهاز.';
 try{const c=await caches.open(CN),ks=await c.keys();const r=+rec.value;const mine=ks.filter(k=>k.url.indexOf('/'+REC[r][0]+'/')>0).length;t='منزّل من هذا القارئ: '+dig(mine)+' من ١١٤ سورة. إجمالي التنزيلات: '+dig(ks.length)+' ملف.';
 if(navigator.storage&&navigator.storage.estimate){const e=await navigator.storage.estimate();t+=' المساحة المستخدمة: '+mb(e.usage||0)+(e.quota?' من '+mb(e.quota):'')+'.'}}catch(e){t='تعذّر قراءة المساحة.'}return t}
async function refresh(){S(await usage());try{const c=await caches.open(CN);const m=await c.match(url(+rec.value,+sel.value));E('q6one').textContent=m?'السورة منزّلة ✓ (تنزيل مرة تانية)':'تنزيل هذه السورة'}catch(e){}}
async function dl(r,n,onb){const u=url(r,n),c=await caches.open(CN);if(await c.match(u))return 0;
 const res=await fetch(u);if(!res.ok)throw new Error('HTTP '+res.status);
 const len=+res.headers.get('Content-Length')||0;const rd=res.body&&res.body.getReader?res.body.getReader():null;let parts=[],got=0;
 if(rd){for(;;){if(stop){try{rd.cancel()}catch(e){}throw new Error('stop')}const x=await rd.read();if(x.done)break;parts.push(x.value);got+=x.value.length;if(onb)onb(got,len)}}else{const b=await res.blob();parts=[b];got=b.size}
 await c.put(u,new Response(new Blob(parts,{type:'audio/mpeg'}),{headers:{'Content-Type':'audio/mpeg'}}));return got}
function err(e){if(e&&e.message==='stop')return S('تم إيقاف التنزيل.');S(e&&e.name==='QuotaExceededError'?'المساحة مش كفاية. امسح تنزيلات أو فضّي مساحة.':'التنزيل وقف (تأكد من الإنترنت) ثم جرّب تاني. اللي نزل قبل كده محفوظ.')}
function ui(on){busy=on;E('q6bw').hidden=!on;E('q6stop').hidden=!on;E('q6one').disabled=on;E('q6all').disabled=on;E('q6del').disabled=on}
E('q6one').onclick=async()=>{if(busy||!hasC)return;stop=false;ui(true);const r=+rec.value,n=+sel.value;
 try{await dl(r,n,(g,l)=>{E('q6b').style.width=(l?Math.round(g/l*100):50)+'%';S('جاري تنزيل السورة: '+mb(g)+(l?' من '+mb(l):''))});S('تم تنزيل السورة. هتشتغل بدون إنترنت.')}catch(e){err(e)}
 ui(false);const w=a.paused;if(w&&window.__qSetAudio)window.__qSetAudio(+sel.value);setTimeout(refresh,2500)};
E('q6all').onclick=async()=>{if(busy||!hasC)return;if(!confirm('المصحف كله بصوت '+REC[+rec.value][1]+' حجمه كبير (ممكن يوصل جيجا أو أكتر). يفضل تكون على واي فاي. تكمل؟'))return;
 stop=false;ui(true);const r=+rec.value;try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist()}catch(e){}
 let total=0,i=1;try{for(;i<=114;i++){if(stop)throw new Error('stop');const base=i-1;total+=await dl(r,i,(g,l)=>{E('q6b').style.width=Math.round((base+(l?g/l:0))/114*100)+'%';S('سورة '+dig(i)+' من ١١٤ ... نزل '+mb(total+g))})}
  S('تم تنزيل المصحف كله ('+mb(total)+'). كل التلاوات تشتغل بدون إنترنت.')}catch(e){err(e);S((E('q6s').textContent||'')+' وقفنا عند سورة '+dig(i)+'. تقدر تكمّل وهيكمل من حيث وقف.')}
 ui(false);setTimeout(refresh,2500)};
E('q6stop').onclick=()=>{stop=true};
E('q6del').onclick=async()=>{if(busy||!hasC)return;if(!confirm('حذف كل تنزيلات '+REC[+rec.value][1]+'؟'))return;try{const c=await caches.open(CN),ks=await c.keys(),m='/'+REC[+rec.value][0]+'/';for(const k of ks)if(k.url.indexOf(m)>0)await c.delete(k);S('تم الحذف.')}catch(e){S('تعذّر الحذف.')}setTimeout(refresh,1500)};
sel.addEventListener('change',()=>setTimeout(refresh,300));rec.addEventListener('change',()=>setTimeout(refresh,300));
refresh();if(window.__qSetAudio&&a.paused&&a.currentTime===0)window.__qSetAudio(+sel.value);
})();
