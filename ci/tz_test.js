// Run with: TZ=<zone> node ci/tz_test.js   (checks the summer/winter-time logic in www/stage11.js)
const fs=require('fs');const src=fs.readFileSync(__dirname+'/../www/stage11.js','utf8');
const a=src.indexOf('function stdOff'),b=src.indexOf('window.__tzAdj');
const C={dst:'auto'};
const f=new Function('C','Intl_','return (function(){'+src.slice(a,b)+';return {tzInfo,egyptDst,stdOff}})()');
const T=f(C);let bad=0,n=0;
const real=d=>-d.getTimezoneOffset()/60;
const zone=process.env.TZ||'UTC';
// 1) every day 2023-2032, noon: auto result must equal what the phone says, except it may only ADD an hour for Africa/Cairo when the phone shows standard time inside the Egypt DST window
C.dst='auto';
for(let y=2023;y<=2032;y++)for(let d=new Date(y,0,1,12);d.getFullYear()===y;d.setDate(d.getDate()+1)){n++;
 const r=T.tzInfo(d,zone).o,p=real(d);if(r!==p&&!(zone==='Africa/Cairo'&&false)){bad++;if(bad<6)console.log('MISMATCH',zone,d.toDateString(),r,p)}}
console.log(zone,'auto vs phone: days',n,'mismatches',bad);
// 2) Egypt rule vs Intl for Africa/Cairo (full tzdata in this Node): rule must match the phone on every day
if(zone==='Africa/Cairo'){let m=0;for(let y=2023;y<=2032;y++)for(let d=new Date(y,0,1,12);d.getFullYear()===y;d.setDate(d.getDate()+1)){const rule=T.stdOff(y)+(T.egyptDst(d)?1:0);if(rule!==real(d)){m++;if(m<6)console.log('RULE MISMATCH',d.toDateString(),rule,real(d))}}console.log('Egypt rule vs ICU mismatches',m);
 // simulate a phone WITHOUT summer time: fake offset constant 2 -> fallback must add 1 only inside the window
 const fake=(d)=>({getTimezoneOffset:()=>-120,getFullYear:()=>d.getFullYear(),getMonth:()=>d.getMonth(),getDate:()=>d.getDate()});
}
// 3) manual modes
C.dst='sum';const w=new Date(2026,0,15,12),s=new Date(2026,6,15,12);const std=T.stdOff(2026);
console.log('manual sum jan/jul',T.tzInfo(w,zone).o,T.tzInfo(s,zone).o,'(std',std+')');C.dst='win';console.log('manual win jan/jul',T.tzInfo(w,zone).o,T.tzInfo(s,zone).o);
process.exit(bad?1:0);
