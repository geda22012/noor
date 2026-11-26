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
        Calendar nowC = Calendar.getInstance();
        if (nowC.get(Calendar.MINUTE) < 30) k.set(Calendar.MINUTE, 30); else k.add(Calendar.HOUR_OF_DAY, 1);
        setExact(c, k.getTimeInMillis(), salatPi(c, true));
        AdhanAlarmPlugin.fire(c, "salat next=" + new java.text.SimpleDateFormat("HH:mm", java.util.Locale.US).format(new java.util.Date(k.getTimeInMillis())));
    }

    static boolean quiet(Context c) { return quietHour(c, Calendar.getInstance().get(Calendar.HOUR_OF_DAY)); }

    static boolean quietHour(Context c, int h) {
        SharedPreferences p = prefs(c);
        int qf = p.getInt("qf", 23), qt = p.getInt("qt", 5);
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
            AdhanAlarmPlugin.fire(c, "setAzkar n=" + keep.length());
        } catch (Throwable t) { }
    }

    static void rescheduleAll(Context c) {
        try { PreRemind.rescheduleFromStore(c); } catch (Throwable t) { }
        try { scheduleSalat(c); } catch (Throwable t) { }
        try { scheduleAzkar(c, new JSONArray(prefs(c).getString("azkar", "[]"))); } catch (Throwable t) { }
    }

    @Override
    public void onReceive(Context c, Intent in) {
        try {
            String act = in.getAction() == null ? "" : in.getAction();
            AdhanAlarmPlugin.fire(c, "salat-rx " + act);
            if (Intent.ACTION_BOOT_COMPLETED.equals(act) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(act)) { rescheduleAll(c); return; }
            if (A_SALAT.equals(act)) {
                scheduleSalat(c);
                SharedPreferences p = prefs(c);
                boolean on0 = p.getBoolean("on", false), q0 = quiet(c);
                if (on0 && !q0 && !AdhanService.playing) { AdhanAlarmPlugin.fire(c, "salat voice PLAY"); play(c, goAsync()); }
                else AdhanAlarmPlugin.fire(c, "salat voice skipped on=" + on0 + " quiet=" + q0 + " adhanPlaying=" + AdhanService.playing);
                return;
            }
            if (act.startsWith(PreRemind.ACT + "_") || (PreRemind.ACT_TEST.equals(act) && (c.getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0)) { PreRemind.fireNow(c, in.getIntExtra("idx", -1), goAsync()); return; }
            if (act.startsWith(A_AZKAR) || ("com.noor.islamic.AZKAR_TEST".equals(act) && (c.getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0)) { notifyAzkar(c, in, goAsync()); }
        } catch (Throwable t) { }
    }

    static void notifyAzkar(Context c, Intent in, final PendingResult pr) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel("azkar") == null) {
            NotificationChannel ch = new NotificationChannel("azkar", "تذكير الأذكار", NotificationManager.IMPORTANCE_DEFAULT);
            nm.createNotificationChannel(ch);
        }
        String kind = in.getStringExtra("kind");
        final boolean morning = kind != null && kind.startsWith("m");
        final int vres = c.getResources().getIdentifier(morning ? "azkar_morning" : "azkar_evening", "raw", c.getPackageName());
        String chId = "azkar";
        if (vres != 0 && Build.VERSION.SDK_INT >= 26) {
            /* the spoken voice replaces the default tone: silent channel, sound comes from the player below */
            if (nm.getNotificationChannel("azkar_v") == null) {
                NotificationChannel cv = new NotificationChannel("azkar_v", "تذكير الأذكار (بصوت)", NotificationManager.IMPORTANCE_DEFAULT);
                cv.setSound(null, null); cv.enableVibration(false);
                nm.createNotificationChannel(cv);
            }
            chId = "azkar_v";
        }
        Intent a = new Intent(c, MainActivity.class);
        a.putExtra("noor_azkar", kind == null ? "" : kind);
        a.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent p = PendingIntent.getActivity(c, 7500 + (kind != null && kind.startsWith("m") ? 1 : 2), a, flags(true));
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, chId) : new Notification.Builder(c);
        String body = in.getStringExtra("body");
        b.setSmallIcon(c.getApplicationInfo().icon).setContentTitle(in.getStringExtra("title")).setContentText(body)
         .setStyle(new Notification.BigTextStyle().bigText(body)).setAutoCancel(true).setContentIntent(p);
        nm.notify(7600 + (kind != null && kind.startsWith("m") ? 1 : 2), b.build());
        boolean q = quiet(c), ap = AdhanService.playing;
        if (vres != 0 && !q && !ap) { AdhanAlarmPlugin.fire(c, "azkar voice PLAY " + (morning ? "morning" : "evening")); playRes(c, vres, pr); return; }
        try { if (pr != null) pr.finish(); } catch (Throwable t) { }
        AdhanAlarmPlugin.fire(c, "azkar voice skipped res=" + (vres != 0) + " quiet=" + q + " adhanPlaying=" + ap);
    }

    /** Plays a short bundled clip on the media stream, same as the salli voice (own wake lock, released when it ends). */
    static void playRes(final Context c, int res, final PendingResult pr) {
        new Handler(Looper.getMainLooper()).postDelayed(new Runnable() { public void run() { try { if (pr != null) pr.finish(); } catch (Throwable t) { } } }, 14000);
        try {
            final PowerManager.WakeLock wl = ((PowerManager) c.getSystemService(Context.POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "noor:azkarvoice");
            wl.acquire(30000);
            MediaPlayer mp = MediaPlayer.create(c, res, new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build(), 0);
            if (mp == null) { try { wl.release(); } catch (Throwable t) { } return; }
            mp.setOnCompletionListener(new MediaPlayer.OnCompletionListener() { public void onCompletion(MediaPlayer m) { try { m.release(); } catch (Throwable t) { } try { if (wl.isHeld()) wl.release(); } catch (Throwable t) { } AdhanAlarmPlugin.fire(c, "azkar voice done"); try { if (pr != null) pr.finish(); } catch (Throwable t) { } } });
            mp.start();
        } catch (Throwable t) { AdhanAlarmPlugin.fire(c, "azkar voice err " + t); }
    }

    static void play(final Context c, final PendingResult pr) {
        final PowerManager.WakeLock wl = ((PowerManager) c.getSystemService(Context.POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "noor:salat");
        wl.acquire(20000);
        final Handler h = new Handler(Looper.getMainLooper());
        final boolean[] done = {false};
        final Runnable fin = new Runnable() { public void run() { if (done[0]) return; done[0] = true; try { if (wl.isHeld()) wl.release(); } catch (Throwable t) { } try { if (pr != null) pr.finish(); } catch (Throwable t) { } } };
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
