#!/bin/bash
# usage: emu_test.sh API  (runs inside emulator-runner)
API=$1; OUT=/tmp/emu-$API; mkdir -p $OUT
adb logcat -c
adb shell pm list packages | grep -i webview > $OUT/webview-pkgs.txt
adb shell dumpsys package com.google.android.webview 2>/dev/null | grep -m2 versionName >> $OUT/webview-pkgs.txt
adb shell dumpsys package com.android.webview 2>/dev/null | grep -m2 versionName >> $OUT/webview-pkgs.txt
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install.txt 2>&1 || true
adb shell pm grant com.noor.islamic android.permission.POST_NOTIFICATIONS 2>/dev/null || true
adb shell am start -n com.noor.islamic/.MainActivity > $OUT/start.txt 2>&1
sleep 20
adb exec-out screencap -p > $OUT/shot1.png
adb shell input tap 540 1500 2>/dev/null || true
sleep 6
adb exec-out screencap -p > $OUT/shot2.png
adb logcat -d > $OUT/logcat.txt
grep -i -E "chromium|console|Uncaught|SyntaxError|FATAL|AndroidRuntime|crash" $OUT/logcat.txt | head -80 > $OUT/errors.txt
