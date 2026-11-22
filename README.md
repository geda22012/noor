# نور – تطبيق إسلامي (Capacitor / Android)

## بناء الـ APK بدون Android Studio
1. ارفع المجلد ده على GitHub (repo جديد).
2. تبويب Actions ← Build APK ← Run workflow.
3. نزّل `noor-apk` من نتيجة التشغيل، وفيه `app-debug.apk` ثبّته على موبايلك.

## بناء محلي
المطلوب: Node 18+ و Java 17 و Android SDK.
    npm install
    npm run build
الـ APK هيبقى في `android/app/build/outputs/apk/debug/`.

## صوت الأذان
حط ملف الأذان باسم `assets/adhan.mp3` (يفضل أقل من دقيقة) قبل `npm run build`.
قناة التنبيه بتتثبت أول مرة بصوتها، فلو غيرت الملف بعدين امسح التطبيق وثبته من جديد.
الملف لازم يكون عندك أنت ومسموح لك تستخدمه.

## ملاحظات
- التنبيهات بتتجدول 7 أيام قدام وبتتجدد كل ما تفتح التطبيق، فافتحه مرة في الأسبوع على الأقل.
- على بعض الموبايلات (شاومي، أوبو، هواوي) فعّل "التشغيل التلقائي" واستثني التطبيق من توفير البطارية.
- الخطوط بتتحمل من الإنترنت لو متاح، ولو أوفلاين بيستخدم خط النظام.

## تسجيلات الأذان المضمّنة (v1.3)
- assets/adhan1.mp3: Call to prayer by Sabah Fakhry (Wikimedia Commons، ملك عام)، مقتطع 50 ثانية.
- assets/adhan2.mp3: Adhan, Great Mosque of Mecca, 21 Jan 2013 (Wikimedia Commons، CC BY 3.0)، مقتطع 50 ثانية.
- assets/adhan3.mp3: The Adhan - Muslim Call to Prayer - Aaqib Azeez (Wikimedia Commons، CC BY-SA 4.0)، أول 50 ثانية.
- assets/adhan4.mp3: Hminsec150 Konya, Frans van der Vaart (Wikimedia Commons، CC BY 3.0)، أول 50 ثانية.
- assets/adhan5.mp3: Adhan in Istanbul (Wikimedia Commons، CC0)، أول 50 ثانية.
