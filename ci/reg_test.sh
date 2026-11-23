#!/bin/bash
OUT=/tmp/emu-reg-$1; mkdir -p $OUT
P=com.noor.islamic
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
state(){ { echo "== $1 $(date +%T)"; adb shell dumpsys audio | grep -E "AudioPlaybackConfiguration|type:android.media.MediaPlayer" | grep -i "$P\|MediaPlayer" | cut -c1-200 | head -3; adb shell dumpsys activity services $P | grep -E "isForeground|ServiceRecord" | cut -c1-200 | head -3; adb shell dumpsys window | grep -E "mCurrentFocus|isKeyguardShowing" | head -3; adb shell dumpsys power | grep -E "mWakefulness=" | head -1; } >> $OUT/state.txt; }
SZ=$(adb shell wm size | grep -o '[0-9]*x[0-9]*' | tail -1); W=${SZ%x*}; H=${SZ#*x}
adb logcat -c
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install.txt 2>&1
adb shell pm grant $P android.permission.POST_NOTIFICATIONS 2>/dev/null || true
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25
sleep 4
adb shell dumpsys alarm > $OUT/alarm-full.txt
grep -n "$P" $OUT/alarm-full.txt | cut -c1-260 | head -30 > $OUT/alarm-noor.txt
python3 - $OUT/alarm-full.txt > $OUT/next.txt <<'PY'
import re,sys,time
t=open(sys.argv[1],errors='ignore').read().split('\n')
now=time.time()*1000;c=[]
for i,l in enumerate(t):
    if 'com.noor.islamic' in l and 'Alarm{' in l:
        for m in re.finditer(r'(?:origWhen|when)=?\s*(\d{13})',' '.join(t[i:i+8])):
            v=int(m.group(1))
            if v>now:c.append(v)
print(min(c) if c else '')
PY
echo "alarms: $(grep -c . $OUT/alarm-noor.txt) next=$(cat $OUT/next.txt)" >> $OUT/state.txt
shot R0-wizard-default-install
adb shell input keyevent KEYCODE_HOME; sleep 2
adb shell am kill $P; sleep 2
adb shell appops set $P SYSTEM_ALERT_WINDOW allow
NEXT=$(cat $OUT/next.txt)
if [ -n "$NEXT" ]; then
  adb root >/dev/null 2>&1; sleep 3
  adb shell settings put global auto_time 0
  adb shell input keyevent KEYCODE_SLEEP; sleep 2
  adb shell "date $(date -u -d @$((NEXT/1000-20)) +%m%d%H%M%Y.%S)" >> $OUT/state.txt 2>&1
  echo "clock jumped to 20s before alarm" >> $OUT/state.txt
  state pre
  for t in 1 2 3 4 5 6 7 8 9 10; do sleep 4; shot F-t$t; done
  state fired
  adb logcat -d | grep -E "NoorAdhan|AdhanService|ALARM|AdhanReceiver" | cut -c1-200 | head -20 > $OUT/fire-log.txt
  adb shell input tap $((W*33/100)) $((H*94/100)); sleep 3; shot F-after-stop; state after-stop
fi
adb shell appops set $P USE_FULL_SCREEN_INTENT deny 2>&1 | tee -a $OUT/state.txt
adb shell input keyevent KEYCODE_WAKEUP; sleep 1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 20
sleep 6; shot G-fs-revoked
adb logcat -d > $OUT/logcat.txt
