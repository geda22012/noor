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
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import java.util.Calendar;
import org.json.JSONArray;
import org.json.JSONObject;

/** Hourly spoken "salli ala Muhammad" + morning/evening azkar reminder notifications. */
public class SalatReceiver extends BroadcastReceiver {
    static final String A_SALAT = "com.noor.islamic.SALAT";
    static final String A_AZKAR = "com.noor.islamic.AZKAR";

    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("noor_salat", 0); }

    static void setExact(Context c, long at, PendingIntent p) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        try {
            if (Build.VERSION.SDK_INT >= 31 && !am.canScheduleExactAlarms()) { am.set(AlarmManager.RTC_WAKEUP, at, p); return; }
            if (Build.VERSION.SDK_INT >= 23) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, p);
            else am.setExact(AlarmManager.RTC_WAKEUP, at, p);
        } catch (Throwable t) { try { am.set(AlarmManager.RTC_WAKEUP, at, p); } catch (Throwable t2) { } }
    }

    static int flags(boolean create) {
        return (create ? PendingIntent.FLAG_UPDATE_CURRENT : PendingIntent.FLAG_NO_CREATE) | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
    }

    static PendingIntent salatPi(Context c, boolean create) {
        Intent i = new Intent(c, SalatReceiver.class).setAction(A_SALAT);
        return PendingIntent.getBroadcast(c, 7001, i, flags(create));
    }

    /** Schedule (or cancel) the next top-of-the-hour voice reminder. */
    static void scheduleSalat(Context c) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        boolean on = prefs(c).getBoolean("on", false);
        if (!on) {
            PendingIntent old = salatPi(c, false);
            if (old != null) { am.cancel(old); old.cancel(); }
            return;
        }
        Calendar k = Calendar.getInstance();
        k.set(Calendar.MINUTE, 0); k.set(Calendar.SECOND, 0); k.set(Calendar.MILLISECOND, 0);
        k.add(Calendar.HOUR_OF_DAY, 1);
        setExact(c, k.getTimeInMillis(), salatPi(c, true));
    }

    static boolean quiet(Context c) {
        SharedPreferences p = prefs(c);
        int qf = p.getInt("qf", 23), qt = p.getInt("qt", 5);
        int h = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
        if (qf == qt) return false;
        return qf < qt ? (h >= qf && h < qt) : (h >= qf || h < qt);
    }

    /** Store and schedule azkar reminder notifications: items = [{id,at,kind,title,body}] */
    static void scheduleAzkar(Context c, JSONArray items) {
        try {
            AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
            SharedPreferences p = prefs(c);
            JSONArray old = new JSONArray(p.getString("azkar", "[]"));
            for (int i = 0; i < old.length(); i++) {
                int id = old.getJSONObject(i).getInt("id");
                Intent in = new Intent(c, SalatReceiver.class).setAction(A_AZKAR + "_" + id);
                PendingIntent pp = PendingIntent.getBroadcast(c, id, in, flags(false));
                if (pp != null) { am.cancel(pp); pp.cancel(); }
            }
            long now = System.currentTimeMillis();
            JSONArray keep = new JSONArray();
            for (int i = 0; i < items.length(); i++) {
                JSONObject o = items.getJSONObject(i);
                long at = o.getLong("at");
                if (at <= now) continue;
                int id = o.getInt("id");
                Intent in = new Intent(c, SalatReceiver.class).setAction(A_AZKAR + "_" + id);
                in.putExtra("id", id).putExtra("kind", o.optString("kind")).putExtra("title", o.optString("title")).putExtra("body", o.optString("body"));
                setExact(c, at, PendingIntent.getBroadcast(c, id, in, flags(true)));
                keep.put(o);
            }
            p.edit().putString("azkar", keep.toString()).apply();
        } catch (Throwable t) { }
    }

    static void rescheduleAll(Context c) {
        try { scheduleSalat(c); } catch (Throwable t) { }
        try { scheduleAzkar(c, new JSONArray(prefs(c).getString("azkar", "[]"))); } catch (Throwable t) { }
    }

    @Override
    public void onReceive(Context c, Intent in) {
        try {
            String act = in.getAction() == null ? "" : in.getAction();
            if (Intent.ACTION_BOOT_COMPLETED.equals(act) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(act)) { rescheduleAll(c); return; }
            if (A_SALAT.equals(act)) {
                scheduleSalat(c);
                SharedPreferences p = prefs(c);
                if (p.getBoolean("on", false) && !quiet(c) && !AdhanService.playing) play(c, goAsync());
                return;
            }
            if (act.startsWith(A_AZKAR)) { notifyAzkar(c, in); }
        } catch (Throwable t) { }
    }

    static void notifyAzkar(Context c, Intent in) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel("azkar") == null) {
            NotificationChannel ch = new NotificationChannel("azkar", "تذكير الأذكار", NotificationManager.IMPORTANCE_DEFAULT);
            nm.createNotificationChannel(ch);
        }
        String kind = in.getStringExtra("kind");
        Intent a = new Intent(c, MainActivity.class);
        a.putExtra("noor_azkar", kind == null ? "" : kind);
        a.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent p = PendingIntent.getActivity(c, 7500 + (kind != null && kind.startsWith("m") ? 1 : 2), a, flags(true));
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, "azkar") : new Notification.Builder(c);
        String body = in.getStringExtra("body");
        b.setSmallIcon(c.getApplicationInfo().icon).setContentTitle(in.getStringExtra("title")).setContentText(body)
         .setStyle(new Notification.BigTextStyle().bigText(body)).setAutoCancel(true).setContentIntent(p);
        nm.notify(7600 + (kind != null && kind.startsWith("m") ? 1 : 2), b.build());
    }

    static void play(final Context c, final PendingResult pr) {
        final PowerManager.WakeLock wl = ((PowerManager) c.getSystemService(Context.POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "noor:salat");
        wl.acquire(20000);
        final Handler h = new Handler(Looper.getMainLooper());
        final boolean[] done = {false};
        final Runnable fin = new Runnable() { public void run() { if (done[0]) return; done[0] = true; try { if (wl.isHeld()) wl.release(); } catch (Throwable t) { } try { pr.finish(); } catch (Throwable t) { } } };
        h.postDelayed(fin, 15000);
        try {
            int res = c.getResources().getIdentifier("salat_nabi", "raw", c.getPackageName());
            if (res != 0) {
                MediaPlayer mp = MediaPlayer.create(c, res, new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build(), 0);
                if (mp != null) {
                    mp.setOnCompletionListener(new MediaPlayer.OnCompletionListener() { public void onCompletion(MediaPlayer m) { try { m.release(); } catch (Throwable t) { } fin.run(); } });
                    mp.start();
                    return;
                }
            }
            final android.speech.tts.TextToSpeech[] tts = new android.speech.tts.TextToSpeech[1];
            tts[0] = new android.speech.tts.TextToSpeech(c, new android.speech.tts.TextToSpeech.OnInitListener() {
                public void onInit(int s) {
                    try {
                        if (s == 0 && tts[0].setLanguage(new java.util.Locale("ar")) >= 0) {
                            tts[0].speak("صلِّ على محمد", android.speech.tts.TextToSpeech.QUEUE_FLUSH, null, "salat");
                            h.postDelayed(new Runnable() { public void run() { try { tts[0].shutdown(); } catch (Throwable t) { } fin.run(); } }, 4000);
                            return;
                        }
                    } catch (Throwable t) { }
                    fin.run();
                }
            });
        } catch (Throwable t) { fin.run(); }
    }
}
