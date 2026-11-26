#!/bin/bash
# v3.0.2 permission-flow test (emulator API 34 Google image). A: install-over real v3.0.1 (notif/loc/battery given, overlay missing). B: fresh install, nothing granted, hands off the app.
OUT=/tmp/emu-upg2-$1; mkdir -p $OUT; P=com.noor.islamic
pip install -q websocket-client >/dev/null 2>&1
cdp(){ python3 "$(dirname "$0")/cdp.py" "$1" 2>&1 | tail -1; }
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
dumpui(){ adb shell uiautomator dump /sdcard/u.xml >/dev/null 2>&1; adb pull /sdcard/u.xml $OUT/$1.xml >/dev/null 2>&1; }
focus(){ adb shell dumpsys window | grep mCurrentFocus | head -1 | sed 's/.*{[^ ]* [^ ]* //; s/}//'; }
log(){ echo "$(date +%T) $*" >> $OUT/steps.txt; }
tapnode(){ python3 - "$OUT/$1.xml" "$2" <<'PY' > /tmp/tap.txt
import re,sys
x=open(sys.argv[1],encoding='utf-8').read();k=sys.argv[2].lower()
for m in re.finditer(r'<node [^>]*>',x):
    n=m.group(0);b=re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"',n)
    for a in re.findall(r'(?:text|content-desc)="([^"]*)"',n):
        if a.lower()==k and b:
            c=[int(v) for v in b.groups()];print((c[0]+c[2])//2,(c[1]+c[3])//2);sys.exit(0)
PY
  XY=$(cat /tmp/tap.txt); [ -z "$XY" ] && return 1; adb shell input tap $XY; return 0; }
# drive: only answers system screens, never touches the app. $1 tag, $2 seconds
drive(){ T=$1; N=$(( $2 / 4 )); LAST=""
 for i in $(seq 1 $N); do sleep 4; F=$(focus)
  if [ "$F" != "$LAST" ]; then log "$T focus: $F"; shot $T-$i; LAST="$F"; fi
  case "$F" in
   *noor*|*islamic.MainActivity*) ;;
   *)
    dumpui cur
    if tapnode cur "Allow"; then log "$T tapped Allow"
    elif tapnode cur "While using the app"; then log "$T tapped While using the app"
    elif tapnode cur "Wait"; then log "$T tapped Wait"
    else
      cp $OUT/cur.xml $OUT/$T-page-$i.xml
      if grep -qi "switch\|checkbox" $OUT/cur.xml && echo "$F" | grep -qiv "dialog"; then
        # settings page with a toggle: tap the switch like a user, then BACK
        python3 - $OUT/cur.xml <<'PY' > /tmp/sw.txt
import re,sys
x=open(sys.argv[1],encoding='utf-8').read()
for m in re.finditer(r'<node [^>]*>',x):
    n=m.group(0)
    if re.search(r'class="android.widget.(Switch|CheckBox)"',n) and 'checked="false"' in n:
        b=[int(v) for v in re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"',n).groups()];print((b[0]+b[2])//2,(b[1]+b[3])//2);break
PY
        S=$(cat /tmp/sw.txt); if [ -n "$S" ]; then adb shell input tap $S; log "$T tapped switch at $S"; sleep 2; shot $T-sw-$i; fi
      fi
      adb shell input keyevent KEYCODE_BACK; log "$T BACK from $F"
    fi;;
  esac
 done; }
echo "start $(date)" > $OUT/steps.txt
# ===== M: startup timing, old (v3.0.1) vs candidate, same emulator, cold start, nothing touched. EMULATOR ONLY, not a phone measurement.
now(){ date +%s.%N; }
measure(){ # $1 apk $2 tag $3 mode: fresh | overlayonly
  adb install -r $1 >/dev/null 2>&1; adb shell am force-stop $P; adb shell pm clear $P >/dev/null 2>&1
  if [ "$3" = fresh ]; then adb shell pm revoke $P android.permission.POST_NOTIFICATIONS; adb shell pm revoke $P android.permission.ACCESS_FINE_LOCATION; adb shell cmd deviceidle whitelist -$P >/dev/null 2>&1
  else adb shell pm grant $P android.permission.POST_NOTIFICATIONS; adb shell pm grant $P android.permission.ACCESS_FINE_LOCATION; adb shell cmd deviceidle whitelist +$P >/dev/null 2>&1; fi
  adb shell appops set $P SYSTEM_ALERT_WINDOW deny
  T0=$(now); adb shell am start -W -n $P/.MainActivity > $OUT/M-$2-$3-start.txt 2>&1; T1=$(now)
  echo "am start -W returned after $(awk "BEGIN{print $T1 - $T0}") s" >> $OUT/M-$2-$3-start.txt
  R=none
  for i in $(seq 1 120); do F=$(focus); case "$F" in *noor*|*islamic.MainActivity*|*null*|""|*launcher*|*Launcher*) ;; *) R="$(awk "BEGIN{print $(now) - $T0}") s -> $F"; break;; esac; sleep 0.25; done
  echo "$2 $3 launch to first system screen: $R" >> $OUT/M-summary.txt
  adb shell input keyevent KEYCODE_BACK; sleep 4; cdp "localStorage.getItem('noor_bootlog')" > $OUT/M-$2-$3-bootlog-$k.txt 2>&1; adb shell input keyevent KEYCODE_BACK; adb shell am force-stop $P; }
