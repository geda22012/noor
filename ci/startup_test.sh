#!/bin/bash
# v3.0 end-to-end emulator test. Phase 1: startup permission chain with NO taps inside the app (only system dialogs answered).
# Phase 2: features (Quran page, azkar, hadith topics, settings, location, reminders, hourly voice).
OUT=/tmp/emu-startup-$1; mkdir -p $OUT
P=com.noor.islamic; R=$P/.SalatReceiver
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
dump(){ adb shell uiautomator dump /sdcard/u.xml >/dev/null 2>&1; adb pull /sdcard/u.xml $OUT/$1.xml >/dev/null 2>&1; }
tapnode(){ # $1 dump name, $2 text, $3 mode: eq|in
  python3 - "$OUT/$1.xml" "$2" "${3:-eq}" <<'PY' > /tmp/tap.txt
import re,sys
x=open(sys.argv[1],encoding='utf-8').read();k=sys.argv[2].lower();mode=sys.argv[3]
for m in re.finditer(r'<node [^>]*>',x):
    n=m.group(0);b=re.search(r'bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"',n)
    for a in re.findall(r'(?:text|content-desc)="([^"]*)"',n):
        a=a.lower()
        if ((a==k) if mode=='eq' else (k in a)) and b:
            c=[int(v) for v in b.groups()];print((c[0]+c[2])//2,(c[1]+c[3])//2);sys.exit(0)
PY
  XY=$(cat /tmp/tap.txt); [ -z "$XY" ] && return 1; adb shell input tap $XY; return 0; }
tapt(){ dump tmp; tapnode tmp "$1" "${2:-in}"; }
focus(){ adb shell dumpsys window | grep mCurrentFocus | head -1; }
log(){ echo "$*" >> $OUT/steps.txt; }
adb logcat -c
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install.txt 2>&1
adb shell dumpsys package $P | grep -E "versionCode|versionName" > $OUT/version.txt
adb shell pm clear $P >/dev/null 2>&1
adb shell pm revoke $P android.permission.POST_NOTIFICATIONS 2>/dev/null
adb shell pm revoke $P android.permission.ACCESS_FINE_LOCATION 2>/dev/null
adb shell pm revoke $P android.permission.ACCESS_COARSE_LOCATION 2>/dev/null
adb shell appops set $P SYSTEM_ALERT_WINDOW deny
adb shell dumpsys deviceidle whitelist | grep -i noor > $OUT/battery-before.txt 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1
############ PHASE 1
for i in $(seq 1 16); do
  sleep 6; shot P1-$i; F=$(focus); log "t=$((i*6))s $F"
  dump p1-$i
  if tapnode p1-$i "Wait"; then log "  ANR dialog: tapped Wait"
  elif tapnode p1-$i "Allow" ; then log "  tapped Allow (system dialog)"
  elif tapnode p1-$i "While using the app" ; then log "  tapped While using the app (location dialog)"
  elif tapnode p1-$i "Precise" ; then :
  else case "$F" in *noor*|*islamic*) ;; *) log "  settings page: grant overlay via appops then BACK"; shot SETTINGS-$i; adb shell appops set $P SYSTEM_ALERT_WINDOW allow; adb shell input keyevent KEYCODE_BACK;; esac
  fi
done
adb shell appops get $P SYSTEM_ALERT_WINDOW > $OUT/appops.txt 2>&1
adb shell dumpsys deviceidle whitelist | grep -i noor > $OUT/battery-after.txt 2>&1
adb shell dumpsys package $P | grep -E "POST_NOTIFICATIONS|ACCESS_FINE_LOCATION" | head -4 > $OUT/perms.txt
############ PHASE 2
adb shell pm grant $P android.permission.POST_NOTIFICATIONS 2>/dev/null; adb shell pm grant $P android.permission.ACCESS_FINE_LOCATION 2>/dev/null
adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb shell cmd deviceidle whitelist +$P >/dev/null 2>&1
adb emu geo fix 29.9792 31.1342 >/dev/null 2>&1
adb shell am force-stop $P; adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 14
dump a0; tapnode a0 "ادخل إلى التطبيق" in && log "intro dismissed"; sleep 4; shot F0-home
# location auto: wait for gps click flow
sleep 12; shot F1-home-after-gps
# Quran
tapt "القرآن" && sleep 6; shot F2-quran; adb shell input swipe 300 900 300 400; sleep 2; shot F2b-quran-scrolled
# adhkar
tapt "الأذكار" eq; sleep 3; shot F3-adhkar
# sunna/hadith topics
tapt "السنة" eq; sleep 3; shot F4-sunna; tapt "الأحاديث بالأقسام" && sleep 4; shot F5-hadith-top
tapt "الأسرة" && sleep 2; shot F6-hadith-family; tapt "الطلاق" eq && sleep 2; shot F7-hadith-divorce
# settings
tapt "المزيد" eq; sleep 2; dump m; tapnode m "إعدادات" in; sleep 2; shot F8-more
adb shell am start -n $P/.MainActivity >/dev/null 2>&1
# reminders: scheduled alarms
adb shell dumpsys alarm | grep -iE "noor|SALAT|AZKAR" | cut -c1-200 | head -40 > $OUT/alarms.txt
adb shell run-as $P cat shared_prefs/noor_salat.xml > $OUT/salat_prefs.xml 2>&1
# hourly voice fire (test broadcast) and audio check
adb logcat -c
adb shell am broadcast -n $R -a com.noor.islamic.SALAT > $OUT/salat-broadcast.txt 2>&1; sleep 1
for i in 1 2 3; do adb shell dumpsys audio | grep -iE "AudioPlaybackConfiguration|MediaPlayer|u/pid:.*$P|usage=USAGE_MEDIA" | cut -c1-220 | head -4 >> $OUT/salat-audio.txt; sleep 0.7; done
adb shell dumpsys media.audio_flinger 2>/dev/null | grep -i "noor" | head -3 >> $OUT/salat-audio.txt
# azkar notification
adb shell am broadcast -n $R -a com.noor.islamic.AZKAR_9 --es kind m --es title "أذكار الصباح" --es body "حان وقت أذكار الصباح. افتح نور المسلم واقرأها الآن." --ei id 9 > $OUT/azkar-broadcast.txt 2>&1; sleep 2
adb shell cmd statusbar expand-notifications; sleep 2; shot F9-notification-shade
adb shell dumpsys notification --noredact | grep -A6 "pkg=$P" | head -20 > $OUT/notif-dump.txt
adb shell cmd statusbar collapse
adb logcat -d > $OUT/logcat.txt
grep -E "auto-request|s11:|fs:|FATAL" $OUT/logcat.txt | head -30 > $OUT/auto.txt
adb shell dumpsys package $P | grep -E "label|versionName" | head -3 >> $OUT/version.txt
adb shell pm dump $P | grep -iE "applicationInfo|nonLocalizedLabel" | head -3 >> $OUT/version.txt
