#!/bin/bash
# Startup-gate test for the fix build. Emulator only. States: S1 fresh install; S2 stale upgrade state (old counters exhausted, snoozed).
OUT=/tmp/emu-upg2-$1; mkdir -p $OUT; P=com.noor.islamic
pip install -q websocket-client >/dev/null 2>&1
cdp(){ python3 "$(dirname "$0")/cdp.py" "$1" 2>&1 | tail -1; }
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
dumpui(){ adb shell uiautomator dump /sdcard/u.xml >/dev/null 2>&1; adb pull /sdcard/u.xml $OUT/$1.xml >/dev/null 2>&1; }
adb install -r new.apk > $OUT/install.txt 2>&1
adb shell dumpsys package $P | grep -E "versionName|versionCode" > $OUT/version.txt
adb shell pm clear $P >/dev/null
adb shell pm grant $P android.permission.POST_NOTIFICATIONS; adb shell pm grant $P android.permission.ACCESS_FINE_LOCATION
adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb shell dumpsys deviceidle whitelist | grep -c noor > $OUT/battery-whitelist-before.txt
adb emu geo fix 29.9792 31.1342 >/dev/null 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25
cdp "(function(){var e=document.getElementById('introGo');if(e)e.click();return 1})()" >/dev/null
# S2: simulate state left by an older run: counters exhausted, snoozed 24h, old version marker
cdp "(function(){localStorage.setItem('fsver','old');localStorage.setItem('aut_battery','2');localStorage.setItem('fsw',String(Date.now()+864e5));return 1})()" >/dev/null
adb shell am force-stop $P; adb shell am start -n $P/.MainActivity >/dev/null 2>&1
for i in 1 2 3 4 5 6; do sleep 8; shot S2-$i; dumpui S2-$i; adb shell dumpsys window | grep mCurrentFocus | head -1 >> $OUT/S2-focus.txt; done
cdp "JSON.stringify({fsver:localStorage.getItem('fsver'),aut_battery:localStorage.getItem('aut_battery'),fsw:localStorage.getItem('fsw'),wiz:!!document.getElementById('wiz'),wizText:(document.getElementById('wiz')||{}).innerText})" > $OUT/S2-state.txt
adb shell logcat -d | grep -iE "ignore_battery|REQUEST_IGNORE|battery" | tail -10 > $OUT/logcat-battery.txt

# S3: tap "لاحقًا" once (user decline), then watch 20s: no new system dialog / settings page should appear, banner should stay
cdp "(function(){var s=document.getElementById('wzl');if(s){s.click();return 'clicked later'}return 'no wizard overlay'})()" > $OUT/S3-later.txt
sleep 20; shot S3-banner; dumpui S3-banner; adb shell dumpsys window | grep mCurrentFocus | head -1 > $OUT/S3-focus.txt
cdp "JSON.stringify({banner:(document.getElementById('wzb')||{}).innerText||null,wiz:!!document.getElementById('wiz'),fsw:localStorage.getItem('fsw')})" > $OUT/S3-state.txt
cdp "(function(){window.__diag();return 1})()" >/dev/null; sleep 6; shot S4-diag
cdp "(function(){var o=[].slice.call(document.querySelectorAll('div,pre')).filter(function(x){return /NATIVE STATUS/.test(x.textContent)&&x.children.length<4}).pop();var t=o?o.textContent:'no overlay';return t.slice(t.indexOf('NATIVE STATUS'))})()" > $OUT/S4-native.txt