for k in 1 2; do
 measure old.apk old fresh; measure new.apk new fresh
 measure old.apk old overlayonly; measure new.apk new overlayonly
done
# ===== A: real v3.0.1 release, then the candidate over it
adb install -r old.apk > $OUT/A-install-old.txt 2>&1; adb shell dumpsys package $P | grep versionName > $OUT/A-old-version.txt
adb shell pm grant $P android.permission.POST_NOTIFICATIONS; adb shell pm grant $P android.permission.ACCESS_FINE_LOCATION; adb shell cmd deviceidle whitelist +$P >/dev/null 2>&1
adb shell appops set $P SYSTEM_ALERT_WINDOW deny
adb emu geo fix 29.9792 31.1342 >/dev/null 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25
cdp "(function(){var e=document.getElementById('introGo');if(e)e.click();return 1})()" >/dev/null; sleep 5
adb shell am force-stop $P
adb install -r new.apk > $OUT/A-install-over.txt 2>&1; adb shell dumpsys package $P | grep -E "versionName|versionCode" > $OUT/A-new-version.txt
adb shell appops get $P SYSTEM_ALERT_WINDOW > $OUT/A-overlay-before.txt
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 14
cdp "(function(){var e=document.getElementById('introGo');if(e)e.click();return 1})()" >/dev/null
drive A 100
adb shell appops get $P SYSTEM_ALERT_WINDOW > $OUT/A-overlay-after.txt
shot A-final; cdp "(function(){var w=document.getElementById('wiz'),b=document.getElementById('wzb');return JSON.stringify({wiz:w?w.innerText:null,banner:b?b.innerText:null})})()" > $OUT/A-final-state.txt
adb shell run-as $P cat shared_prefs/noor_fire.xml 2>/dev/null | grep -o "openSettings2[^&]*\|requestBattery[^&]*" > $OUT/A-fire-log.txt
adb logcat -d | grep -E "fs: auto-request|fs: " | head -40 > $OUT/A-auto-log.txt
# ===== B: fresh install, nothing granted, no touching the app
adb shell am force-stop $P; adb shell pm clear $P >/dev/null 2>&1
adb shell pm revoke $P android.permission.POST_NOTIFICATIONS; adb shell pm revoke $P android.permission.ACCESS_FINE_LOCATION
adb shell cmd deviceidle whitelist -$P >/dev/null 2>&1; adb shell appops set $P SYSTEM_ALERT_WINDOW deny
adb logcat -c
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 14
cdp "(function(){var e=document.getElementById('introGo');if(e)e.click();return 1})()" >/dev/null
drive B 160
adb shell appops get $P SYSTEM_ALERT_WINDOW > $OUT/B-overlay-after.txt
adb shell dumpsys deviceidle whitelist | grep -i noor > $OUT/B-battery-after.txt 2>&1
adb shell dumpsys package $P | grep -E "POST_NOTIFICATIONS|ACCESS_FINE_LOCATION" | head -4 > $OUT/B-perms.txt
shot B-final; cdp "(function(){var w=document.getElementById('wiz'),b=document.getElementById('wzb');return JSON.stringify({wiz:w?w.innerText:null,banner:b?b.innerText:null})})()" > $OUT/B-final-state.txt
adb shell run-as $P cat shared_prefs/noor_fire.xml 2>/dev/null | grep -o "openSettings2[^&]*\|requestBattery[^&]*" > $OUT/B-fire-log.txt
adb logcat -d | grep -E "fs: " | head -40 > $OUT/B-auto-log.txt
