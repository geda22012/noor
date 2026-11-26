#!/bin/bash
# diagnostic-build test: native diag() output in 3 states. Emulator evidence only, not proof for any real phone.
OUT=/tmp/emu-upg2-$1; mkdir -p $OUT; P=com.noor.islamic
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
pip install -q websocket-client >/dev/null 2>&1
cdp(){ python3 "$(dirname "$0")/cdp.py" "$1" 2>&1 | tail -1; }
adb install -r new.apk > $OUT/install.txt 2>&1
adb shell pm clear $P >/dev/null
adb shell pm grant $P android.permission.POST_NOTIFICATIONS; adb shell pm grant $P android.permission.ACCESS_FINE_LOCATION
adb shell appops set $P SYSTEM_ALERT_WINDOW allow; adb shell cmd deviceidle whitelist +$P >/dev/null 2>&1
adb emu geo fix 29.9792 31.1342 >/dev/null 2>&1
st(){ # $1 label
  adb shell am force-stop $P; adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 20
  cdp "(function(){var e=document.getElementById('introGo');if(e)e.click();return 1})()" >/dev/null; sleep 20
  cdp "(function(){window.__diag();return 1})()" >/dev/null; sleep 5; shot $1
  adb shell dumpsys alarm | grep -c "$P" > $OUT/$1-os-alarm-lines.txt
  adb shell dumpsys alarm | grep -A3 "$P" | head -40 > $OUT/$1-os-alarm.txt
  cdp "(function(){var o=[].slice.call(document.querySelectorAll('div,pre')).filter(function(x){return /NATIVE STATUS/.test(x.textContent)&&x.children.length<4}).pop();return o?o.textContent:'no overlay'})()" > $OUT/$1-text.txt
}
st A-allowed
adb shell am force-stop $P; sleep 2; adb shell dumpsys alarm | grep -c "$P" > $OUT/B-after-forcestop-os-alarm-lines.txt
adb shell cmd appops set $P POST_NOTIFICATION deny; adb shell pm revoke $P android.permission.POST_NOTIFICATIONS
st C-notif-blocked
adb shell logcat -d | grep -iE "noor|AdhanReceiver|SalatReceiver" | tail -40 > $OUT/logcat.txt
