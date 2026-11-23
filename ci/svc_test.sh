#!/bin/bash
OUT=/tmp/emu-svc-$1; mkdir -p $OUT
P=com.noor.islamic
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
state(){ { echo "== $1"; adb shell dumpsys audio | grep -iE "AudioPlaybackConfiguration|usage=USAGE_ALARM|u/pid" | grep -i -B0 -A0 "$P\|ALARM" | head -6; adb shell dumpsys activity services $P | grep -E "AdhanService|isForeground|foregroundServiceType" | head -4; adb shell dumpsys window | grep -E "mCurrentFocus|isKeyguardShowing" | head -3; } >> $OUT/state.txt; }
adb logcat -c
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install.txt 2>&1
adb shell pm grant $P android.permission.POST_NOTIFICATIONS 2>/dev/null || true
adb shell appops set $P USE_FULL_SCREEN_INTENT allow 2>/dev/null || true
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25
shot 00-app-open
adb shell input keyevent KEYCODE_HOME; sleep 2
adb shell am kill $P; sleep 2
adb shell pidof $P > $OUT/pid-after-kill.txt 2>&1
# Case A: app closed, screen off, no overlay permission
adb shell appops set $P SYSTEM_ALERT_WINDOW deny
adb shell input keyevent KEYCODE_SLEEP; sleep 3
adb shell am broadcast -n $P/.AdhanReceiver --ei idx 2 --es ch adhan_4 > $OUT/bcastA.txt 2>&1
sleep 10; shot A-closed-screenoff; state A
adb shell am startservice -n $P/.AdhanService -a STOP >/dev/null 2>&1; sleep 2; state A-after-stop
# Case B: app closed, device unlocked and in another app (Settings), overlay allowed
adb shell input keyevent KEYCODE_WAKEUP; sleep 2; adb shell wm dismiss-keyguard; adb shell input keyevent 82
adb shell am start -a android.settings.SETTINGS >/dev/null 2>&1; sleep 3
adb shell am kill $P; sleep 1
adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb shell am broadcast -n $P/.AdhanReceiver --ei idx 3 --es ch adhan_4 > $OUT/bcastB.txt 2>&1
sleep 10; shot B-overlay-unlocked-otherapp; state B
adb shell am startservice -n $P/.AdhanService -a STOP >/dev/null 2>&1; sleep 2
# Case C: same but overlay denied (expect heads-up only, by Android design)
adb shell am start -a android.settings.SETTINGS >/dev/null 2>&1; sleep 3
adb shell am kill $P; sleep 1
adb shell appops set $P SYSTEM_ALERT_WINDOW deny
adb shell am broadcast -n $P/.AdhanReceiver --ei idx 4 --es ch adhan_4 > $OUT/bcastC.txt 2>&1
sleep 8; shot C-nooverlay-unlocked-otherapp; state C
adb shell am startservice -n $P/.AdhanService -a STOP >/dev/null 2>&1
adb logcat -d > $OUT/logcat.txt
grep -i -E "AndroidRuntime|FATAL|ForegroundService|AdhanService|MediaPlayer" $OUT/logcat.txt | head -60 > $OUT/errors.txt
