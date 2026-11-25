#!/bin/bash
# Custom adhan file test: import, background/locked service playback, fallbacks, upgrade retention.
API=$1; OUT=/tmp/emu-cu-$API; mkdir -p $OUT; D=$PWD; P=com.noor.islamic
CDP="python3 $D/new/ci/cdp.py"
shot(){ adb exec-out screencap -p > $OUT/$1.png; }
snap(){ { echo "== $1 $(date +%T)"; adb shell dumpsys audio | grep -E "AudioPlaybackConfiguration|players" | cut -c1-220 | head -6; adb shell dumpsys activity services $P | grep -E "isForeground|ServiceRecord" | cut -c1-200 | head -4; } >> $OUT/audio.txt; }
na(){ adb logcat -d | grep -E "NoorAdhan" | cut -c1-200 | tail -${2:-6} > $OUT/na-$1.txt; }
alarm(){ adb logcat -c; adb shell am broadcast -n $P/.AdhanReceiver -a com.noor.islamic.TEST_ALARM --ei idx $1 --es ch $2 --ei cu $3 > $OUT/bcast-$4.txt 2>&1; }
files(){ adb shell run-as $P ls -l files > $OUT/files-$1.txt 2>&1; }
adb logcat -c
adb shell wm size 720x1560; adb shell wm density 280
# ---- 1. old release -> new build upgrade with markers
adb install -r $D/old.apk > $OUT/inst-old.txt 2>&1
for pm in POST_NOTIFICATIONS ACCESS_FINE_LOCATION ACCESS_COARSE_LOCATION; do adb shell pm grant $P android.permission.$pm 2>/dev/null || true; done; adb shell dumpsys deviceidle whitelist +$P >/dev/null 2>&1; adb shell appops set $P SYSTEM_ALERT_WINDOW allow; adb shell appops set $P USE_FULL_SCREEN_INTENT allow 2>/dev/null || true
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 30
$CDP "(function(){localStorage.setItem('upg_marker','keep-me-123');var c=JSON.parse(localStorage.getItem('cfg')||'{}');c.snd='adhan2';localStorage.setItem('cfg',JSON.stringify(c));return 'seeded'})()" > $OUT/seed.txt 2>&1
sleep 12; adb shell am force-stop $P; sleep 2
adb install -r $D/new.apk > $OUT/inst-new.txt 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 35
$CDP "JSON.stringify({marker:localStorage.getItem('upg_marker'),snd:JSON.parse(localStorage.getItem('cfg')||'{}').snd,hasBox:!!document.getElementById('cuBox'),legacyHidden:(document.getElementById('file')||{}).parentNode&&document.getElementById('file').parentNode.style.display})" > $OUT/after-old-to-new.txt 2>&1
$CDP "(function(){show('settings');var b=document.getElementById('cuBox');if(b)b.scrollIntoView();return !!b})()" > $OUT/open-settings.txt 2>&1; sleep 2; shot 1-settings-no-file
# ---- 2. import a generated test tone (12 s, public test asset, not any recording)
$CDP "(async()=>{var sr=22050,n=sr*12,ab=new ArrayBuffer(44+n*2),v=new DataView(ab);function w(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))}w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);for(var i=0;i<n;i++){var f=330+110*Math.floor(i/sr/3);v.setInt16(44+i*2,Math.round(Math.sin(2*Math.PI*f*i/sr)*9000),true)}await window.__cuImport(new File([ab],'test-tone-12s.wav',{type:'audio/wav'}));return JSON.stringify(await Capacitor.Plugins.AdhanAlarm.customInfo())})()" > $OUT/import-valid.txt 2>&1; sleep 3
files after-import; shot 2-settings-after-import
$CDP "(async()=>{try{await window.__cuImport(new File(['not audio at all'],'notes.txt',{type:'text/plain'}))}catch(e){}return document.getElementById('cuSt').textContent+' | '+JSON.stringify(await Capacitor.Plugins.AdhanAlarm.customInfo())})()" > $OUT/import-invalid.txt 2>&1; sleep 2; files after-invalid; shot 3-invalid-import-message
$CDP "(function(){var s=JSON.parse(localStorage.getItem('cu')||'{}');return JSON.stringify(s)})()" > $OUT/cu-state.txt 2>&1
sleep 4
adb shell run-as $P cat shared_prefs/noor_fs.xml 2>/dev/null | grep -o 'cu&quot;:[01]' | sort | uniq -c > $OUT/alarm-cu-flags.txt
$CDP "document.getElementById('cuTest').click()" > /dev/null 2>&1; sleep 3; shot 4-in-app-test-playing
$CDP "JSON.stringify({btn:document.getElementById('cuTest').textContent,st:document.getElementById('cuSt').textContent})" > $OUT/in-app-test.txt 2>&1
$CDP "document.getElementById('cuTest').click()" > /dev/null 2>&1
# ---- 3. service, app closed, screen off, custom on
adb shell input keyevent KEYCODE_HOME; sleep 2; adb shell am kill $P; sleep 2
adb shell appops set $P SYSTEM_ALERT_WINDOW deny
adb shell input keyevent KEYCODE_SLEEP; sleep 3
alarm 2 adhan_4 1 custom-locked; sleep 5; snap custom-locked-5s; na custom-locked; shot 5-custom-locked-screen
sleep 12; snap custom-after-end; na custom-after-end 8
# ---- 4. same with cu=0 (bundled) to show the difference
alarm 3 adhan_4 0 bundled; sleep 6; snap bundled-6s; na bundled; adb shell am force-stop $P; sleep 2
# ---- 5. missing file fallback
adb shell run-as $P rm -f files/custom_adhan; alarm 2 adhan_4 1 missing; sleep 6; snap missing-6s; na missing; adb shell am force-stop $P; sleep 2
# ---- 6. corrupt file fallback
adb shell "run-as $P sh -c 'head -c 30000 /dev/urandom > files/custom_adhan'"; alarm 2 adhan_4 1 corrupt; sleep 8; snap corrupt-8s; na corrupt 8; adb shell am force-stop $P; sleep 2
# ---- 7. re-import, then update over the top (same apk), file and settings must survive
adb shell input keyevent KEYCODE_WAKEUP; sleep 1; adb shell wm dismiss-keyguard
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 30
$CDP "(async()=>{var sr=22050,n=sr*5,ab=new ArrayBuffer(44+n*2),v=new DataView(ab);function w(o,s){for(var i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))}w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,sr,true);v.setUint32(28,sr*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);for(var i=0;i<n;i++)v.setInt16(44+i*2,Math.round(Math.sin(2*Math.PI*440*i/sr)*9000),true);await window.__cuImport(new File([ab],'tone-5s.wav',{type:'audio/wav'}));var c=JSON.parse(localStorage.getItem('cu'));c.on=[0,0,1,0,1,1];localStorage.setItem('cu',JSON.stringify(c));return JSON.stringify(c)})()" > $OUT/reimport.txt 2>&1
sleep 12; adb shell am force-stop $P; sleep 2
adb install -r $D/new.apk > $OUT/inst-update.txt 2>&1
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 35
files after-update
$CDP "(async()=>{var i=await Capacitor.Plugins.AdhanAlarm.customInfo();return JSON.stringify({info:i,cu:JSON.parse(localStorage.getItem('cu')),marker:localStorage.getItem('upg_marker')})})()" > $OUT/after-update.txt 2>&1
$CDP "(function(){show('settings');document.getElementById('cuBox').scrollIntoView();return 1})()" >/dev/null 2>&1; sleep 2; shot 6-after-update-settings
adb shell run-as $P cat shared_prefs/noor_fs.xml 2>/dev/null | grep -o 'cu&quot;:[01]' | sort | uniq -c > $OUT/alarm-cu-flags-after-update.txt
# ---- 8. delete custom
$CDP "document.getElementById('cuDel').click()" >/dev/null 2>&1; sleep 4; files after-delete; shot 7-after-delete
adb logcat -d > $OUT/logcat.txt
grep -E "FATAL|AndroidRuntime|Uncaught" $OUT/logcat.txt | head -20 > $OUT/errors.txt
