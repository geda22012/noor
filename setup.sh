#!/usr/bin/env bash
set -e
[ -f assets/adhan.mp3 ] && cp assets/adhan.mp3 www/adhan.mp3
[ -d android ] || npx cap add android
npx cap sync android
if [ -f assets/adhan.mp3 ]; then mkdir -p android/app/src/main/res/raw; cp assets/adhan.mp3 android/app/src/main/res/raw/adhan.mp3; fi
M=android/app/src/main/AndroidManifest.xml
grep -q ACCESS_FINE_LOCATION $M || sed -i 's#</manifest>#    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>\n    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>\n    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM"/>\n    <uses-permission android:name="android.permission.USE_EXACT_ALARM"/>\n    <uses-permission android:name="android.permission.VIBRATE"/>\n</manifest>#' $M
echo "تم. الآن: cd android && ./gradlew assembleDebug"
