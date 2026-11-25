#!/bin/bash
# real-signer upgrade: v2.9.1 release APK (production key) -> new build signed with production key
API=$1; OUT=/tmp/emu-upg2-$API; mkdir -p $OUT; P=com.noor.islamic
AS=$(ls $ANDROID_HOME/build-tools/*/apksigner | tail -1)
for f in old.apk new.apk; do echo "== $f" >> $OUT/signer.txt; $AS verify --print-certs $f 2>&1 | grep -i "SHA-256\|DN" >> $OUT/signer.txt; done
adb install -r old.apk > $OUT/inst-old.txt 2>&1; cat $OUT/inst-old.txt
adb shell dumpsys package $P | grep -E "versionName" | head -1 > $OUT/ver-old.txt
adb shell pm grant $P android.permission.POST_NOTIFICATIONS 2>/dev/null
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25
pip install -q websocket-client >/dev/null 2>&1
python3 new/ci/cdp.py "(function(){localStorage.setItem('upg_marker','keep-me-123');return Object.keys(localStorage).length})()" > $OUT/seed.txt 2>&1
python3 new/ci/cdp.py "JSON.stringify(Object.keys(localStorage))" > $OUT/keys-before.txt 2>&1
adb exec-out screencap -p > $OUT/old-shot.png
adb shell am force-stop $P; sleep 2
adb install -r new.apk > $OUT/inst-new.txt 2>&1; cat $OUT/inst-new.txt
adb shell dumpsys package $P | grep -E "versionName|versionCode" | head -3 > $OUT/ver-new.txt
adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25
python3 new/ci/cdp.py "localStorage.getItem('upg_marker')" > $OUT/marker-after.txt 2>&1
python3 new/ci/cdp.py "JSON.stringify(Object.keys(localStorage))" > $OUT/keys-after.txt 2>&1
adb exec-out screencap -p > $OUT/new-shot.png
adb logcat -d | grep -E "FATAL|AndroidRuntime" | head > $OUT/fatal.txt
