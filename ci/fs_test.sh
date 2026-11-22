#!/bin/bash
OUT=/tmp/emu-fs-$1; mkdir -p $OUT
adb logcat -c
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install.txt 2>&1
adb shell pm grant com.noor.islamic android.permission.POST_NOTIFICATIONS 2>/dev/null || true
adb shell appops set com.noor.islamic USE_FULL_SCREEN_INTENT allow 2>/dev/null || true
adb shell am start -n com.noor.islamic/.MainActivity >/dev/null 2>&1; sleep 25
adb exec-out screencap -p > $OUT/1-launch.png
adb shell input tap 540 1500; sleep 2
adb exec-out screencap -p > $OUT/2-home.png
adb shell input keyevent KEYCODE_HOME; sleep 2
adb shell input keyevent KEYCODE_SLEEP; sleep 3
adb root > $OUT/root.txt 2>&1; sleep 3
adb shell am broadcast -n com.noor.islamic/.AdhanReceiver --ei idx 2 > $OUT/bcast.txt 2>&1
sleep 6
adb exec-out screencap -p > $OUT/3-after-alarm-locked.png
adb shell dumpsys window | grep -E "mCurrentFocus|isKeyguardShowing|showWhenLocked" > $OUT/focus.txt
adb shell dumpsys notification | grep -A6 noor_fs | head -30 > $OUT/notif.txt
adb logcat -d > $OUT/logcat.txt
grep -i -E "chromium|console|Uncaught|FATAL|AndroidRuntime|AdhanAlarm|fs:" $OUT/logcat.txt | head -80 > $OUT/errors.txt
