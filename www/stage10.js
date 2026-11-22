(function(){
const sec=document.getElementById('s-sunna');if(!sec||window.__s10)return;window.__s10=1;
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const dig=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const css=document.createElement('style');css.textContent='#s-sunna .sn-t{display:flex;gap:6px;margin-bottom:12px;overflow-x:auto}#s-sunna .sn-t button{flex:none;padding:9px 14px;border-radius:999px;border:1px solid var(--line);background:var(--surf);color:inherit;font-family:inherit}#s-sunna .sn-t button.on{background:var(--g);color:#fff;border-color:var(--g)}.snc{background:var(--surf);border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px}.snc h4{margin:0 0 6px;font-family:"Reem Kufi",sans-serif;font-size:17px}.snc p{margin:4px 0;line-height:1.9}.snc small{opacity:.75}.snh{font-family:Amiri,serif;font-size:calc(22px*var(--fs,1));line-height:2.1}.snx{display:flex;gap:8px;margin-top:8px;flex-wrap:wrap}#snsearch{width:100%;box-sizing:border-box;padding:10px;border-radius:12px;border:1px solid var(--line);background:var(--surf);color:inherit;font-family:inherit;margin-bottom:10px}#prsh{position:fixed;top:0;right:0;bottom:0;left:0;z-index:160;background:#000a;display:flex;align-items:flex-end;justify-content:center}#prsh>div{background:var(--surf);color:var(--ink);width:100%;max-width:520px;border-radius:20px 20px 0 0;padding:18px 16px 24px;direction:rtl}#prsh h3{margin:0 0 10px;font-family:"Reem Kufi",sans-serif}#prsh .r{display:flex;justify-content:space-between;align-items:center;padding:8px 0}#prsh input[type=number]{width:80px;text-align:center;padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:inherit}#hdc{cursor:pointer}';document.head.appendChild(css);
const RAW=[
['سنة الفجر القبلية','ركعتان','قال النبي ﷺ: «ركعتا الفجر خير من الدنيا وما فيها». رواه مسلم.'],
['سنة الظهر القبلية','أربع ركعات (ركعتين ركعتين)','ثبتت أربع قبل الظهر في حديث عائشة رضي الله عنها عند البخاري.'],
['سنة الظهر البعدية','ركعتان','ثبتت ركعتان بعد الظهر في حديث ابن عمر رضي الله عنهما، متفق عليه.'],
['سنة المغرب البعدية','ركعتان','ثبتت في حديث ابن عمر رضي الله عنهما، متفق عليه.'],
['سنة العشاء البعدية','ركعتان','ثبتت في حديث ابن عمر رضي الله عنهما، متفق عليه.']];
const OTH=[
['الرواتب (١٢ ركعة)','قال النبي ﷺ: «ما من عبد مسلم يصلي لله كل يوم ثنتي عشرة ركعة تطوعًا غير فريضة إلا بنى الله له بيتًا في الجنة». رواه مسلم. وتفصيلها: ٢ قبل الفجر، ٤ قبل الظهر، ٢ بعدها، ٢ بعد المغرب، ٢ بعد العشاء.',5],
['صلاة الضحى','تبدأ بعد ارتفاع الشمس قدر رمح (حوالي ١٥ إلى ٢٠ دقيقة بعد الشروق) وتنتهي قبل الظهر بنحو عشر دقائق. أقلها ركعتان، وقد قال النبي ﷺ في صدقات المفاصل: «ويجزئ من ذلك ركعتان يركعهما من الضحى». رواه مسلم.',4],
['الوتر وقيام الليل','قال النبي ﷺ: «اجعلوا آخر صلاتكم بالليل وترًا». متفق عليه. وأقل الوتر ركعة، ووقته بعد العشاء إلى الفجر.',6],
['الأذكار بعد الصلاة','بعد السلام: أستغفر الله ثلاثًا، ثم التسبيح ٣٣ والتحميد ٣٣ والتكبير ٣٣ وتمام المئة: لا إله إلا الله وحده لا شريك له... رواه مسلم. وآية الكرسي بعد كل صلاة.',null],
['السواك','قال النبي ﷺ: «لولا أن أشق على أمتي لأمرتهم بالسواك عند كل صلاة». متفق عليه.',null],
['سنن يوم الجمعة','الاغتسال والتطيب ولبس أحسن الثياب، والتبكير إلى الجامع، وكثرة الصلاة على النبي ﷺ، وقراءة سورة الكهف، وساعة الإجابة آخر النهار قبل المغرب.',null],
['صيام التطوع','الإثنين والخميس، وأيام البيض (١٣ و١٤ و١٥ من كل شهر هجري)، وست من شوال، ويوم عرفة لغير الحاج، وعاشوراء مع يوم قبله أو بعده.',null],
['سنن في اليوم والليلة','البسملة والأكل باليد اليمنى ومما يليك، إفشاء السلام، دعاء دخول المنزل والخروج، أذكار الصباح والمساء والنوم، النوم على الشق الأيمن، الوضوء قبل النوم.',null]];
const REF='ملحوظة: النصوص هنا ملخصة ومعاني الأحاديث، راجع كتب السنة أو عالمًا موثوقًا قبل الفتوى.';
let sub=st.get('snsub','p'),HB=st.get('hbm',[]),srch='',open_={};
sec.innerHTML='<div class="sn-t" id="snt"><button data-s="p">السنن</button><button data-s="h">الأربعون النووية</button><button data-s="b">المحفوظات</button></div><div id="snb"></div>';
let loading=false;
function needH(cb){if(window.NAWAWI)return cb();if(loading)return setTimeout(function(){needH(cb)},300);loading=true;const s=document.createElement('script');s.src='hadith40.js';s.onload=function(){loading=false;cb()};s.onerror=function(){loading=false;document.getElementById('snb').innerHTML='<p class="note">تعذر تحميل الأحاديث.</p>'};document.body.appendChild(s)}
function wb(i){return i!=null&&window.__wor?'<button class="btn" data-w="'+i+'">'+(window.__wor.isDone(i)?'اتسجلت اليوم ✓':'سجّلها في متابعة العبادات')+'</button>':''}
function drawP(){let h='<div class="snc"><h4>السنن الرواتب</h4>'+RAW.map(r=>'<p><b>'+r[0]+'</b>: '+r[1]+'<br><small>'+r[2]+'</small></p>').join('')+'<div class="snx">'+wb(5)+'</div></div>';
 h+=OTH.map(o=>'<div class="snc"><h4>'+o[0]+'</h4><p>'+o[1]+'</p>'+(o[2]!=null?'<div class="snx">'+wb(o[2])+'</div>':'')+'</div>').join('')+'<p class="note">'+REF+'</p>';
 document.getElementById('snb').innerHTML=h}
function hcard(i,full){const t=window.NAWAWI[i];const bm=HB.indexOf(i)>=0;
 return '<div class="snc"><h4>الحديث '+dig(i+1)+'</h4><div class="snh">'+esc(full||t.length<260?t:t.slice(0,240)+'…')+'</div><div class="snx"><button class="btn" data-o="'+i+'">'+(full?'طي':'قراءة كاملة')+'</button><button class="btn" data-b="'+i+'">'+(bm?'★ محفوظ':'☆ حفظ')+'</button></div></div>'}
function drawH(){needH(function(){const q=srch.replace(/[\u064B-\u0652\u0640]/g,'').trim();let h='<input id="snsearch" placeholder="ابحث في الأحاديث" value="'+esc(srch)+'">';let n=0;
 window.NAWAWI.forEach(function(t,i){if(q&&t.replace(/[\u064B-\u0652\u0640]/g,'').indexOf(q)<0)return;n++;h+=hcard(i,!!open_[i])});
 if(!n)h+='<p class="note">مفيش نتيجة.</p>';h+='<p class="note">الأربعون النووية للإمام النووي رحمه الله. النص من مستودع fawazahmed0/hadith-api (ترخيص Unlicense)، والنص الأصلي ملك عام.</p>';
 document.getElementById('snb').innerHTML=h;const el=document.getElementById('snsearch');if(el&&q){el.focus();el.setSelectionRange(el.value.length,el.value.length)}})}
function drawB(){needH(function(){let h=HB.length?HB.slice().sort(function(a,b){return a-b}).map(function(i){return hcard(i,!!open_[i])}).join(''):'<p class="note">لسه ما حفظتش أحاديث. دوس ☆ على أي حديث.</p>';document.getElementById('snb').innerHTML=h})}
function draw(){document.querySelectorAll('#snt button').forEach(function(b){b.classList.toggle('on',b.dataset.s===sub)});sub==='p'?drawP():sub==='h'?drawH():drawB()}
sec.addEventListener('click',function(e){const b=e.target.closest('button');if(!b)return;
 if(b.dataset.s){sub=b.dataset.s;st.set('snsub',sub);draw()}
 else if(b.dataset.o!==undefined){const i=+b.dataset.o;open_[i]=!open_[i];draw()}
 else if(b.dataset.b!==undefined){const i=+b.dataset.b,k=HB.indexOf(i);if(k>=0)HB.splice(k,1);else HB.push(i);st.set('hbm',HB);draw()}
 else if(b.dataset.w!==undefined&&window.__wor){window.__wor.toggle(+b.dataset.w);draw()}});
sec.addEventListener('input',function(e){if(e.target.id==='snsearch'){srch=e.target.value;drawH()}});
draw();
/* حديث اليوم في صفحة المواقيت */
function today(){needH(function(){const host=document.getElementById('s-times');if(!host||document.getElementById('hdc'))return;
 const d=new Date(),n=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(d.getFullYear(),0,0))/864e5),i=n%window.NAWAWI.length,t=window.NAWAWI[i];
 const c=document.createElement('div');c.id='hdc';c.className='snc';c.innerHTML='<h4>حديث اليوم (الأربعون النووية '+dig(i+1)+')</h4><div class="snh">'+esc(t.length>200?t.slice(0,190)+'…':t)+'</div><small>دوس لقراءته كاملاً</small>';
 c.onclick=function(){sub='h';st.set('snsub','h');srch='';open_[i]=true;if(typeof show==='function')show('sunna');draw();const ch=document.querySelector('#snb .snc:first-of-type');};
 host.appendChild(c)})}
