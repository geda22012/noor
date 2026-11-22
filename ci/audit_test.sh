#!/bin/bash
OUT=/tmp/emu-audit-$1; mkdir -p $OUT
adb logcat -c
adb install -r app/android/app/build/outputs/apk/debug/app-debug.apk > $OUT/install.txt 2>&1
adb shell pm grant com.noor.islamic android.permission.POST_NOTIFICATIONS 2>/dev/null || true
adb shell appops set com.noor.islamic USE_FULL_SCREEN_INTENT allow 2>/dev/null || true
adb shell am start -n com.noor.islamic/.MainActivity >/dev/null 2>&1; sleep 25
SZ=$(adb shell wm size | grep -o '[0-9]*x[0-9]*' | tail -1); W=${SZ%x*}; H=${SZ#*x}; Y=$((H-30))
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
shot 00-splash
adb shell input tap $((W/2)) $((H*83/100)); sleep 3; shot 01-times
# nav slots from the right: 0 times,1 azkar,2 tasbeeh,3 qibla,4 sunna,5 quran,6 more
names=(times azkar tasbeeh qibla sunna quran more)
for i in 1 2 3 4 5 6; do X=$((W - (W*(2*i+1))/14)); adb shell input tap $X $Y; sleep 3; shot 1$i-${names[$i]}; done
# quran: next page via swipe left-to-right and the next button area
adb shell input tap $((W - (W*11)/14)) $Y; sleep 3
adb shell input swipe $((W/5)) $((H/2)) $((W*4/5)) $((H/2)) 300; sleep 2; shot 20-quran-page2
# sunna tab sub-tabs
adb shell input tap $((W - (W*9)/14)) $Y; sleep 3
adb shell input tap $((W/2)) $((H*14/100)); sleep 2; shot 30-sunna
# times: tap a prayer row (per-prayer sheet)
adb shell input tap $((W - W/14)) $Y; sleep 3
adb shell input tap $((W/2)) $((H*50/100)); sleep 2; shot 40-prayer-sheet
adb shell input keyevent KEYCODE_BACK; sleep 2; shot 41-after-back-sheet
# settings gear
adb shell input tap 40 70; sleep 3; shot 50-settings
adb shell input keyevent KEYCODE_BACK; sleep 2; shot 51-after-back-settings
# back from another tab (user's exact case): azkar -> back -> times, back -> exit
adb shell input tap $((W - (W*3)/14)) $Y; sleep 3; shot 70-azkar-again
adb shell input keyevent KEYCODE_BACK; sleep 3; shot 71-back-from-azkar
adb shell dumpsys activity activities | grep -E "mResumedActivity|topResumedActivity" > $OUT/resumed-after-tab-back.txt
adb shell input keyevent KEYCODE_BACK; sleep 3
adb shell dumpsys activity activities | grep -E "mResumedActivity|topResumedActivity" > $OUT/resumed-after-home-back.txt
adb shell am start -n com.noor.islamic/.MainActivity >/dev/null 2>&1; sleep 12
# widget: provider registered and survives an update broadcast
adb shell dumpsys appwidget | grep -i "com.noor.islamic" | head -5 > $OUT/widget-registered.txt
sleep 2
# adhan alarm while app is open
adb root >/dev/null 2>&1; sleep 3
adb shell am broadcast -n com.noor.islamic/.AdhanReceiver --ei idx 2 > $OUT/bcast.txt 2>&1; sleep 8; shot 60-adhan
adb shell dumpsys media_session 2>/dev/null | grep -iE "state=|noor|description" | head -10 > $OUT/media.txt
sleep 25; shot 61-adhan-after-30s
adb shell dumpsys audio | grep -iE "noor|AudioPlaybackConfiguration" | head -10 > $OUT/audio.txt
adb logcat -d > $OUT/logcat.txt
grep -i -E "chromium.*(Uncaught|error|ERROR)|AndroidRuntime|FATAL|خطأ|noor.*(err|fail)" $OUT/logcat.txt | head -80 > $OUT/errors.txt
grep -i "Console" $OUT/logcat.txt | grep -i noor | head -80 > $OUT/console.txt
adb logcat -d | grep -i NoorWidget > $OUT/widget-log.txt || true
