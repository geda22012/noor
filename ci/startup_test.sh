#!/bin/bash
# Startup permission flow: no taps inside the app. Only system dialogs are answered.
OUT=/tmp/emu-startup-$1; mkdir -p $OUT
P=com.noor.islamic
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
dump(){ adb shell uiautomator dump /sdcard/u.xml >/dev/null 2>&1; adb pull /sdcard/u.xml $OUT/$1.xml >/dev/null 2>&1; }
tapnode(){
  python3 - "$OUT/$1.xml" "$2" <<'PY' > /tmp/tap.txt
import re,sys
x=open(sys.argv[1],encoding='utf-8').read();k=sys.argv[2]
for m in re.finditer(r'<node [^>]*>',x):
    n=m.group(0)
    b=re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"',n)
    for a in re.findall(r'(?:text|content-desc)="([^"]*)"',n):
        if a.lower()==k.lower() and b:
            c=[int(v) for v in b.groups()];print((c[0]+c[2])//2,(c[1]+c[3])//2);sys.exit(0)
PY
  XY=$(cat /tmp/tap.txt); [ -z "$XY" ] && return 1; adb shell input tap $XY; return 0; }
focus(){ adb shell dumpsys window | grep mCurrentFocus | head -1; }
adb logcat -c
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install.txt 2>&1
adb shell pm revoke $P android.permission.POST_NOTIFICATIONS 2>/dev/null
adb shell appops set $P SYSTEM_ALERT_WINDOW deny
adb shell cmd appops set $P USE_FULL_SCREEN_INTENT deny 2>/dev/null
adb shell dumpsys deviceidle whitelist | grep -i noor > $OUT/battery-before.txt 2>&1
adb shell pm clear $P >/dev/null 2>&1
adb shell pm revoke $P android.permission.POST_NOTIFICATIONS 2>/dev/null
adb shell appops set $P SYSTEM_ALERT_WINDOW deny
adb shell am start -n $P/.MainActivity >/dev/null 2>&1
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  sleep 6; shot S$i; F=$(focus); echo "t=$((i*6))s focus: $F" >> $OUT/steps.txt
  dump s$i
  if tapnode s$i "Allow" ; then echo "  tapped Allow (system dialog)" >> $OUT/steps.txt
  elif tapnode s$i "Allow all the time" ; then :
  elif tapnode s$i "Yes" ; then echo "  tapped Yes" >> $OUT/steps.txt
  else
    case "$F" in *noor*|*Noor*|*islamic*) ;; *) echo "  non-app screen (settings): grant overlay via appops then BACK" >> $OUT/steps.txt; shot SETTINGS$i; adb shell appops set $P SYSTEM_ALERT_WINDOW allow; adb shell input keyevent KEYCODE_BACK;; esac
  fi
done
sleep 5; shot Z-final
adb shell appops get $P SYSTEM_ALERT_WINDOW > $OUT/appops.txt 2>&1
adb shell dumpsys deviceidle whitelist | grep -i noor > $OUT/battery-after.txt 2>&1
adb shell dumpsys package $P | grep -i "POST_NOTIFICATIONS" | head -3 > $OUT/notif-perm.txt
adb logcat -d > $OUT/logcat.txt
grep -E "auto-request|AndroidRuntime|FATAL|fs:" $OUT/logcat.txt | head -30 > $OUT/auto.txt
