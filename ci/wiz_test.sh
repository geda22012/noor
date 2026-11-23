#!/bin/bash
OUT=/tmp/emu-wiz-$1; mkdir -p $OUT
P=com.noor.islamic
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
dump(){ adb shell uiautomator dump /sdcard/u.xml >/dev/null 2>&1; adb pull /sdcard/u.xml $OUT/$1.xml >/dev/null 2>&1; }
tapnode(){ # $1 dump file, $2 grep pattern for text/desc
  B=$(grep -o "\(text\|content-desc\)=\"[^\"]*$2[^\"]*\"[^>]*bounds=\"\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]\"" $OUT/$1.xml | head -1 | grep -o '\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]')
  [ -z "$B" ] && return 1
  set -- $(echo $B | tr -d '[]' | tr ',' ' '); adb shell input tap $(( ($1+$3)/2 )) $(( ($2+$4)/2 )); return 0; }
adb logcat -c
curl -sL -o /tmp/old.apk https://github.com/geda22012/noor/releases/download/v2.9.0/noor.apk
adb install /tmp/old.apk > $OUT/install-old.txt 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 30
adb shell run-as $P sh -c 'cd app_webview/Default/"Local Storage"/leveldb 2>/dev/null && ls -l && md5sum *.log' > $OUT/ls-before.txt 2>&1
adb shell input keyevent KEYCODE_HOME; sleep 1
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install-new.txt 2>&1
adb shell dumpsys package $P | grep -E "versionCode|versionName" > $OUT/version.txt
adb shell run-as $P sh -c 'cd app_webview/Default/"Local Storage"/leveldb 2>/dev/null && ls -l && md5sum *.log' > $OUT/ls-after.txt 2>&1
adb shell pm revoke $P android.permission.POST_NOTIFICATIONS 2>/dev/null
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 30
shot W0
for n in 1 2 3 4 5 6; do
  dump d$n
  if tapnode d$n "فعّل"; then echo "step $n tapped wizard button" >> $OUT/steps.txt; else echo "step $n no wizard button" >> $OUT/steps.txt; fi
  sleep 4; shot S$n
  F=$(adb shell dumpsys window | grep -E "mCurrentFocus" | head -1); echo "step $n focus: $F" >> $OUT/steps.txt
  dump e$n
  case "$F" in
   *permissioncontroller*|*packageinstaller*|*PermissionController*) tapnode e$n "Allow" || tapnode e$n "ALLOW" ;;
   *OVERLAY*|*Overlay*|*overlay*|*DrawOverlay*) adb shell appops set $P SYSTEM_ALERT_WINDOW allow; adb shell input keyevent KEYCODE_BACK ;;
   *FullScreen*|*FULL_SCREEN*) adb shell appops set $P USE_FULL_SCREEN_INTENT allow; adb shell input keyevent KEYCODE_BACK ;;
   *settings*|*Settings*) adb shell input keyevent KEYCODE_BACK ;;
  esac
  sleep 3; shot T$n
done
adb shell appops get $P SYSTEM_ALERT_WINDOW USE_FULL_SCREEN_INTENT > $OUT/appops.txt 2>&1
adb shell dumpsys deviceidle whitelist | grep -i noor > $OUT/battery-whitelist.txt 2>&1
adb shell dumpsys package $P | grep -i "POST_NOTIFICATIONS" | head -3 > $OUT/notif-perm.txt
sleep 3; shot Z-final
adb logcat -d > $OUT/logcat.txt
grep -E "NOORT|AndroidRuntime|FATAL" $OUT/logcat.txt | head -20 > $OUT/timing.txt
