;(function(){try{
var AA=window.Capacitor&&Capacitor.Plugins&&Capacitor.Plugins.AdhanAlarm;
var L=function(m){try{window.__log&&__log('s11: '+m)}catch(e){}};
var E=function(i){return document.getElementById(i)};
var D=function(n){return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d]})};
/* ---------- settings ---------- */
var C=Object.assign({am:1,ae:1,ao:30,eo:30,sl:1,qf:23,qt:5,dst:'auto',gps:1},st.get('n3',{}));
function save(){st.set('n3',C)}
/* ---------- 1) more azkar and duas ---------- */
function loadAzkar(){var s=document.createElement('script');s.src='stage11d.js';s.onload=function(){try{
 var a=window.AD2;for(var k in a)adhkar[k]=a[k];
 if(typeof renderAdhkar==='function'){if(!adhkar[cat])cat='الصباح';renderAdhkar(true)}
 L('azkar categories '+Object.keys(adhkar).length)}catch(e){L('azkar err '+e)}};document.body.appendChild(s)}
loadAzkar();
window.__openAzkar=function(kind){try{cat=(kind&&kind.charAt(0)==='m')?'الصباح':'المساء';show('adhkar');renderAdhkar(true)}catch(e){}};
/* ---------- 2) summer/winter time ---------- */
function stdOff(y){return Math.min(-new Date(y,0,1).getTimezoneOffset()/60,-new Date(y,6,1).getTimezoneOffset()/60)}
function lastDow(y,m,dow){var d=new Date(y,m+1,0);while(d.getDay()!==dow)d.setDate(d.getDate()-1);return d}
function egyptDst(date){var y=date.getFullYear();if(y<2023)return false;var s=lastDow(y,3,5),e=lastDow(y,9,4);e.setDate(e.getDate()+1);
 var t=new Date(date.getFullYear(),date.getMonth(),date.getDate(),12);return t>=s&&t<e}
function isCairo(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone==='Africa/Cairo'}catch(e){return false}}
function tzInfo(date,tzName){var base=-date.getTimezoneOffset()/60,sd=stdOff(date.getFullYear());
 if(C.dst==='sum')return {o:sd+1,src:'يدوي: صيفي'};if(C.dst==='win')return {o:sd,src:'يدوي: شتوي'};
 if((tzName===undefined?isCairo():tzName==='Africa/Cairo')&&base===sd&&egyptDst(date))return {o:sd+1,src:'قاعدة مصر الاحتياطية (الهاتف مش مطبّق الصيفي)'};
 return {o:base,src:'من إعدادات الهاتف'}}
window.__tzAdj=function(date){return tzInfo(date).o};window.__tzInfo=tzInfo;
/* ---------- 3) reminders ---------- */
function sched3(){try{if(!AA)return;
 AA.setSalat({on:!!C.sl,qf:C.qf,qt:C.qt}).catch(function(){});
 var now=Date.now(),items=[];
 for(var d=0;d<7;d++){var ts=calc(new Date(now+d*864e5),loc.lat,loc.lng);
  if(C.am){var f=+ts[0],sr=+ts[1],at=f+C.ao*6e4;if(at>sr-5*6e4)at=sr-10*6e4;items.push({id:7100+d*2,at:at,kind:'m',title:'أذكار الصباح',body:'حان وقت أذكار الصباح. افتح نور المسلم واقرأها الآن: آية الكرسي والمعوذات وغيرها.'})}
  if(C.ae){var a=+ts[3],mg=+ts[4],at2=a+C.eo*6e4;if(at2>mg-5*6e4)at2=mg-10*6e4;items.push({id:7101+d*2,at:at2,kind:'e',title:'أذكار المساء',body:'حان وقت أذكار المساء. افتح نور المسلم واقرأها الآن.'})}}
 AA.setAzkar({items:items.filter(function(x){return x.at>now})}).catch(function(){});L('s3 scheduled '+items.length)}catch(e){L('sched3 err '+e)}}
window.__sched3=sched3;
/* ---------- 4) location ---------- */
var lastGps=st.get('n3gps',0);
function gpsAuto(force){try{if(!C.gps||!navigator.geolocation)return;if(!force&&Date.now()-lastGps<6*36e5)return;
 var b=E('gps');if(!b)return;lastGps=Date.now();st.set('n3gps',lastGps);b.click();setTimeout(function(){sched3();try{window.schedule&&window.schedule()}catch(e){}},4000)}catch(e){}}
