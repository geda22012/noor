#!/bin/bash
# Near-term firing test: azkar exact alarm (native) and Capacitor LocalNotification, permission allowed vs globally blocked. Emulator only.
OUT=/tmp/emu-upg2-$1; mkdir -p $OUT; P=com.noor.islamic
pip install -q websocket-client >/dev/null 2>&1
cdp(){ python3 "$(dirname "$0")/cdp.py" "$1" 2>&1 | tail -1; }
adb install -r new.apk > $OUT/install.txt 2>&1
adb shell pm clear $P >/dev/null
adb shell pm grant $P android.permission.POST_NOTIFICATIONS; adb shell pm grant $P android.permission.ACCESS_FINE_LOCATION
adb shell appops set $P SYSTEM_ALERT_WINDOW allow; adb shell cmd deviceidle whitelist +$P >/dev/null 2>&1
adb emu geo fix 29.9792 31.1342 >/dev/null 2>&1
run(){ # $1 label
  adb shell am force-stop $P; adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 25
  cdp "(function(){var e=document.getElementById('introGo');if(e)e.click();return 1})()" >/dev/null; sleep 25
  NOW=$(adb shell date +%s); AT=$(( (NOW+50)*1000 ))
  cdp "(function(){var A=Capacitor.Plugins.AdhanAlarm,L=Capacitor.Plugins.LocalNotifications;window.__r=[];A.setAzkar({items:[{id:9901,at:$AT,kind:'m',title:'TESTAZKAR',body:'x'}]}).then(function(){__r.push('azkar ok')}).catch(function(e){__r.push('azkar err '+e)});L.schedule({notifications:[{id:9902,title:'TESTCAP',body:'x',schedule:{at:new Date($AT+5000),allowWhileIdle:true},channelId:'remind'}]}).then(function(){__r.push('cap ok')}).catch(function(e){__r.push('cap err '+e)});return 1})()" >/dev/null
  sleep 5; cdp "JSON.stringify(window.__r)" > $OUT/$1-sched-result.txt
  adb shell dumpsys alarm | grep -B1 -A2 "AZKAR_9901" | head -8 > $OUT/$1-os-alarm.txt
  sleep 75
  adb shell dumpsys notification --noredact | grep -E "TESTAZKAR|TESTCAP|pkg=$P" | head -12 > $OUT/$1-notifs.txt
  adb shell am start -n $P/.MainActivity >/dev/null 2>&1; sleep 3
  cdp "(function(){window.__diag();return 1})()" >/dev/null; sleep 6
  cdp "(function(){var o=[].slice.call(document.querySelectorAll('div,pre')).filter(function(x){return /NATIVE STATUS/.test(x.textContent)&&x.children.length<4}).pop();var t=o?o.textContent:'no overlay';return t.slice(t.indexOf('NATIVE STATUS'))})()" > $OUT/$1-native.txt
  adb exec-out screencap -p > $OUT/$1.png
}
run A-allowed
adb shell cmd appops set $P POST_NOTIFICATION deny; adb shell pm revoke $P android.permission.POST_NOTIFICATIONS
run C-notif-blocked
adb shell logcat -d | grep -iE "SalatReceiver|AdhanReceiver|NotificationService.*noor|noor" | tail -40 > $OUT/logcat.txt
