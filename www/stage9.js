(function(){
const ITEMS=['أذكار الصباح','أذكار المساء','أذكار النوم','ورد القرآن اليومي','صلاة الضحى','السنن الرواتب','قيام الليل / الوتر','الاستغفار ١٠٠ مرة','الصدقة','الصيام'];
let W=st.get('wor',{}),custom=st.get('worc',[]);
const all=()=>ITEMS.concat(custom);
const key=d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
const arN=n=>(typeof ar==='function'?ar(n):String(n));
const host=document.querySelector('#s-more details');if(!host){window.__log&&__log('stage9: no s-more');return}
const det=document.createElement('details');det.id='wrd';
det.innerHTML='<summary>متابعة الأذكار والعبادات</summary><div id="wlist"></div><div id="wweek" style="margin:10px 0"></div><p class="note" id="wsum"></p><div class="ln" style="gap:6px"><input id="wnew" placeholder="أضف عبادة خاصة بيك" style="flex:1;padding:9px;border-radius:10px;border:1px solid var(--line);background:var(--surf);color:inherit;font-family:inherit"><button class="btn" id="wadd">إضافة</button></div>';
host.parentNode.insertBefore(det,host.nextSibling);
function row(d,i){const t=W[key(d)]||[];return !!t[i]}
function streak(i){let s=0,d=new Date();if(!row(d,i))d.setDate(d.getDate()-1);while(row(d,i)&&s<2000){s++;d.setDate(d.getDate()-1)}return s}
function draw(){const L=all(),t=W[key(new Date())]||[];
 document.getElementById('wlist').innerHTML=L.map((n,i)=>'<div class="ln row"><b>'+n+(streak(i)>1?' <small style="opacity:.7">🔥'+arN(streak(i))+'</small>':'')+'</b><span><button class="btn" data-i="'+i+'">'+(t[i]?'تمّ ✓':'لسه')+'</button>'+(i>=ITEMS.length?' <button class="btn" data-x="'+(i-ITEMS.length)+'">حذف</button>':'')+'</span></div>').join('');
 let h='';for(let k=6;k>=0;k--){const d=new Date();d.setDate(d.getDate()-k);const tt=W[key(d)]||[];const c=L.filter((x,i)=>tt[i]).length;const p=L.length?Math.round(c*100/L.length):0;
  h+='<div style="display:inline-block;width:13%;text-align:center"><div style="height:46px;background:var(--line);border-radius:6px;position:relative;overflow:hidden"><div style="position:absolute;bottom:0;left:0;right:0;height:'+p+'%;background:var(--g,#1b6b5a)"></div></div><small>'+['ح','ن','ث','ر','خ','ج','س'][d.getDay()]+'</small></div>'}
 document.getElementById('wweek').innerHTML=h;
 document.getElementById('wsum').textContent='النهارده: '+arN(L.filter((x,i)=>t[i]).length)+' من '+arN(L.length)}
det.addEventListener('click',function(e){const b=e.target.closest('button');if(!b)return;
 if(b.dataset.i!==undefined){const k=key(new Date()),t=W[k]||[];t[+b.dataset.i]=t[+b.dataset.i]?0:1;W[k]=t;st.set('wor',W);draw()}
 else if(b.dataset.x!==undefined){const x=+b.dataset.x;custom.splice(x,1);st.set('worc',custom);const idx=ITEMS.length+x;Object.keys(W).forEach(k=>{W[k].splice(idx,1)});st.set('wor',W);draw()}
 else if(b.id==='wadd'){const i=document.getElementById('wnew'),v=i.value.trim();if(v&&custom.length<15){custom.push(v.slice(0,40));st.set('worc',custom);i.value='';draw()}}});
draw();window.__log&&__log('stage9 ok');
})();
