#!/bin/bash
# iqama download + bundled main adhan (private build). Real v3.0.1 -> candidate. Emulator API 34 only.
OUT=/tmp/emu-dl-$1; mkdir -p $OUT; D=$PWD; P=com.noor.islamic
CDP="python3 $D/new/ci/cdp.py"
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
ui(){ $CDP "(function(){var e=document.getElementById('intro');if(e)e.remove();var w=document.getElementById('wiz');if(w)w.remove();var b=document.getElementById('wzb');if(b)b.remove();return 1})()" >/dev/null 2>&1; }
files(){ adb shell run-as $P ls -l files > $OUT/files-$1.txt 2>&1; }
fl(){ adb shell run-as $P cat shared_prefs/noor_fs.xml 2>/dev/null | grep -o 'idx&quot;:[0-9]\|iq&quot;:[0-9]\|cu&quot;:[0-9]' | tr '\n' ' ' > $OUT/$1; }
na(){ for k in $(seq 1 12); do adb logcat -d | grep -qE "NoorAdhan: (sound|iqama sound)" && break; sleep 2; done; adb logcat -d | grep -E "NoorAdhan" | cut -c1-200 | tail -${2:-6} > $OUT/na-$1.txt; adb shell dumpsys audio | grep -E "AudioPlaybackConfiguration" | grep -E "u/pid:[0-9]+/" | grep -i "started" | cut -c1-200 | head -3 > $OUT/audiostarted-$1.txt; }
alarm(){ adb logcat -c; adb shell am broadcast -n $P/.AdhanReceiver -a com.noor.islamic.TEST_ALARM --ei idx $1 --es ch $2 --ei cu $3 --ei iq $4 > $OUT/bcast-$5.txt 2>&1; }
snap(){ { echo "== $1 $(date +%T)"; adb shell dumpsys audio | grep -E "AudioPlaybackConfiguration" | cut -c1-220 | head -3; } >> $OUT/audio.txt; }
st(){ $CDP "JSON.stringify({iq:JSON.parse(localStorage.getItem('iqc')||'{}'),slot:window.__iqSlot&&window.__iqSlot(),cu:JSON.parse(localStorage.getItem('cu')||'{}'),cuOn:[0,2,3,4,5].map(function(i){return window.__cuOn&&window.__cuOn(i)})})" > $OUT/$1.txt 2>&1; }
goset(){ ui; $CDP "show('app');1" >/dev/null 2>&1; sleep 2; $CDP "(function(){var b=document.getElementById('$1');if(b){b.scrollIntoView({block:'center'});var m=document.querySelector('main');if(m)m.scrollTop=Math.max(0,b.offsetTop-120)}return !!b})()" >/dev/null 2>&1; sleep 2; }
msg(){ $CDP "JSON.stringify([1,2].map(function(n){return document.getElementById('iqcM'+n).textContent}))" > $OUT/$1.txt 2>&1; }
adb logcat -c; adb shell wm size 720x1560; adb shell wm density 280
adb install -r $D/old.apk > $OUT/inst-old.txt 2>&1
for pm in POST_NOTIFICATIONS ACCESS_FINE_LOCATION ACCESS_COARSE_LOCATION; do adb shell pm grant $P android.permission.$pm 2>/dev/null || true; done; adb shell cmd deviceidle whitelist +$P >/dev/null 2>&1; adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb emu geo fix 29.9792 31.1342 >/dev/null 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 30
$CDP "(function(){localStorage.setItem('upg_marker','keep-me-123');return 1})()" >/dev/null 2>&1; sleep 6; adb shell am force-stop $P
adb install -r $D/new.apk > $OUT/inst-new.txt 2>&1; adb shell dumpsys package $P | grep -E "versionName|versionCode" > $OUT/new-version.txt
adb shell dumpsys package $P | grep -E "android.permission.INTERNET" | head -1 > $OUT/internet-perm.txt
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 14
$CDP "(function(){var e=document.getElementById('introGo');if(e)e.click();return 1})()" >/dev/null 2>&1
# one-time prompt must appear by itself (after intro, no wizard)
for i in $(seq 1 15); do r=$($CDP "String(!!document.getElementById('iqdy'))"); [ "$r" = '"true"' ] || [ "$r" = "true" ] && break; sleep 3; done
echo "prompt present after ~$((i*3))s: $r" > $OUT/p0-prompt.txt; shot 0-prompt
$CDP "document.getElementById('iqdlq').innerText" > $OUT/p0-prompt-text.txt 2>&1
# --- main adhan is bundled (private build)
$CDP "(async()=>{var i=await Capacitor.Plugins.AdhanAlarm.customInfo();return JSON.stringify({bundledMain:i.bundledMain,cuOn:[0,2,3,4,5].map(function(k){return window.__cuOn(k)})})})()" > $OUT/m0-bundled-flag.txt 2>&1
# accept the prompt: both download
$CDP "document.getElementById('iqdy').click();1" >/dev/null 2>&1; sleep 4; shot 1-downloading; msg d1-during
sleep 20; msg d2-after; files after-download; st s1-after-download; goset iqcBox; shot 2-iqama-downloaded
$CDP "document.getElementById('iqcBox').innerText" > $OUT/iqcBox-text.txt 2>&1
adb shell run-as $P cat shared_prefs/noor_fs.xml | grep -o 'download[^&]*' | head -3 > $OUT/x.txt 2>&1
adb shell run-as $P cat shared_prefs/noor_fire.xml 2>/dev/null | grep -o 'download [^&]*' > $OUT/fire-download.txt
sleep 3; fl alarm-flags
# in-app test of each downloaded file
for n in 1 2; do $CDP "document.getElementById('iqcP$n').click()" >/dev/null 2>&1; sleep 4; $CDP "(function(){var a=window.__iqcT&&window.__iqcT();return JSON.stringify({slot:$n,t:a&&a.currentTime,dur:a&&a.duration,paused:a&&a.paused,err:a&&a.error&&a.error.code})})()" >> $OUT/in-app-test.txt 2>&1; $CDP "document.getElementById('iqcP$n').click()" >/dev/null 2>&1; sleep 1; done
# --- native playback, app closed, screen off
adb shell input keyevent KEYCODE_HOME; sleep 2; adb shell am kill $P; sleep 2; adb shell appops set $P SYSTEM_ALERT_WINDOW deny; adb shell input keyevent KEYCODE_SLEEP; sleep 3
alarm 2 iqamah 0 1 iq1; na iq1 6; snap iq1; shot 3-iq1-locked; adb shell am force-stop $P; sleep 2
alarm 2 iqamah 0 2 iq2; na iq2 6; snap iq2; adb shell am force-stop $P; sleep 2
alarm 2 adhan_4 1 0 main-dhuhr; na main-dhuhr 6; snap main-dhuhr; shot 4-main-dhuhr; adb shell dumpsys media.player > $OUT/media-player-main.txt 2>&1; adb shell am force-stop $P; sleep 2
alarm 0 adhan_4 0 0 fajr; na fajr 6; snap fajr; adb shell am force-stop $P; sleep 2
# --- failures: files removed, then each failure mode
adb shell input keyevent KEYCODE_WAKEUP; sleep 1; adb shell wm dismiss-keyguard; adb shell appops set $P SYSTEM_ALERT_WINDOW allow
adb shell run-as $P rm -f files/custom_iq1 files/custom_iq2
alarm 2 iqamah 0 1 iq1-missing; na iq1-missing 6; snap iq1-missing; adb shell am force-stop $P; sleep 2
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25; ui
$CDP "(async()=>{var r=await window.__iqcDl(1,{url:'https://archive.org/download/noor-nonexistent-item-zz/none.mp3',size:100});return r+' | '+document.getElementById('iqcM1').textContent})()" > $OUT/f1-http404.txt 2>&1
ROB=$(curl -sL https://archive.org/robots.txt | wc -c)
$CDP "(async()=>{var r=await window.__iqcDl(1,{url:'https://archive.org/robots.txt',size:0});return r+' | '+document.getElementById('iqcM1').textContent})()" > $OUT/f2-notaudio.txt 2>&1
$CDP "(async()=>{var r=await window.__iqcDl(2,{url:'https://archive.org/robots.txt',size:5});return r+' | '+document.getElementById('iqcM2').textContent})()" > $OUT/f3-sizemismatch.txt 2>&1
files after-failures
goset iqcBox; shot 5-failure-message
# offline
adb shell cmd connectivity airplane-mode enable >/dev/null 2>&1; adb shell svc wifi disable >/dev/null 2>&1; adb shell svc data disable >/dev/null 2>&1; sleep 6
$CDP "(async()=>{var r=await window.__iqcDl(1);return r+' | '+document.getElementById('iqcM1').textContent})()" > $OUT/f4-offline.txt 2>&1
shot 6-offline-message; files after-offline
alarm 2 iqamah 0 1 iq1-offline; na iq1-offline 6; snap iq1-offline; adb shell am force-stop $P; sleep 2
adb shell cmd connectivity airplane-mode disable >/dev/null 2>&1; adb shell svc wifi enable >/dev/null 2>&1; adb shell svc data enable >/dev/null 2>&1; sleep 10
# --- retry after reconnect works; same-version reinstall keeps files/marker
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 10; ui
$CDP "(async()=>{var r=await window.__iqcDl(1);return r+' | '+document.getElementById('iqcM1').textContent})()" > $OUT/f5-retry-ok.txt 2>&1
adb shell am force-stop $P; adb install -r $D/new.apk > $OUT/inst-update.txt 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25
files after-update; st s2-after-update; $CDP "localStorage.getItem('upg_marker')" > $OUT/marker-after.txt 2>&1
goset iqcBox; shot 7-after-update
adb logcat -d > $OUT/logcat.txt; grep -E "FATAL|AndroidRuntime|Uncaught" $OUT/logcat.txt | head -20 > $OUT/errors.txt
