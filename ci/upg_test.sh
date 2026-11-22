#!/bin/bash
API=$1; OUT=/tmp/emu-upg-$API; mkdir -p $OUT; D=$PWD
adb logcat -c
for f in old new; do :; done
adb install -r $D/old.apk > $OUT/inst-old.txt 2>&1
adb shell pm grant com.noor.islamic android.permission.POST_NOTIFICATIONS 2>/dev/null || true
adb shell am start -n com.noor.islamic/.MainActivity >/dev/null 2>&1; sleep 15
adb exec-out screencap -p > $OUT/old-shot.png
adb shell input tap 540 1500; sleep 3; adb shell input tap 540 1500; sleep 5
adb shell am force-stop com.noor.islamic; sleep 2
adb install -r $D/new.apk > $OUT/inst-new.txt 2>&1
adb logcat -c
adb shell am start -n com.noor.islamic/.MainActivity >/dev/null 2>&1; sleep 15
adb exec-out screencap -p > $OUT/new-shot1.png
sleep 8; adb exec-out screencap -p > $OUT/new-shot2.png
adb logcat -d > $OUT/logcat.txt
grep -i -E "chromium|console|Uncaught|FATAL|AndroidRuntime" $OUT/logcat.txt | head -60 > $OUT/errors.txt