today();
/* إعدادات الصلاة بالضغط على اسمها */
const P=['الفجر','الشروق','الظهر','العصر','المغرب','العشاء'],Q=[0,-1,1,2,3,4];
function sheet(i){if(document.getElementById('prsh'))return;const q=Q[i];
 const w=document.createElement('div');w.id='prsh';
 function paint(){const on=!!cfg.on[i],iq=window.__iq&&window.__iq.get();
  w.innerHTML='<div><h3>إعدادات '+P[i]+'</h3><div class="r"><span>تنبيه الأذان</span><button class="btn" id="pon">'+(on?'مفعّل ✓':'متوقف')+'</button></div>'
  +'<div class="r"><span>صوت الأذان (لكل الصلوات)</span><select id="psnd" style="max-width:55%;padding:8px;border-radius:10px">'+Array.prototype.map.call(document.querySelectorAll('#snd option'),function(o){return '<option value="'+o.value+'"'+(o.value===cfg.snd?' selected':'')+'>'+esc(o.textContent)+'</option>'}).join('')+'</select></div>'
  +(q>=0&&iq?'<div class="r"><span>الإقامة بعد الأذان</span><span><input id="piq" type="number" min="1" max="60" value="'+iq.m[q]+'"> دقيقة</span></div>':'')
  +'<div class="r"><button class="btn" id="ptest">جرّب الصوت</button><button class="btn" id="pstop">إيقاف</button></div>'
  +'<div class="r"><button class="btn" id="pall" style="width:100%">كل إعدادات التنبيهات</button></div><div class="r"><button class="btn" id="pcl" style="width:100%">إغلاق</button></div></div>'}
 function resched(){try{window.schedule&&window.schedule()}catch(e){}setTimeout(function(){try{window.__fsSched&&window.__fsSched()}catch(e){}},2800)}
 paint();document.body.appendChild(w);
 w.addEventListener('click',function(e){const t=e.target;
  if(t===w||t.id==='pcl'){try{stopSound()}catch(x){}w.remove()}
  else if(t.id==='pon'){cfg.on[i]=cfg.on[i]?0:1;st.set('cfg',cfg);try{drawAlerts()}catch(x){}resched();paint()}
  else if(t.id==='ptest'){try{playSound()}catch(x){}}
  else if(t.id==='pstop'){try{stopSound()}catch(x){}}
  else if(t.id==='pall'){try{stopSound()}catch(x){}w.remove();if(typeof show==='function')show('settings')}});
 w.addEventListener('change',function(e){const t=e.target;
  if(t.id==='psnd'){cfg.snd=t.value;st.set('cfg',cfg);const s=document.getElementById('snd');if(s)s.value=cfg.snd;resched()}
  else if(t.id==='piq'){let v=Math.round(+t.value);if(!(v>=1))v=10;if(v>60)v=60;t.value=v;window.__iq.set(q,v)}})}
const L=document.getElementById('list');
if(L)L.addEventListener('click',function(e){const r=e.target.closest('.row');if(!r)return;const i=Array.prototype.indexOf.call(L.children,r);if(i>=0&&i<6)sheet(i)});
if(L)L.title='دوس على اسم الصلاة لإعداداتها';
window.__sheet=sheet;window.__log&&__log('stage10 ok');
})();
