#!/bin/bash
OUT=/tmp/emu-svc-$1; mkdir -p $OUT
P=com.noor.islamic
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
state(){ { echo "== $1"; adb shell dumpsys audio | grep -E "AudioPlaybackConfiguration|type:android.media.MediaPlayer" | grep -i "$P\|MediaPlayer" | cut -c1-200 | head -3; adb shell dumpsys activity services $P | grep -E "isForeground|code:" | cut -c1-200 | head -3; adb shell dumpsys window | grep -E "mCurrentFocus|isKeyguardShowing" | head -3; } >> $OUT/state.txt; }
alarm(){ adb shell am broadcast -n $P/.AdhanReceiver -a com.noor.islamic.TEST_ALARM --ei idx $1 --es ch $2 > $OUT/bcast-$3.txt 2>&1; }
SZ=$(adb shell wm size | grep -o '[0-9]*x[0-9]*' | tail -1); W=${SZ%x*}; H=${SZ#*x}
taphead(){ adb shell input tap $((W*36/100)) $((H*21/100)); }
tapclose(){ adb shell input tap $((W*33/100)) $((H*94/100)); }
adb logcat -c
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install.txt 2>&1
adb shell pm grant $P android.permission.POST_NOTIFICATIONS 2>/dev/null || true
adb shell appops set $P USE_FULL_SCREEN_INTENT allow 2>/dev/null || true
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25
adb shell input keyevent KEYCODE_HOME; sleep 2
adb shell am kill $P; sleep 2
# A: app closed, screen off, no overlay. Screenshots every 2s after the alarm time
adb shell appops set $P SYSTEM_ALERT_WINDOW deny
adb shell input keyevent KEYCODE_SLEEP; sleep 3
alarm 2 adhan_2 A
sleep 5; echo "A alarm armed $(date +%T)" >> $OUT/state.txt
for t in 1 2 3 4 5 6 7 8 9 10 11 12; do shot A-t$t; sleep 2; done
state A
shot A-before-close; tapclose; sleep 3; shot A-after-close; state A-after-close-tap
adb shell cmd statusbar collapse >/dev/null 2>&1
# B: app closed, unlocked, other app in front, overlay allowed, default adhan_4
adb shell input keyevent KEYCODE_WAKEUP; sleep 2; adb shell wm dismiss-keyguard; adb shell input keyevent 82
adb shell am start -a android.settings.SETTINGS >/dev/null 2>&1; sleep 3
adb shell am kill $P; sleep 1
adb shell appops set $P SYSTEM_ALERT_WINDOW allow
alarm 3 adhan_4 B
sleep 8; for t in 1 2 3 4 5 6; do shot B-t$t; sleep 2; done; state B
adb shell input keyevent KEYCODE_BACK; sleep 1; state B-after-back
# C: same but overlay denied: heads-up only; tap its stop button
adb shell am start -a android.settings.SETTINGS >/dev/null 2>&1; sleep 3
adb shell am kill $P; sleep 1
adb shell appops set $P SYSTEM_ALERT_WINDOW deny
alarm 4 adhan_4 C
sleep 12; shot C-headsup; state C
taphead; sleep 3; shot C-after-stop; state C-after-stop-tap
adb logcat -d > $OUT/logcat.txt
grep -E "NOORT|NoorAdhan|AndroidRuntime|FATAL|START u0.*noor" $OUT/logcat.txt | cut -c1-200 | head -60 > $OUT/timing.txt
