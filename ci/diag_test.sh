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
# wait for the battery dialog, then tap Deny until it is really gone (focus check, not just a tap)
for i in $(seq 1 12); do
  case "$(focus)" in *RequestIgnoreBatteryOptimizations*) tapword "Deny" && echo "Deny tapped (iteration $i)" >> $OUT/O3-deny.txt; sleep 4;; *noor*) [ -f $OUT/O3-deny.txt ] && break; sleep 5;; *) sleep 3;; esac
done
[ -f $OUT/O3-deny.txt ] || echo "no battery dialog seen" > $OUT/O3-deny.txt
sleep 6; echo "focus right after Deny: $(focus)" > $OUT/O3-focus.txt; shot O3-right-after-deny; case "$(focus)" in *noor*) ;; *) echo 'app NOT foreground after Deny; relaunching for the remaining checks' >> $OUT/O3-focus.txt; adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 6;; esac
sleep 4; shot O4-after-deny
# the list may take a while to come back after Deny: poll up to 90s for it (and record whether it came back by itself)
for i in $(seq 1 18); do r=$(cdp "String(!!document.getElementById('wzl'))"); [ "$r" = "true" ] && break; sleep 5; done
echo "list present after $((i*5))s: $r" > $OUT/O2-poll.txt
cdp "(function(){var w=document.getElementById('wiz');if(!w)return 'no wiz';var l=document.getElementById('wzl');return JSON.stringify({scrollH:w.scrollHeight,clientH:w.clientHeight,overflowY:getComputedStyle(w).overflowY,laterBottom:l?l.getBoundingClientRect().bottom:null,winH:innerHeight})})()" > $OUT/O2-geometry.txt
cdp "(function(){var w=document.getElementById('wiz');if(w)w.scrollTop=0;return 1})()" >/dev/null; shot O5-wizard-top
cdp "(function(){var w=document.getElementById('wiz');if(w)w.scrollTop=99999;return 1})()" >/dev/null; sleep 1; shot O6-wizard-bottom
cdp "(function(){var s=document.getElementById('wzl');if(s){s.click();return 'later clicked'}return 'no later button'})()" > $OUT/O7-later.txt
sleep 50; shot O8-banner; echo "$(focus)" > $OUT/O8-focus.txt
cdp "JSON.stringify({banner:(document.getElementById('wzb')||{}).innerText||null,wiz:!!document.getElementById('wiz'),bannerBottomGap:(function(b){return b?innerHeight-b.getBoundingClientRect().bottom:null})(document.getElementById('wzb'))})" > $OUT/O8-state.txt
# banner tap reopens list
cdp "(function(){var b=document.getElementById('wzb');if(b){b.click();return 'banner tapped'}return 'no banner'})()" > $OUT/B1-tap.txt; sleep 3; shot B2-reopened
# native grant detection on return: whitelist from outside (as if user allowed it in settings), reopen wizard
adb shell cmd deviceidle whitelist +$P >/dev/null 2>&1; sleep 2
adb shell input keyevent KEYCODE_HOME; sleep 2; adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 6
cdp "(function(){var w=document.getElementById('wiz');return w?w.innerText:'no wiz (all granted or banner only)'})()" > $OUT/G1-after-grant.txt; shot G1-after-grant
# OEM opened-unverified UI via test hook (simulated manufacturer; real fallback intent). Auto-chain must NOT open it by itself.
cdp "(function(){window.__testMfr='itel';localStorage.setItem('fsw','0');window.__fsWiz();return 1})()" >/dev/null; sleep 8
echo "after hook, focus: $(focus)" > $OUT/E0-focus.txt
cdp "(function(){var w=document.getElementById('wiz');return JSON.stringify({oemok:localStorage.getItem('oemok'),text:w?w.innerText:'no wiz'})})()" > $OUT/E1-state.txt; shot E1-oem-before
cdp "(function(){var b=document.getElementById('wzn');if(b){b.click();return 'tapped: '+b.textContent}return 'no wzn'})()" > $OUT/E2-tap.txt; sleep 6
echo "after tap, focus: $(focus)" > $OUT/E2-focus.txt; shot E2-settings-page
adb shell input keyevent KEYCODE_BACK; sleep 3; adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 5
cdp "(function(){var w=document.getElementById('wiz');if(w)w.scrollTop=99999;return JSON.stringify({oemok:localStorage.getItem('oemok'),text:w?w.innerText:'no wiz'})})()" > $OUT/E3-state-unverified.txt; shot E3-oem-opened-unverified
cdp "(function(){var b=[].slice.call(document.querySelectorAll('#wiz button')).filter(function(x){return /أكدت/.test(x.textContent)})[0];if(b){b.click();return 'confirmed'}return 'no confirm button'})()" > $OUT/E4-confirm.txt; sleep 4
cdp "(function(){var w=document.getElementById('wiz');return JSON.stringify({oemok:localStorage.getItem('oemok'),text:w?w.innerText:'no wiz'})})()" > $OUT/E5-state-confirmed.txt; shot E5-after-confirm
# overlay / exact settings intents
for w in overlay exact; do
  cdp "(function(){Capacitor.Plugins.AdhanAlarm.openSettings2({what:'$w'});return 1})()" >/dev/null; sleep 4
  echo "$w -> $(focus)" >> $OUT/I-intents.txt; shot I-$w; adb shell input keyevent KEYCODE_BACK; sleep 2
