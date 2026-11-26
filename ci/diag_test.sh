#!/bin/bash
# Final-candidate test: install-over v3.0.0 release, small-screen wizard, deny, Later, banner, OEM UI by test hook, overlay/exact intents. Emulator (Google image) only.
OUT=/tmp/emu-upg2-$1; mkdir -p $OUT; P=com.noor.islamic
pip install -q websocket-client >/dev/null 2>&1
cdp(){ python3 "$(dirname "$0")/cdp.py" "$1" 2>&1 | tail -1; }
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
dumpui(){ adb shell uiautomator dump /sdcard/u.xml >/dev/null 2>&1; adb pull /sdcard/u.xml $OUT/$1.xml >/dev/null 2>&1; }
focus(){ adb shell dumpsys window | grep mCurrentFocus | head -1; }
tapword(){ dumpui tmp; python3 - $OUT/tmp.xml "$1" <<'PY' > /tmp/xy.txt
import re,sys
x=open(sys.argv[1],encoding='utf-8').read()
for m in re.finditer(r'<node [^>]*>',x):
    n=m.group(0)
    if re.search(r'text="%s"'%sys.argv[2],n):
        b=re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"',n).groups();c=[int(v) for v in b];print((c[0]+c[2])//2,(c[1]+c[3])//2);break
PY
XY=$(cat /tmp/xy.txt); [ -n "$XY" ] && adb shell input tap $XY && return 0; return 1; }
# 1 install v3.0.0 release then install-over with the candidate
adb install -r old.apk > $OUT/install-old.txt 2>&1; adb shell dumpsys package $P | grep versionName > $OUT/old-version.txt
adb shell pm grant $P android.permission.POST_NOTIFICATIONS; adb shell pm grant $P android.permission.ACCESS_FINE_LOCATION; adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb emu geo fix 29.9792 31.1342 >/dev/null 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 30
cdp "(function(){var e=document.getElementById('introGo');if(e)e.click();return 1})()" >/dev/null; sleep 10
adb shell am force-stop $P
adb install -r new.apk > $OUT/install-over.txt 2>&1
adb shell dumpsys package $P | grep -E "versionName|versionCode" > $OUT/new-version.txt
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 12
cdp "(function(){var e=document.getElementById('introGo');if(e)e.click();return 1})()" >/dev/null
for i in 1 2 3 4; do sleep 7; echo "$(focus)" >> $OUT/over-focus.txt; done
shot O1-after-over
# wizard geometry: are title and Later reachable (scrollable)?
cdp "(function(){var w=document.getElementById('wiz');if(!w)return 'no wiz';var l=document.getElementById('wzl');return JSON.stringify({scrollH:w.scrollHeight,clientH:w.clientHeight,overflowY:getComputedStyle(w).overflowY,later:l?l.getBoundingClientRect().bottom:null,winH:innerHeight})})()" > $OUT/O2-geometry.txt
# deny whatever system dialog is up
tapword "Deny" && echo denied > $OUT/O3-deny.txt || echo "no Deny dialog seen" > $OUT/O3-deny.txt
sleep 8; shot O4-after-deny
cdp "(function(){var w=document.getElementById('wiz');if(w)w.scrollTop=0;return 1})()" >/dev/null; shot O5-wizard-top
cdp "(function(){var w=document.getElementById('wiz');if(w)w.scrollTop=99999;return 1})()" >/dev/null; sleep 1; shot O6-wizard-bottom
cdp "(function(){var s=document.getElementById('wzl');if(s){s.click();return 'later clicked'}return 'no later button'})()" > $OUT/O7-later.txt
sleep 45; shot O8-banner; echo "$(focus)" > $OUT/O8-focus.txt
cdp "JSON.stringify({banner:(document.getElementById('wzb')||{}).innerText||null,wiz:!!document.getElementById('wiz')})" > $OUT/O8-state.txt
# OEM opened-unverified UI via test hook (simulated manufacturer, real fallback intent)
cdp "(function(){window.__testMfr='itel';localStorage.setItem('fsw','0');window.__fsWiz();return 1})()" >/dev/null; sleep 3
cdp "(function(){var w=document.getElementById('wiz');return w?w.innerText:'no wiz'})()" > $OUT/E1-text.txt; shot E1-oem-before
cdp "(function(){var o=[].slice.call(document.querySelectorAll('#wiz div')).length;return localStorage.getItem('oemok')})()" > $OUT/E1-oemok.txt
cdp "(function(){localStorage.setItem('oemok','1');window.__fsWiz();return 1})()" >/dev/null; sleep 3
cdp "(function(){var w=document.getElementById('wiz');if(w)w.scrollTop=99999;return w?w.innerText:'no wiz'})()" > $OUT/E2-text.txt; shot E2-oem-opened-unverified
cdp "(function(){var b=[].slice.call(document.querySelectorAll('#wiz button')).filter(function(x){return /أكدت/.test(x.textContent)})[0];if(b){b.click();return 'confirmed'}return 'no confirm button'})()" > $OUT/E3-confirm.txt; sleep 3
cdp "(function(){var w=document.getElementById('wiz');return JSON.stringify({oemok:localStorage.getItem('oemok'),text:w?w.innerText:null})})()" > $OUT/E3-state.txt; shot E3-after-confirm
# overlay / exact settings intents
for w in overlay exact; do
  cdp "(function(){Capacitor.Plugins.AdhanAlarm.openSettings2({what:'$w'});return 1})()" >/dev/null; sleep 4
  echo "$w -> $(focus)" >> $OUT/I-intents.txt; shot I-$w; adb shell input keyevent KEYCODE_BACK; sleep 2
done
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 3
cdp "(function(){window.__diag();return 1})()" >/dev/null; sleep 6
cdp "(function(){var o=[].slice.call(document.querySelectorAll('div,pre')).filter(function(x){return /NATIVE STATUS/.test(x.textContent)&&x.children.length<4}).pop();var t=o?o.textContent:'no overlay';return t.slice(t.indexOf('NATIVE STATUS'))})()" > $OUT/N-native.txt
