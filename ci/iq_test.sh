#!/bin/bash
# Main adhan file + two iqama slots, with synthetic tones in the same formats Ahmed will import. Over real v3.0.1. Emulator API 34 only.
OUT=/tmp/emu-iq-$1; mkdir -p $OUT; D=$PWD; P=com.noor.islamic
CDP="python3 $D/new/ci/cdp.py"
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
ui(){ $CDP "(function(){var e=document.getElementById('intro');if(e)e.remove();var w=document.getElementById('wiz');if(w)w.remove();var b=document.getElementById('wzb');if(b)b.remove();return 1})()" >/dev/null 2>&1; }
files(){ adb shell run-as $P ls -l files > $OUT/files-$1.txt 2>&1; }
fl(){ adb shell run-as $P cat shared_prefs/noor_fs.xml 2>/dev/null | grep -o 'idx&quot;:[0-9],&quot;[a-z]*&quot;:[^,]*\|iq&quot;:[0-9]\|cu&quot;:[0-9]' | sort | uniq -c > $OUT/$1; }
na(){ adb logcat -d | grep -E "NoorAdhan" | cut -c1-200 | tail -${2:-6} > $OUT/na-$1.txt; }
alarm(){ adb logcat -c; adb shell am broadcast -n $P/.AdhanReceiver -a com.noor.islamic.TEST_ALARM --ei idx $1 --es ch $2 --ei cu $3 --ei iq $4 > $OUT/bcast-$5.txt 2>&1; }
snap(){ { echo "== $1 $(date +%T)"; adb shell dumpsys audio | grep -E "AudioPlaybackConfiguration" | cut -c1-220 | head -3; } >> $OUT/audio.txt; }
st(){ $CDP "JSON.stringify({iq:JSON.parse(localStorage.getItem('iqc')||'{}'),slot:window.__iqSlot&&window.__iqSlot(),cu:JSON.parse(localStorage.getItem('cu')||'{}'),cuOn:[0,2,3,4,5].map(function(i){return window.__cuOn&&window.__cuOn(i)})})" > $OUT/$1.txt 2>&1; }
goset(){ ui; $CDP "(function(){show('app');var b=document.getElementById('$1');if(b)b.scrollIntoView();return !!b})()" >/dev/null 2>&1; sleep 2; }
adb logcat -c
adb shell wm size 720x1560; adb shell wm density 280
# 1. real v3.0.1 -> candidate over it, everything else already granted
adb install -r $D/old.apk > $OUT/inst-old.txt 2>&1
for pm in POST_NOTIFICATIONS ACCESS_FINE_LOCATION ACCESS_COARSE_LOCATION; do adb shell pm grant $P android.permission.$pm 2>/dev/null || true; done; adb shell cmd deviceidle whitelist +$P >/dev/null 2>&1; adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb emu geo fix 29.9792 31.1342 >/dev/null 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 30
$CDP "(function(){localStorage.setItem('upg_marker','keep-me-123');return 1})()" >/dev/null 2>&1; sleep 8; adb shell am force-stop $P
adb install -r $D/new.apk > $OUT/inst-new.txt 2>&1; adb shell dumpsys package $P | grep -E "versionName|versionCode" > $OUT/new-version.txt
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 40
goset iqcBox; st s0-initial; shot 1-iqama-box-empty
$CDP "document.getElementById('iqcBox').innerText" > $OUT/iqcBox-text-empty.txt 2>&1
$CDP "document.getElementById('cuBox').innerText" > $OUT/cuBox-text-empty.txt 2>&1
# 2. import the three files exactly like the file picker would (real m4a/m4a/mp3 formats)
for f in adhan_main.m4a nabawi1420.m4a majed_isha.mp3; do adb push $D/$f /data/local/tmp/$f >/dev/null 2>&1; adb shell chmod 644 /data/local/tmp/$f; done
goset cuBox; $CDP file '#cuFile' /data/local/tmp/adhan_main.m4a > $OUT/set-adhan.txt 2>&1; sleep 14
$CDP "document.getElementById('cuSt').textContent" > $OUT/import-adhan.txt 2>&1
goset iqcBox; $CDP file '#iqcF1' /data/local/tmp/nabawi1420.m4a > $OUT/set-iq1.txt 2>&1; sleep 10
$CDP file '#iqcF2' /data/local/tmp/majed_isha.mp3 > $OUT/set-iq2.txt 2>&1; sleep 10
$CDP "JSON.stringify([1,2].map(function(n){return document.getElementById('iqcM'+n).textContent}))" > $OUT/import-iq.txt 2>&1
files after-imports; st s1-after-imports; goset iqcBox; shot 2-iqama-both-imported
$CDP "document.getElementById('iqcBox').innerText" > $OUT/iqcBox-text-imported.txt 2>&1
sleep 5; fl alarm-flags-default
# 3. in-app test button for each slot (plays through WebView audio)
for n in 1 2; do $CDP "document.getElementById('iqcP$n').click()" >/dev/null 2>&1; sleep 4; $CDP "(function(){var a=window.__iqcT&&window.__iqcT();return JSON.stringify({slot:$n,t:a&&a.currentTime,dur:a&&a.duration,paused:a&&a.paused,err:a&&a.error&&a.error.code})})()" >> $OUT/in-app-test.txt 2>&1; shot 3-in-app-test-$n; $CDP "document.getElementById('iqcP$n').click()" >/dev/null 2>&1; sleep 1; done
# 4. selection: default 1, switch to 2 and back
$CDP "document.getElementById('iqcS2').click()" >/dev/null 2>&1; sleep 4; st s2-selected-2; fl alarm-flags-sel2; shot 4-selected-2
$CDP "document.getElementById('iqcS1').click()" >/dev/null 2>&1; sleep 4; st s3-selected-1; fl alarm-flags-sel1
# 5. native playback, app closed, screen off, cu flag for fajr=0 / others=1, iq=1 and iq=2 (TEST_ALARM)
adb shell input keyevent KEYCODE_HOME; sleep 2; adb shell am kill $P; sleep 2; adb shell appops set $P SYSTEM_ALERT_WINDOW deny; adb shell input keyevent KEYCODE_SLEEP; sleep 3
alarm 2 iqamah 0 1 iq1; sleep 5; snap iq1-5s; na iq1 6; shot 5-iq1-locked; adb shell dumpsys notification --noredact | grep -A8 "pkg=$P" | head -14 > $OUT/notif-iq1.txt
sleep 3; adb shell am startservice -n $P/.AdhanService -a STOP >/dev/null 2>&1; sleep 2; adb shell am force-stop $P; sleep 2
alarm 2 iqamah 0 2 iq2; sleep 5; snap iq2-5s; na iq2 6; shot 5b-iq2-locked; adb shell am force-stop $P; sleep 2
alarm 2 adhan_4 1 0 adhan-custom; sleep 5; snap adhan-custom-5s; na adhan-custom 6; shot 5c-adhan-custom; adb shell am force-stop $P; sleep 2
alarm 0 adhan_4 0 0 fajr-bundled; sleep 6; snap fajr-bundled-6s; na fajr-bundled 6; adb shell am force-stop $P; sleep 2
# 6. missing file -> bundled iqamah (not silence); corrupt file -> bundled iqamah
adb shell run-as $P cp files/custom_iq1 files/keep_iq1 2>/dev/null
adb shell run-as $P rm -f files/custom_iq1; alarm 2 iqamah 0 1 iq1-missing; sleep 6; snap iq1-missing; na iq1-missing 6; adb shell am force-stop $P; sleep 2
adb shell "run-as $P sh -c 'head -c 30000 /dev/urandom > files/custom_iq1'"; alarm 2 iqamah 0 1 iq1-corrupt; sleep 8; snap iq1-corrupt; na iq1-corrupt 8; adb shell am force-stop $P; sleep 2
adb shell run-as $P cp files/keep_iq1 files/custom_iq1 2>/dev/null; adb shell run-as $P rm -f files/keep_iq1
# 7. same-version reinstall: files, selection and marker survive; wake screen
adb shell input keyevent KEYCODE_WAKEUP; sleep 1; adb shell wm dismiss-keyguard; adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb install -r $D/new.apk > $OUT/inst-update.txt 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 35
files after-update; st s4-after-update; $CDP "localStorage.getItem('upg_marker')" > $OUT/marker-after.txt 2>&1
goset iqcBox; shot 6-after-update
# 8. delete slot 1 -> slot 2 becomes the used one; delete both -> bundled iqama; flags follow
$CDP "document.getElementById('iqcD1').click()" >/dev/null 2>&1; sleep 4; st s5-del1; fl alarm-flags-del1
$CDP "document.getElementById('iqcD2').click()" >/dev/null 2>&1; sleep 4; st s6-del2; fl alarm-flags-del2; files after-delete; goset iqcBox; shot 7-after-delete
adb logcat -d > $OUT/logcat.txt
grep -E "FATAL|AndroidRuntime|Uncaught" $OUT/logcat.txt | head -20 > $OUT/errors.txt
