// Build www/hadith_topics.js from the HadeethEnc API (https://hadeethenc.com/api/v1): matn text, attribution and grade come from the API as published.
// Groups are HadeethEnc categories; sections are their direct sub-categories. Weak hadith are excluded.
const fs=require('fs');const API='https://hadeethenc.com/api/v1/';
const GROUPS=[[134,'الصلاة'],[133,'الطهارة'],[137,'الصيام'],[136,'الزكاة والصدقة'],[138,'الحج والعمرة'],[135,'الجنائز'],[124,'الأسرة: الزواج والطلاق'],[122,'المعاملات والبيوع'],[123,'الفرائض والميراث'],[126,'الأطعمة والأشربة'],[125,'الطب والتداوي'],[266,'الأخلاق'],[267,'الآداب الشرعية'],[268,'الأدعية والأذكار'],[269,'الرقائق والمواعظ'],[12,'فضائل القرآن'],[59,'الإيمان بالله'],[63,'اليوم الآخر']];
const LAW=new Set([124,122,123,126,125]);const CAP=+process.argv[2]||14;
async function j(u){for(let i=0;i<4;i++){try{const r=await fetch(u);if(r.ok)return await r.json()}catch(e){}await new Promise(r=>setTimeout(r,500*(i+1)))}throw new Error('fail '+u)}
async function pool(arr,n,f){const out=[];let i=0;await Promise.all(Array(n).fill(0).map(async()=>{while(i<arr.length){const k=i++;out[k]=await f(arr[k])}}));return out}
(async()=>{
 const cats=await j(API+'categories/list/?language=ar');
 const kids=id=>cats.filter(c=>c.parent_id===String(id));
 const arg=process.argv[3]||'';const OUT=process.argv[4]||'/tmp/hd';
 if(arg==='merge'){
  const res=[];let t=0,sc=0;
  for(const [gid] of GROUPS){const f=OUT+'/g_'+gid+'.json';if(!fs.existsSync(f))continue;const g=JSON.parse(fs.readFileSync(f,'utf8'));const MAR=/رَسُولُ اللَّهِ|رَسُولَ اللَّهِ|رسول الله|النَّبِيّ|النَّبِيُّ|النَّبِيَّ|النبي|ﷺ|صلى الله عليه|صَلَّى اللَّهُ عَلَيْهِ|النَّبِيِّ|رسولِ الله|رَسُولِ اللَّهِ/;g[2]=g[2].map(x=>[x[0],x[1].filter(h=>MAR.test(h[0]))]).filter(x=>x[1].length);res.push(g);g[2].forEach(x=>{t+=x[1].length;sc++});console.log(g[0],g[2].length,'sections',g[2].reduce((a,x)=>a+x[1].length,0),'hadith');}
  fs.writeFileSync('www/hadith_topics.js','window.HT='+JSON.stringify(res)+';');
  console.log('TOTAL',t,'hadith in',sc,'sections,',res.length,'groups');return;
 }
 const only=arg?arg.split(',').map(Number):null;
 for(const [gid,gname] of GROUPS){
  if(only&&!only.includes(gid))continue;if(fs.existsSync(OUT+'/g_'+gid+'.json'))continue;
  let subs=kids(gid);if(!subs.length)subs=[cats.find(c=>c.id===String(gid))];
  const sections=[];
  for(const s of subs){
   if(+s.hadeeths_count<1)continue;
   const ids=[];
   for(let p=1;ids.length<CAP*2&&p<=4;p++){const l=await j(API+'hadeeths/list/?language=ar&category_id='+s.id+'&page='+p+'&per_page=20');(l.data||[]).forEach(x=>ids.push(x.id));if(!l.data||l.data.length<20)break;}
   const det=await pool(ids,6,id=>j(API+'hadeeths/one/?language=ar&id='+id));
   const rank=d=>/صحيح/.test(d.grade)?0:1;
   const good=det.filter(d=>d&&d.hadeeth&&/صحيح|حسن/.test(d.grade||'')).sort((a,b)=>rank(a)-rank(b)||a.hadeeth.length-b.hadeeth.length).slice(0,CAP);
   if(good.length)sections.push([s.title,good.map(d=>[d.hadeeth.replace(/\s+/g,' ').trim(),d.attribution||'',d.grade||''])]);
  }
  fs.writeFileSync(OUT+'/g_'+gid+'.json',JSON.stringify([gname,LAW.has(gid)?1:0,sections]));console.log('done',gname);
 }
})();
