package com.noor.islamic;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioManager;
import android.os.Build;

/** Optional: phone ringer goes silent after the iqama and comes back to the previous mode later.
 *  Needs the user's "Do Not Disturb access" grant. Off by default. Restore = exact alarm + boot + app start. */
public class Silent {
    static final String ACT_RESTORE = "com.noor.islamic.RESTORE_RINGER";
    static SharedPreferences p(Context c) { return c.getSharedPreferences("noor_sil", 0); }

    static boolean access(Context c) {
        try {
            if (Build.VERSION.SDK_INT < 23) return true;
            return ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).isNotificationPolicyAccessGranted();
        } catch (Throwable t) { return false; }
    }

    static boolean on(Context c) { return p(c).getBoolean("on", false); }

    /** Called when the iqama has finished playing (not when it was stopped). */
    static void start(Context c) {
        try {
            if (!on(c)) return;
            if (!access(c)) { AdhanAlarmPlugin.fire(c, "silent skipped: no Do Not Disturb access"); return; }
            AudioManager am = (AudioManager) c.getSystemService(Context.AUDIO_SERVICE);
            int cur = am.getRingerMode();
            if (cur == AudioManager.RINGER_MODE_SILENT) { AdhanAlarmPlugin.fire(c, "silent skipped: already silent"); return; }
            if (p(c).getLong("until", 0) > System.currentTimeMillis()) { AdhanAlarmPlugin.fire(c, "silent skipped: already pending restore"); return; }
            int mins = p(c).getInt("min", 15);
            long until = System.currentTimeMillis() + mins * 60000L;
            p(c).edit().putInt("prev", cur).putLong("until", until).apply();
            am.setRingerMode(AudioManager.RINGER_MODE_SILENT);
            schedule(c, until);
            AdhanAlarmPlugin.fire(c, "silent ON prev=" + cur + " for " + mins + " min");
        } catch (Throwable t) { AdhanAlarmPlugin.fire(c, "silent start failed " + t); }
    }

    static void schedule(Context c, long at) {
        try {
            AlarmManager al = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            Intent i = new Intent(c, AdhanReceiver.class).setAction(ACT_RESTORE);
            PendingIntent pi = PendingIntent.getBroadcast(c, 4990, i, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
            if (Build.VERSION.SDK_INT >= 31 && !al.canScheduleExactAlarms()) al.set(AlarmManager.RTC_WAKEUP, at, pi);
            else if (Build.VERSION.SDK_INT >= 23) al.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi);
            else al.setExact(AlarmManager.RTC_WAKEUP, at, pi);
        } catch (Throwable t) { }
    }

    /** Restore when due (or when forced by the restore alarm). Leaves the mode alone if the user changed it meanwhile. */
    static boolean restoreIfDue(Context c, boolean force) {
        try {
            long until = p(c).getLong("until", 0);
            if (until == 0) return false;
            long now = System.currentTimeMillis();
            if (!force && now < until) return false;
            AudioManager am = (AudioManager) c.getSystemService(Context.AUDIO_SERVICE);
            int prev = p(c).getInt("prev", AudioManager.RINGER_MODE_NORMAL);
            if (am.getRingerMode() == AudioManager.RINGER_MODE_SILENT) {
                try { am.setRingerMode(prev); AdhanAlarmPlugin.fire(c, "silent OFF restored mode=" + prev); }
                catch (Throwable t) { AdhanAlarmPlugin.fire(c, "silent restore failed " + t); return false; }
            } else AdhanAlarmPlugin.fire(c, "silent OFF: user already changed the mode, left alone");
            p(c).edit().putLong("until", 0).apply();
            return true;
        } catch (Throwable t) { return false; }
    }

    /** After reboot / app start: restore if due, re-arm the alarm if still pending. */
    static void recover(Context c) {
        try {
            long until = p(c).getLong("until", 0);
            if (until == 0) return;
            if (System.currentTimeMillis() >= until) restoreIfDue(c, false); else schedule(c, until);
        } catch (Throwable t) { }
    }

    /** Spoken reminder for the after-prayer azkar, right after the ringer is back. Silent channel + short clip (same as the azkar voice). */
    static void remind(Context c, android.content.BroadcastReceiver.PendingResult pr) {
        try {
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            int res = c.getResources().getIdentifier("azkar_salat", "raw", c.getPackageName());
            String ch = "azkar";
            if (res != 0 && Build.VERSION.SDK_INT >= 26) {
                if (nm.getNotificationChannel("azkar_v") == null) {
                    android.app.NotificationChannel cv = new android.app.NotificationChannel("azkar_v", "تذكير الأذكار (بصوت)", NotificationManager.IMPORTANCE_DEFAULT);
                    cv.setSound(null, null); cv.enableVibration(false);
                    nm.createNotificationChannel(cv);
                }
                ch = "azkar_v";
            } else if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel("azkar") == null) {
                nm.createNotificationChannel(new android.app.NotificationChannel("azkar", "تذكير الأذكار", NotificationManager.IMPORTANCE_DEFAULT));
            }
            Intent a = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pi = PendingIntent.getActivity(c, 7503, a, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
            android.app.Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new android.app.Notification.Builder(c, ch) : new android.app.Notification.Builder(c);
            String body = "حان وقت أذكار بعد الصلاة. افتح نور المسلم واقرأها.";
            b.setSmallIcon(c.getApplicationInfo().icon).setContentTitle("أذكار الصلاة").setContentText(body).setAutoCancel(true).setContentIntent(pi);
            nm.notify(7603, b.build());
            boolean q = SalatReceiver.quiet(c), ap = AdhanService.playing;
            if (res != 0 && !q && !ap) { AdhanAlarmPlugin.fire(c, "azkar salat PLAY"); SalatReceiver.playRes(c, res, pr); return; }
            AdhanAlarmPlugin.fire(c, "azkar salat skipped res=" + (res != 0) + " quiet=" + q + " adhanPlaying=" + ap);
        } catch (Throwable t) { AdhanAlarmPlugin.fire(c, "azkar salat failed " + t); }
        try { if (pr != null) pr.finish(); } catch (Throwable t) { }
    }
}
