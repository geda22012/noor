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
- assets/adhan1.mp3: Call to prayer by Sabah Fakhry (Wikimedia Commons، ملك عام)، كامل.
- assets/adhan2.mp3: Adhan, Great Mosque of Mecca, 21 Jan 2013 (Wikimedia Commons، CC BY 3.0)، كامل.
- assets/adhan3.mp3: The Adhan - Muslim Call to Prayer - Aaqib Azeez (Wikimedia Commons، CC BY-SA 4.0)، كامل.
- assets/adhan4.mp3: Call to prayer from the Prophet's Mosque (المسجد النبوي), by ejaz215, https://commons.wikimedia.org/wiki/File:33937_ejaz215_call-to-prayer-from-the-prophet-s-mo.ogg (CC BY 3.0، من Freesound).
- assets/adhan5.mp3: الأذان (Adhan/Call to Prayer), by sonically_sound, https://freesound.org/people/sonically_sound/sounds/639494/ (CC0).
- assets/adhan6.mp3: Call to Prayer - Marrakech, by brightonmatt2, https://freesound.org/people/brightonmatt2/sounds/338239/ (CC0).
- كل الملفات اتعملها تطبيع للصوت (loudnorm) وإعادة ترميز 96 كيلو mono. أذان قونيا وإسطنبول (Commons) وأذان الحسن الثاني وأذان الحرم الثاني والمغرب اتشالوا في v2.7.7 لأن جودة تسجيلهم أقل.
- نص القرآن: Tanzil عبر api.alquran.cloud (مضمّن في www/quran.js). التلاوات تُبثّ من cdn.mp3quran.net.
- نص الأذكار: حصن المسلم للقحطاني عبر مشروع rn0x/Adhkar-json.
- assets/iqamah.mp3: Iqamah.ogg, by Aishatu98 (Wikimedia Commons، CC0).

- www/mosque.jpg: "Mosque at Sunset" by Sundaram Ramaswamy, https://commons.wikimedia.org/wiki/File:Mosque_at_Sunset_-_Ramaswamy.jpg (CC BY 2.0، تم تصغيرها فقط، شاشة الأذان).
- www/hadith40.js: الأربعون النووية من https://github.com/fawazahmed0/hadith-api (Unlicense)، النص الأصلي ملك عام.
- توقيتات مزامنة الأذان مع الكلام (adhan1 و adhan3 فقط، على التسجيل الكامل) مستخرجة من فترات السكوت في التسجيل، ولم تتم مراجعتها بالسمع.
