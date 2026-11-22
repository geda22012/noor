#!/usr/bin/env bash
set -e
[ -f assets/adhan.mp3 ] && cp assets/adhan.mp3 www/adhan.mp3
[ -f assets/iqamah.mp3 ] && cp assets/iqamah.mp3 www/iqamah.mp3
for n in 1 2 3 4 5 6 7 8; do [ -f assets/adhan$n.mp3 ] && cp assets/adhan$n.mp3 www/adhan$n.mp3; done
[ -d android ] || npx cap add android
npx cap sync android
# أيقونة التطبيق
if [ -d assets/icons ]; then
  cp -r assets/icons/mipmap-* android/app/src/main/res/
  printf '<?xml version="1.0" encoding="utf-8"?><resources><color name="ic_launcher_background">#0D463A</color></resources>' > android/app/src/main/res/values/ic_launcher_background.xml
fi
for n in 1 2 3 4 5 6 7 8; do if [ -f assets/adhan$n.mp3 ]; then mkdir -p android/app/src/main/res/raw; cp assets/adhan$n.mp3 android/app/src/main/res/raw/adhan$n.mp3; fi; done
if [ -f assets/adhan.mp3 ]; then mkdir -p android/app/src/main/res/raw; cp assets/adhan.mp3 android/app/src/main/res/raw/adhan.mp3; fi
if [ -f assets/iqamah.mp3 ]; then mkdir -p android/app/src/main/res/raw; cp assets/iqamah.mp3 android/app/src/main/res/raw/iqamah.mp3; fi
M=android/app/src/main/AndroidManifest.xml
grep -q ACCESS_FINE_LOCATION $M || sed -i 's#</manifest>#    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\n    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>\n    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>\n    <uses-permission android:name="android.permission.USE_EXACT_ALARM"/>\n    <uses-permission android:name="android.permission.VIBRATE"/>\n</manifest>#' $M
echo "تم. الآن: cd android && ./gradlew assembleDebug"
