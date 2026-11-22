(function(){
const sec=document.getElementById('s-adhkar'),tabs=document.getElementById('atabs'),list=document.getElementById('alist');
if(!sec||!tabs||!list||window.__s5)return;window.__s5=1;
const st=document.createElement('style');st.textContent=`.s5m{display:flex;gap:6px;margin-bottom:12px}.s5m button{flex:1;padding:10px 6px;border-radius:12px;border:1px solid var(--line);background:var(--surf);cursor:pointer;font-family:'Reem Kufi',sans-serif;font-size:15px}.s5m button.on{background:var(--acc);color:#fff;border-color:var(--acc)}
#s5{display:none}.s5q{margin-bottom:12px}.s5g{margin-bottom:10px;border:1px solid var(--line);border-radius:14px;background:var(--surf);overflow:hidden}.s5g>button{width:100%;text-align:right;padding:14px 16px;border:0;background:none;cursor:pointer;font-family:'Reem Kufi',sans-serif;font-size:17px;display:flex;justify-content:space-between}.s5g>button small{color:var(--mut);font-family:'Tajawal',sans-serif}.s5g .in{display:none;padding:0 10px 10px}.s5g.on .in{display:block}.s5c{display:block;width:100%;text-align:right;padding:11px 12px;margin-top:6px;border-radius:10px;border:1px solid var(--line);background:var(--bg);cursor:pointer}.s5back{margin-bottom:10px}.s5h{font-family:'Reem Kufi',sans-serif;font-size:19px;margin:4px 0 12px}.fad{background:var(--surf);border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:10px}.fad h3{margin:0 0 6px;font-family:'Reem Kufi',sans-serif;font-size:18px;color:var(--g)}.fad p{margin:0 0 8px;font-family:'Amiri',serif;font-size:calc(20px*var(--fs,1));line-height:1.9}.fad small{color:var(--mut);font-size:12.5px}`;document.head.appendChild(st);
const bar=document.createElement('div');bar.className='s5m';bar.innerHTML='<button class="on" data-m="d">أذكار اليوم</button><button data-m="h">حصن المسلم</button><button data-m="f">فضائل السور</button>';
sec.insertBefore(bar,sec.firstChild);
const box=document.createElement('div');box.id='s5';sec.appendChild(box);
let loaded=0,mode='d',cur=null,left=[];
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const dig=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const norm=s=>s.replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه');
function setMode(m){mode=m;[].forEach.call(bar.children,b=>b.classList.toggle('on',b.dataset.m===m));
 const d=m==='d';tabs.style.display=d?'':'none';list.style.display=d?'':'none';box.style.display=d?'none':'block';if(d)return;
 if(loaded)draw();else{box.innerHTML='<p class="note">جاري التحميل...</p>';const s=document.createElement('script');s.src='hisn.js';s.onload=()=>{loaded=1;draw()};s.onerror=()=>{box.innerHTML='<p class="note">تعذر التحميل</p>'};document.body.appendChild(s)}}
bar.onclick=e=>{const b=e.target.closest('button');if(b){cur=null;setMode(b.dataset.m)}};
function draw(){if(mode==='f')return drawF();if(cur)return drawCat();drawH()}
function drawH(q){q=q?norm(q):'';
 let h='<input type="text" class="s5q" id="s5q" placeholder="ابحث في الأذكار (مثال: السفر، الطعام، الكرب)" value="'+esc(document.getElementById('s5q')?document.getElementById('s5q').value:'')+'">';
 let n=0;window.HISN.forEach((t,ti)=>{const cs=t[1].map((c,ci)=>[c,ci]).filter(x=>!q||norm(x[0][0]).includes(q)||x[0][1].some(i=>norm(i[0]).includes(q)));if(!cs.length)return;n+=cs.length;
  h+='<div class="s5g'+(q?' on':'')+'"><button type="button"><span>'+esc(t[0])+'</span><small>'+dig(cs.length)+'</small></button><div class="in">'+cs.map(x=>'<button type="button" class="s5c" data-t="'+ti+'" data-c="'+x[1]+'">'+esc(x[0][0])+'</button>').join('')+'</div></div>'});
 if(!n)h+='<p class="note">لا توجد نتائج</p>';else h+='<p class="note">المصدر: حصن المسلم للشيخ سعيد بن علي بن وهف القحطاني (النص عبر مشروع rn0x/Adhkar-json). '+dig(window.HISN.reduce((a,t)=>a+t[1].length,0))+' باب.</p>';
 box.innerHTML=h;const i=document.getElementById('s5q');i.oninput=()=>{const p=i.selectionStart;drawH(i.value);const j=document.getElementById('s5q');j.focus();try{j.setSelectionRange(p,p)}catch(e){}}}
function drawCat(){const c=window.HISN[cur[0]][1][cur[1]];
 box.innerHTML='<button type="button" class="btn s5back" id="s5b">رجوع</button><h2 class="s5h">'+esc(c[0])+'</h2>'+c[1].map((a,i)=>'<div class="card '+(left[i]<=0?'done':'')+'" tabindex="0" role="button" data-i="'+i+'"><p>'+esc(a[0])+'</p><div class="c"><span>'+(left[i]<=0?'تم ✓':(a[1]>1?'التكرار':'اضغط للتأشير'))+'</span>'+(left[i]<=0?'':(a[1]>1?'<b>'+dig(left[i])+'</b>':''))+'</div></div>').join('')+'<p class="note">المصدر: حصن المسلم</p>';
 main.scrollTop=0}
const main=document.querySelector('main');
box.addEventListener('click',e=>{
 const g=e.target.closest('.s5g>button');if(g){g.parentNode.classList.toggle('on');return}
 const c=e.target.closest('.s5c');if(c){cur=[+c.dataset.t,+c.dataset.c];left=window.HISN[cur[0]][1][cur[1]][1].map(a=>a[1]);drawCat();return}
 if(e.target.id==='s5b'){cur=null;drawH();return}
 const k=e.target.closest('.card');if(k&&cur){const i=+k.dataset.i;if(left[i]>0){left[i]--;try{navigator.vibrate&&navigator.vibrate(15)}catch(x){}const y=main.scrollTop;drawCat();main.scrollTop=y}}});
function drawF(){box.innerHTML='<p class="note" style="margin-top:0">أحاديث صحيحة أو حسنة فقط، مع المصدر. لم أضع الأحاديث الضعيفة في فضل السور.</p>'+window.FAD.map(f=>'<div class="fad"><h3>'+esc(f[0])+'</h3><p>'+esc(f[1])+'</p><small>'+esc(f[2])+'</small></div>').join('')}
document.getElementById('nav').addEventListener('click',()=>{},false);
})();