done
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 3
cdp "(function(){window.__diag();return 1})()" >/dev/null; sleep 6
cdp "(function(){var o=[].slice.call(document.querySelectorAll('div,pre')).filter(function(x){return /NATIVE STATUS/.test(x.textContent)&&x.children.length<4}).pop();var t=o?o.textContent:'no overlay';return t.slice(t.indexOf('NATIVE STATUS'))})()" > $OUT/N-native.txt

# ---- 30-minute voice: registration, upgrade re-arm, quiet boundary, timed fires with a set clock
adb shell dumpsys alarm | grep -A4 "SALAT" | grep -E "tag=|origWhen" | head -4 > $OUT/V1-os-salat-alarm.txt
echo "device time: $(adb shell date '+%Y-%m-%d %H:%M:%S')" >> $OUT/V1-os-salat-alarm.txt
for h in 4 5 12 22 23 0; do cdp "(function(){var r='?';Capacitor.Plugins.AdhanAlarm.quietAt({h:$h}).then(function(x){window.__q$h=x.quiet});return 1})()" >/dev/null; sleep 1; echo "hour $h quiet=$(cdp "String(window.__q$h)")" >> $OUT/V2-quiet.txt; done
adb root >/dev/null 2>&1; sleep 3
adb shell settings put global auto_time 0 >/dev/null 2>&1
setclock(){ adb shell "date $1" > $OUT/V3-setclock-$2.txt 2>&1; adb shell date '+%H:%M:%S' >> $OUT/V3-setclock-$2.txt; }
# 22:29:40 -> alarm for 22:30 must fire and PLAY (22 is outside 23-05)
setclock 112622292026.40 a
cdp "(function(){Capacitor.Plugins.AdhanAlarm.setSalat({on:true,qf:23,qt:5});return 1})()" >/dev/null; sleep 3
adb shell dumpsys alarm | grep -A4 "SALAT" | grep -E "origWhen" | head -2 > $OUT/V4-alarm-at-2229.txt
sleep 45; adb shell date '+%H:%M:%S' > $OUT/V4-time.txt
# 22:59:40 -> alarm for 23:00 fires but must be skipped as quiet
setclock 112622592026.40 b
cdp "(function(){Capacitor.Plugins.AdhanAlarm.setSalat({on:true,qf:23,qt:5});return 1})()" >/dev/null; sleep 3
adb shell dumpsys alarm | grep -A4 "SALAT" | grep -E "origWhen" | head -2 > $OUT/V5-alarm-at-2259.txt
sleep 45
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 3
cdp "(function(){window.__diag();return 1})()" >/dev/null; sleep 6
cdp "(function(){var o=[].slice.call(document.querySelectorAll('div,pre')).filter(function(x){return /NATIVE STATUS/.test(x.textContent)&&x.children.length<8}).pop();var t=o?o.textContent:document.body.innerText;var k=t.indexOf('receiver fire log');return k<0?t.slice(-1500):t.slice(k)})()" > $OUT/V6-firelog.txt
