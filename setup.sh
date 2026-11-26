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
# v2.4: شاشة الأذان فوق القفل (إضافة أصلية)
JD=android/app/src/main/java/com/noor/islamic; mkdir -p $JD; cp native/*.java $JD/
grep -q USE_FULL_SCREEN_INTENT $M || sed -i 's#</manifest>#    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT"/>\n    <uses-permission android:name="android.permission.WAKE_LOCK"/>\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>\n</manifest>#' $M
grep -q AdhanReceiver $M || sed -i 's#</application>#    <receiver android:name=".AdhanReceiver" android:exported="true"><intent-filter><action android:name="android.intent.action.BOOT_COMPLETED"/><action android:name="android.intent.action.MY_PACKAGE_REPLACED"/></intent-filter></receiver>\n    </application>#' $M
grep -q RECEIVE_BOOT_COMPLETED $M || sed -i 's#</manifest>#    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>\n</manifest>#' $M

# v2.8: ويدجت الشاشة الرئيسية
cp -r native/res/* android/app/src/main/res/
grep -q NoorWidget $M || sed -i 's#</application>#    <receiver android:name=".NoorWidget" android:exported="true"><intent-filter><action android:name="android.appwidget.action.APPWIDGET_UPDATE"/></intent-filter><meta-data android:name="android.appwidget.provider" android:resource="@xml/noor_widget_info"/></receiver>\n    </application>#' $M

# v2.9: خدمة تشغيل الأذان في الخلفية + صلاحيات
grep -q AdhanService $M || sed -i 's#</application>#    <service android:name=".AdhanService" android:exported="false" android:foregroundServiceType="mediaPlayback"/>\n    </application>#' $M
grep -q FOREGROUND_SERVICE_MEDIA_PLAYBACK $M || sed -i 's#</manifest>#    <uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>\n    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"/>\n    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW"/>\n    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"/>\n</manifest>#' $M


# v2.9: optional fixed signing key (CI secret) for upgrade-safe updates
G=android/app/build.gradle
if [ -n "$NOOR_KS" ] && ! grep -q NOOR_KS $G; then
  sed -i '0,/^android {/s##android {\n    signingConfigs { debug { storeFile file(System.getenv("NOOR_KS")); storePassword "android"; keyAlias "androiddebugkey"; keyPassword "android" } }#' $G
  echo "signing patched"
fi

# v2.9.1: real version numbers so updates are recognised as updates
sed -i 's/versionCode 1$/versionCode 315/; s/versionName "1.0"/versionName "3.1.5"/' android/app/build.gradle

# v3.0: hourly voice + azkar reminders + boot reschedule
[ -f assets/salat_nabi.mp3 ] && { mkdir -p android/app/src/main/res/raw; cp assets/salat_nabi.mp3 android/app/src/main/res/raw/salat_nabi.mp3; }
grep -q SalatReceiver $M || sed -i 's#</application>#    <receiver android:name=".SalatReceiver" android:exported="true"><intent-filter><action android:name="android.intent.action.BOOT_COMPLETED"/><action android:name="android.intent.action.MY_PACKAGE_REPLACED"/></intent-filter></receiver>\n    </application>#' $M

# v3.0: display name "نور المسلم" (package id and signing key unchanged, so installs upgrade in place)
S=android/app/src/main/res/values/strings.xml
[ -f $S ] && sed -i 's#<string name="app_name">[^<]*</string>#<string name="app_name">نور المسلم</string>#; s#<string name="title_activity_main">[^<]*</string>#<string name="title_activity_main">نور المسلم</string>#' $S

# v3.1: private build only. The main adhan recording is NOT in the repo: the private build workflow places it here before this script runs. Without it the app falls back to the normal bundled adhan.
if [ -f assets/adhan_main.m4a ]; then mkdir -p android/app/src/main/res/raw; cp assets/adhan_main.m4a android/app/src/main/res/raw/adhan_main.m4a; echo "bundled private main adhan"; fi
for f in azkar_morning azkar_evening dua_after; do if [ -f assets/$f.wav ]; then mkdir -p android/app/src/main/res/raw; cp assets/$f.wav android/app/src/main/res/raw/$f.wav; echo "bundled private $f"; fi; done