window.__gpsAuto=gpsAuto;
var cs=E('city');if(cs)cs.addEventListener('change',function(){C.gps=0;save();paint()});
var gb=E('gps');if(gb)gb.addEventListener('click',function(){if(!C.gps){C.gps=1;save();paint()}});
/* ---------- settings UI ---------- */
var sec=E('s-app');
function sel(id,opts,v){return '<select id="'+id+'" style="padding:8px;border-radius:10px;border:1px solid var(--line);background:var(--surf);color:var(--ink)">'+opts.map(function(o){return '<option value="'+o[0]+'"'+(String(o[0])===String(v)?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select>'}
function hrs(){var o=[];for(var h=0;h<24;h++)o.push([h,D(h)+':٠٠']);return o}
var box=document.createElement('div');box.className='sg';box.id='n3box';
function paint(){var off=[[15,'١٥ دقيقة'],[30,'٣٠ دقيقة'],[45,'٤٥ دقيقة'],[60,'ساعة']];
 var ti=tzInfo(new Date()),cur=ti.o;
 box.innerHTML='<h3>تذكيرات الأذكار</h3>'
 +'<div class="loc" style="margin:0 0 8px;flex-wrap:wrap;align-items:center"><button class="btn" id="n3am" style="flex:1 1 100%">أذكار الصباح: '+(C.am?'مفعّل ✓':'متوقف')+'</button><span style="white-space:nowrap">بعد الفجر بـ</span>'+sel('n3ao',off,C.ao)+'</div>'
 +'<div class="loc" style="margin:0 0 8px;flex-wrap:wrap;align-items:center"><button class="btn" id="n3ae" style="flex:1 1 100%">أذكار المساء: '+(C.ae?'مفعّل ✓':'متوقف')+'</button><span style="white-space:nowrap">بعد العصر بـ</span>'+sel('n3eo',off,C.eo)+'</div>'
 +'<p class="note">إشعار مرة واحدة كل يوم لكل ذكر، في وقته (الصباح بين الفجر والشروق، والمساء بين العصر والمغرب).</p>'
 +'<h3 style="margin-top:14px">صوت «صلِّ على محمد» كل ساعة</h3>'
 +'<button class="btn" id="n3sl" style="width:100%;margin-bottom:8px">'+(C.sl?'الصوت كل ساعة: مفعّل ✓':'الصوت كل ساعة: متوقف')+'</button>'
 +'<div class="loc" style="margin:0"><span>فترة هدوء من</span>'+sel('n3qf',hrs(),C.qf)+'<span>إلى</span>'+sel('n3qt',hrs(),C.qt)+'</div>'
 +'<p class="note">بيشتغل في أول كل ساعة بصوت واحد قصير، وماينفعش يشتغل وقت الأذان. الهاتف الصامت أو وضع عدم الإزعاج ممكن يمنعه.</p>'
 +'<h3 style="margin-top:14px">التوقيت الصيفي والشتوي</h3>'
 +sel('n3dst',[['auto','تلقائي (حسب الهاتف وقاعدة مصر)'],['sum','صيفي دائمًا'],['win','شتوي دائمًا']],C.dst)
 +'<p class="note">التوقيت المستخدم الآن في حساب المواقيت: UTC'+(cur>=0?'+':'')+cur+'. مصر: الصيفي من آخر جمعة في أبريل لآخر خميس في أكتوبر.</p>'
 +'<h3 style="margin-top:14px">الموقع</h3>'
 +'<button class="btn" id="n3gps" style="width:100%">تحديد موقعي تلقائيًا: '+(C.gps?'مفعّل ✓':'متوقف')+'</button><p class="note">لما يتفعل، بيتحدّث موقعك ومواقيت الصلاة والقبلة تلقائيًا كل ٦ ساعات تقريبًا. لو اخترت مدينة يدويًا بيتوقف.</p>'}
if(sec){var h2=sec.querySelector('h2');if(h2)h2.after(box);else sec.prepend(box);paint();
 box.onclick=function(e){var b=e.target.closest('button');if(!b)return;
  if(b.id==='n3am')C.am=C.am?0:1;else if(b.id==='n3ae')C.ae=C.ae?0:1;else if(b.id==='n3sl')C.sl=C.sl?0:1;
  else if(b.id==='n3gps'){C.gps=C.gps?0:1;if(C.gps){if(AA){try{AA.status().then(function(s){if(s.loc===false)AA.requestLocation();else gpsAuto(true)})}catch(x){gpsAuto(true)}}else gpsAuto(true)}}
  else return;save();paint();sched3()};
 box.onchange=function(e){var t=e.target;
  if(t.id==='n3ao')C.ao=+t.value;else if(t.id==='n3eo')C.eo=+t.value;else if(t.id==='n3qf')C.qf=+t.value;else if(t.id==='n3qt')C.qt=+t.value;
  else if(t.id==='n3dst'){C.dst=t.value;save();paint();try{refresh()}catch(x){}try{window.schedule&&window.schedule()}catch(x){}sched3();return}
  save();paint();sched3()}}

/* ---------- 5) hadith by topic ---------- */
(function(){var snt=E('snt'),snb=E('snb');if(!snt||!snb)return;
 var esc=function(x){return String(x).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})};
 var norm=function(x){return x.replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه')};
 var tb=document.createElement('button');tb.id='htb';tb.textContent='الأحاديث بالأقسام';snt.appendChild(tb);
 var V={g:-1,s:-1,q:''};
 var NOTE='النصوص والمصادر ودرجات الأحاديث من «موسوعة الأحاديث النبوية» (hadeethenc.com). الأحاديث هنا المرفوعة للنبي ﷺ والصحيحة أو الحسنة فقط.';
 var LAWN='أحاديث الأسرة والمعاملات والمواريث هنا للقراءة والعلم، وليست فتوى. أحكامها فيها تفاصيل وشروط، فارجع لعالم أو لدار الإفتاء قبل أي قرار.';
 function load(cb){if(window.HT)return cb();snb.innerHTML='<p class="note">جاري تحميل الأحاديث…</p>';var sc=document.createElement('script');sc.src='hadith_topics.js';sc.onload=cb;sc.onerror=function(){snb.innerHTML='<p class="note">تعذر تحميل الأحاديث.</p>'};document.body.appendChild(sc)}
 function card(h){return '<div class="snc"><div class="snh">'+esc(h[0])+'</div><small>'+esc(h[1])+' — الدرجة: '+esc(h[2])+'</small></div>'}
 function draw(){load(function(){var H=window.HT,h='';
  if(V.g<0){var tot=0;H.forEach(function(g){g[2].forEach(function(x){tot+=x[1].length})});
   h+='<input id="htq" placeholder="ابحث في كل الأحاديث" value="'+esc(V.q)+'">';
   if(V.q){var q=norm(V.q).trim(),n=0;H.forEach(function(g){g[2].forEach(function(x){x[1].forEach(function(y){if(n<40&&norm(y[0]).indexOf(q)>=0){n++;h+='<div class="snc"><h4>'+esc(g[0]+' › '+x[0])+'</h4><div class="snh">'+esc(y[0])+'</div><small>'+esc(y[1])+' — الدرجة: '+esc(y[2])+'</small></div>'}})})});if(!n)h+='<p class="note">مفيش نتيجة.</p>'}
   else{h+='<p class="note">'+tot.toLocaleString('ar-EG')+' حديث في '+H.length.toLocaleString('ar-EG')+' قسم. اختار القسم:</p><div class="s5g-list">';H.forEach(function(g,i){var c=0;g[2].forEach(function(x){c+=x[1].length});h+='<button class="btn" data-hg="'+i+'" style="width:100%;margin-bottom:8px;display:flex;justify-content:space-between"><span>'+esc(g[0])+'</span><small>'+c.toLocaleString('ar-EG')+'</small></button>'});h+='</div>'}
   h+='<p class="note">'+NOTE+'</p>'}
  else if(V.s<0){var g=H[V.g];h+='<button class="btn" data-hb="top" style="margin-bottom:10px">رجوع</button><h2 class="s5h">'+esc(g[0])+'</h2>'+(g[1]?'<p class="note">'+LAWN+'</p>':'');
   g[2].forEach(function(x,j){h+='<button class="btn" data-hs="'+j+'" style="width:100%;margin-bottom:8px;display:flex;justify-content:space-between"><span>'+esc(x[0])+'</span><small>'+x[1].length.toLocaleString('ar-EG')+'</small></button>'})}
  else{var g2=H[V.g],x2=g2[2][V.s];h+='<button class="btn" data-hb="grp" style="margin-bottom:10px">رجوع</button><h2 class="s5h">'+esc(g2[0]+' › '+x2[0])+'</h2>'+(g2[1]?'<p class="note">'+LAWN+'</p>':'')+x2[1].map(card).join('')+'<p class="note">'+NOTE+'</p>'}
  snb.innerHTML=h;var main=document.querySelector('main');if(main&&!V.q)main.scrollTop=0;
  var qi=E('htq');if(qi&&V.q){qi.focus();try{qi.setSelectionRange(qi.value.length,qi.value.length)}catch(e){}}})}
 tb.onclick=function(e){e.stopPropagation();snt.querySelectorAll('button').forEach(function(b){b.classList.remove('on')});tb.classList.add('on');V={g:-1,s:-1,q:''};draw()};
 snt.addEventListener('click',function(e){var b=e.target.closest('button');if(b&&b!==tb)tb.classList.remove('on')},true);
 snb.addEventListener('click',function(e){if(!tb.classList.contains('on'))return;var b=e.target.closest('button');if(!b)return;
  if(b.dataset.hg!==undefined){V.g=+b.dataset.hg;V.s=-1;draw()}else if(b.dataset.hs!==undefined){V.s=+b.dataset.hs;draw()}
  else if(b.dataset.hb==='top'){V.g=-1;V.s=-1;draw()}else if(b.dataset.hb==='grp'){V.s=-1;draw()}});
 snb.addEventListener('input',function(e){if(tb.classList.contains('on')&&e.target.id==='htq'){V.q=e.target.value;draw()}});
})();
/* ---------- run ---------- */
setTimeout(function(){sched3();gpsAuto(false)},3000);
document.addEventListener('visibilitychange',function(){if(!document.hidden){sched3();setTimeout(function(){gpsAuto(false)},1500)}});
try{var _sc=window.schedule;if(_sc)window.schedule=function(){var r=_sc.apply(this,arguments);setTimeout(sched3,3000);return r}}catch(e){}
}catch(e){try{window.__log&&__log('s11 fatal '+e)}catch(x){}}})();

(function(){var c=document.createElement('style');c.textContent='main{padding-top:calc(env(safe-area-inset-top,0px) + 56px)!important}';document.head.appendChild(c)})();
