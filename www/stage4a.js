(function(){
const main=document.querySelector('main'),nav=document.getElementById('nav');if(!main||!nav)return;
const E=id=>document.getElementById(id);
/* ================= أيقونة إعدادات التطبيق ================= */
const css=document.createElement('style');css.textContent=`#gear{position:fixed;z-index:8;top:calc(env(safe-area-inset-top,0px) + 8px);left:10px;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--surf);color:var(--ink);display:flex;align-items:center;justify-content:center;padding:0;cursor:pointer;box-shadow:0 2px 8px #0002}#gear svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
html{--fs:1}#qtxt{font-size:calc(25px*var(--fs))!important}.card p{font-size:calc(21px*var(--fs))!important}
.sg{margin-bottom:14px}.sg h3{font-family:'Reem Kufi',sans-serif;margin:0 0 8px;font-size:17px}`;document.head.appendChild(css);
const g=document.createElement('button');g.id='gear';g.setAttribute('aria-label','إعدادات التطبيق');
g.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
document.body.appendChild(g);
const AP=st.get('app',{fs:1,vib:1});
const sec=document.createElement('section');sec.className='sec';sec.id='s-app';
sec.innerHTML=`<h2 style="margin-bottom:12px">إعدادات التطبيق</h2>
<div class="sg"><h3>حجم الخط</h3><div class="loc" style="margin:0"><button class="btn" data-fs="0.9">صغير</button><button class="btn" data-fs="1">عادي</button><button class="btn" data-fs="1.2">كبير</button><button class="btn" data-fs="1.4">كبير جدًا</button></div><p class="note">بيتطبق على القرآن والأذكار.</p></div>
<div class="sg"><h3>الاهتزاز</h3><button class="btn" id="avib" style="width:100%"></button><p class="note">اهتزاز السبحة والأذكار عند الضغط.</p></div>
<div class="sg"><h3>اختصارات لإعدادات موجودة</h3><button class="btn" data-go="times" style="width:100%;margin-bottom:8px">المدينة والموقع (صفحة المواقيت)</button><button class="btn" data-go="settings" style="width:100%;margin-bottom:8px">تنبيهات الأذان والصوت</button><button class="btn" data-go="more" style="width:100%">طريقة الحساب والشكل والتذكيرات (المزيد)</button><p class="note">الإعدادات دي فضلت في أماكنها زي ما هي، والأزرار دي بتفتحلك الصفحة بس.</p></div>
<div class="sg"><h3>البيانات</h3><button class="btn" id="aclr" style="width:100%">مسح نصوص القرآن المحفوظة</button><p class="note" id="amsg">مش هيمسح إعداداتك ولا مدينتك ولا متابعتك.</p></div>
<div class="sg" style="text-align:center;padding:14px;border:1px solid var(--line);border-radius:16px;background:var(--surf)"><h3 style="color:var(--acc)">صدقة جارية</h3><p style="font-family:'Amiri',serif;font-size:22px;line-height:2;margin:0">هذا التطبيق صدقة جارية عن روح والدي ووالدتي.<br>اللهم ارحمهما واغفر لهما، وأسكنهما فسيح جناتك، واجعل هذا العمل في ميزان حسناتهما.<br>ولا تنسوهما من دعائكم.</p></div>
<div class="sg" style="margin-top:14px"><h3>عن نور</h3><p class="note">نسخة 2.7. صدقة جارية عن روح والدي ووالدتي. أصوات الأذان من ويكيميديا كومنز (التفاصيل في README المشروع). نص القرآن (Tanzil) مضمّن في التطبيق، والتلاوات من cdn.mp3quran.net، ونص الأذكار من حصن المسلم للقحطاني، والأربعون النووية (hadith-api، ترخيص Unlicense). صورة المسجد: "Mosque at Sunset" بعدسة Sundaram Ramaswamy (ويكيميديا كومنز، CC BY 2.0).</p></div>`;
main.appendChild(sec);
function applyApp(){document.documentElement.style.setProperty('--fs',AP.fs);E('avib').textContent='الاهتزاز: '+(AP.vib?'مفعّل ✓':'متوقف');sec.querySelectorAll('[data-fs]').forEach(b=>b.style.outline=(+b.dataset.fs===AP.fs)?'2px solid var(--acc)':'none')}
applyApp();
const ov=navigator.vibrate&&navigator.vibrate.bind(navigator);if(ov){navigator.vibrate=function(p){return AP.vib?ov(p):false}}
sec.onclick=e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.fs){AP.fs=+b.dataset.fs;st.set('app',AP);applyApp()}
 else if(b.id==='avib'){AP.vib=AP.vib?0:1;st.set('app',AP);applyApp()}
 else if(b.dataset.go){show(b.dataset.go)}
 else if(b.id==='aclr'){let n=0;try{Object.keys(localStorage).filter(k=>/^q_\d+$|^q_list$/.test(k)).forEach(k=>{localStorage.removeItem(k);n++})}catch(x){}E('amsg').textContent='اتمسح '+n+' عنصر محفوظ.'}};
g.onclick=()=>{show('app');document.querySelectorAll('nav button').forEach(x=>x.classList.remove('on'))};
})();
