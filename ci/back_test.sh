#!/bin/bash
OUT=/tmp/emu-back-$1; mkdir -p $OUT
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install.txt 2>&1
adb shell pm grant com.noor.islamic android.permission.POST_NOTIFICATIONS 2>/dev/null || true
adb shell am start -n com.noor.islamic/.MainActivity >/dev/null 2>&1; sleep 25
SZ=$(adb shell wm size | grep -o '[0-9]*x[0-9]*' | tail -1); W=${SZ%x*}; H=${SZ#*x}
echo "size $SZ" > $OUT/info.txt
adb exec-out screencap -p > $OUT/1-launch.png
adb shell input tap $((W/2)) $((H*83/100)); sleep 3
adb exec-out screencap -p > $OUT/1b-home.png
# 2nd nav slot from the right (azkar)
X=$((W - W*3/14)); Y=$((H-30))
adb shell input tap $X $Y; sleep 3
adb exec-out screencap -p > $OUT/2-azkar.png
adb shell input keyevent KEYCODE_BACK; sleep 3
adb exec-out screencap -p > $OUT/3-after-back1.png
adb shell dumpsys activity activities | grep -E "mResumedActivity|topResumedActivity" > $OUT/resumed1.txt
adb shell input keyevent KEYCODE_BACK; sleep 3
adb exec-out screencap -p > $OUT/4-after-back2.png
adb shell dumpsys activity activities | grep -E "mResumedActivity|topResumedActivity" > $OUT/resumed2.txt
adb logcat -d | grep -i -E "chromium|console|FATAL|AndroidRuntime|noor" | head -60 > $OUT/errors.txt
