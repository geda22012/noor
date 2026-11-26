package com.noor.islamic;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;

/** Spoken "prayer X in a little while" reminder, 10 minutes before each adhan alarm. Same silent channel + short clip as the azkar voice. */
public class PreRemind {
    static final String ACT = "com.noor.islamic.PRE";
    static final String ACT_TEST = "com.noor.islamic.PRE_TEST";
    static final long LEAD_MS = 10 * 60 * 1000L;
    static final String[] NAMES = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
    static final String[] RES = {"prayer_fajr", "", "prayer_dhuhr", "prayer_asr", "prayer_maghrib", "prayer_isha"};

    static SharedPreferences p(Context c) { return c.getSharedPreferences("noor_pre", 0); }
    static boolean on(Context c) { return p(c).getBoolean("on", true); }

    static PendingIntent pi(Context c, int id, int idx, boolean create) {
        Intent i = new Intent(c, SalatReceiver.class).setAction(ACT + "_" + id);
        i.putExtra("idx", idx);
        int f = (create ? PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_NO_CREATE) | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        return PendingIntent.getBroadcast(c, id, i, f);
    }

    /** Cancel the old reminders and set one per upcoming adhan alarm (alarm time minus 10 minutes). */
    static void schedule(Context c, JSONArray arr) {
        try {
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            int old = p(c).getInt("count", 0);
            for (int k = 1; k <= old + 5; k++) { PendingIntent x = pi(c, 7100 + k, 0, false); if (x != null) { am.cancel(x); x.cancel(); } }
            int n = 0; long now = System.currentTimeMillis(); long first = 0;
            if (on(c)) for (int k = 0; k < arr.length(); k++) {
                JSONObject o = arr.getJSONObject(k);
                int idx = o.getInt("idx");
                if (idx < 0 || idx > 5 || idx == 1) continue;
                long at = o.getLong("at") - LEAD_MS;
                if (at <= now) continue;
                n++;
                SalatReceiver.setExact(c, at, pi(c, 7100 + n, idx, true));
                if (first == 0 || at < first) first = at;
            }
            p(c).edit().putInt("count", n).apply();
            AdhanAlarmPlugin.fire(c, "pre-remind set n=" + n + " on=" + on(c) + (first > 0 ? " next=" + new java.text.SimpleDateFormat("MM-dd HH:mm", java.util.Locale.US).format(new java.util.Date(first)) : ""));
        } catch (Throwable t) { AdhanAlarmPlugin.fire(c, "pre-remind schedule err " + t); }
    }

    static void rescheduleFromStore(Context c) {
        try { schedule(c, new JSONArray(c.getSharedPreferences("noor_fs", 0).getString("alarms", "[]"))); } catch (Throwable t) { }
    }

    static void fireNow(Context c, int idx, BroadcastReceiver.PendingResult pr) {
        try {
            if (idx < 0 || idx > 5 || idx == 1) { if (pr != null) pr.finish(); return; }
            String text = "صلاة " + NAMES[idx] + " بعد قليل";
            if (!on(c)) { AdhanAlarmPlugin.fire(c, "pre-remind skipped (switch off) idx=" + idx); if (pr != null) pr.finish(); return; }
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            int res = c.getResources().getIdentifier(RES[idx], "raw", c.getPackageName());
            String ch = "pre_v";
            if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(ch) == null) {
                NotificationChannel cv = new NotificationChannel(ch, "تذكير قبل الصلاة", NotificationManager.IMPORTANCE_DEFAULT);
                if (res != 0) { cv.setSound(null, null); cv.enableVibration(false); }
                nm.createNotificationChannel(cv);
            }
            Intent a = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pi = PendingIntent.getActivity(c, 7510, a, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, ch) : new Notification.Builder(c);
            b.setSmallIcon(c.getApplicationInfo().icon).setContentTitle(text).setContentText("الأذان بعد ١٠ دقائق").setAutoCancel(true).setContentIntent(pi);
            nm.notify(7610 + idx, b.build());
            boolean q = SalatReceiver.quiet(c), ap = AdhanService.playing;
            if (res != 0 && !q && !ap) { AdhanAlarmPlugin.fire(c, "pre-remind PLAY idx=" + idx); SalatReceiver.playRes(c, res, pr); return; }
            AdhanAlarmPlugin.fire(c, "pre-remind notification only idx=" + idx + " res=" + (res != 0) + " quiet=" + q + " adhanPlaying=" + ap);
        } catch (Throwable t) { AdhanAlarmPlugin.fire(c, "pre-remind failed " + t); }
        try { if (pr != null) pr.finish(); } catch (Throwable t) { }
    }
}
