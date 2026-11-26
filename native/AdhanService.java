package com.noor.islamic;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;
import android.provider.Settings;

/** Plays the adhan on the alarm stream and shows the adhan screen, even when the app is closed. */
public class AdhanService extends Service {
    static final String CH = "noor_adhan_live";
    static final int NID = 9200;
    static volatile boolean playing = false;
    /* real playback position of the main adhan, so the on-screen words follow the sound and not a wall clock */
    static volatile MediaPlayer mainMp = null;
    static volatile boolean mainDone = false;
    MediaPlayer mp;
    PowerManager.WakeLock wl;

    static Intent launchIntent(Context c, int idx) {
        Intent a = new Intent(c, MainActivity.class);
        a.putExtra("noor_prayer", idx);
        a.putExtra("noor_at", System.currentTimeMillis());
        a.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return a;
    }

    @Override public IBinder onBind(Intent i) { return null; }

    @Override
    public int onStartCommand(Intent in, int flags, int startId) {
        if (in != null && "STOP".equals(in.getAction())) { AdhanAlarmPlugin.fire(this, "STOP received (stop button/notification or screen closed) playing=" + playing); shutdown(); return START_NOT_STICKY; }
        int idx = in != null ? in.getIntExtra("idx", 2) : 2;
        AdhanAlarmPlugin.fire(this, "service start idx=" + idx);
        String ch0 = in != null ? in.getStringExtra("ch") : null;
        String body = in != null ? in.getStringExtra("body") : null;
        String[] names = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
        final int iq = in != null ? in.getIntExtra("iq", 0) : 0;
        tailTest = in != null && in.getIntExtra("tail", 0) == 1 && (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        if (body == null || body.isEmpty()) body = (iq > 0 ? "الإقامة: صلاة " : "حان الآن موعد صلاة ") + names[idx];
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CH) == null) {
            NotificationChannel c = new NotificationChannel(CH, "شاشة الأذان", NotificationManager.IMPORTANCE_HIGH);
            c.setSound(null, null);
            c.enableVibration(false);
            c.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(c);
        }
        int pf = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        Intent la = iq > 0 ? new Intent(this, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP) : launchIntent(this, idx);
        PendingIntent open = PendingIntent.getActivity(this, 100 + idx, la, pf);
        Intent st = new Intent(this, AdhanService.class).setAction("STOP");
        PendingIntent stop = PendingIntent.getService(this, 7, st, pf);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH) : new Notification.Builder(this);
        b.setSmallIcon(getApplicationInfo().icon).setContentTitle("نور المسلم").setContentText(body)
         .setCategory(Notification.CATEGORY_ALARM).setOngoing(true).setAutoCancel(false)
         .setContentIntent(open).setDeleteIntent(stop)
         .addAction(new Notification.Action.Builder(null, iq > 0 ? "إيقاف الإقامة" : "إيقاف الأذان", stop).build());
        if (iq == 0) b.setFullScreenIntent(open, true);
        if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_MAX);
        Notification n = b.build();
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            else startForeground(NID, n);
        } catch (Throwable t) {
            AdhanAlarmPlugin.fire(this, "service startForeground FAILED " + t);
            try { sendBroadcast(new Intent(this, AdhanReceiver.class).putExtra("idx", idx).putExtra("ch", ch0).putExtra("body", in != null ? in.getStringExtra("body") : null).putExtra("big", in != null ? in.getStringExtra("big") : null).putExtra("fb", true)); } catch (Throwable t2) { }
            stopSelf(); return START_NOT_STICKY;
        }
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "noor:adhan");
            wl.acquire(6 * 60 * 1000L);
        } catch (Throwable t) { }
        if (iq > 0) { playIq(iq); return START_NOT_STICKY; }
        play(ch0, in != null && in.getIntExtra("cu", 0) == 1);
        // With "display over other apps" allowed, Android lets us open the screen directly.
        try {
            if (Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(this)) startActivity(launchIntent(this, idx));
        } catch (Throwable t) { }
        return START_NOT_STICKY;
    }

    /** Custom file first (when this prayer is set to it and the file is valid), bundled adhan otherwise. */
    void play(String ch, boolean custom) {
        if (custom) {
            try {
                java.io.File f = AdhanAlarmPlugin.customFile(this);
                if (f.exists() && f.length() > 0) {
                    if (mp != null) { try { mp.release(); } catch (Throwable t) { } }
                    mp = new MediaPlayer();
                    mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
                    try (java.io.FileInputStream fis = new java.io.FileInputStream(f)) { mp.setDataSource(fis.getFD()); }
                    mp.setOnCompletionListener(m -> shutdown());
                    mp.setOnErrorListener((m, w, e) -> {
                        android.util.Log.w("NoorAdhan", "custom error " + w + "/" + e + ", falling back to bundled");
                        try { m.release(); } catch (Throwable t) { }
                        mp = null; playing = false;
                        play(ch, false);
                        return true;
                    });
                    mp.setOnPreparedListener(m -> { playing = true; m.start(); android.util.Log.i("NoorAdhan", "sound=custom ms=" + m.getDuration()); });
                    mp.prepareAsync();
                    return;
                }
                int mrid = getResources().getIdentifier("adhan_main", "raw", getPackageName());
                if (mrid > 0) { android.util.Log.i("NoorAdhan", "sound=bundled-main rid=" + mrid); playRaw("adhan_main"); return; }
                android.util.Log.w("NoorAdhan", "custom file missing, falling back to bundled");
            } catch (Throwable t) {
                android.util.Log.w("NoorAdhan", "custom failed " + t + ", falling back to bundled");
                try { if (mp != null) mp.release(); } catch (Throwable x) { }
                mp = null;
            }
        }
        playBundled(ch);
    }

    /** Iqama: the user's imported file for that slot, else the bundled iqamah. No adhan screen, no second sound. */
    void playIq(int slot) {
        try {
            java.io.File f = AdhanAlarmPlugin.slotFile(this, slot == 2 ? "iq2" : "iq1");
            if (f.exists() && f.length() > 0) {
                if (mp != null) { try { mp.release(); } catch (Throwable t) { } }
                mp = new MediaPlayer();
                mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
                try (java.io.FileInputStream fis = new java.io.FileInputStream(f)) { mp.setDataSource(fis.getFD()); }
                mp.setOnCompletionListener(m -> { Silent.start(this); shutdown(); });
                mp.setOnErrorListener((m, w, e) -> {
                    android.util.Log.w("NoorAdhan", "iqama custom error " + w + "/" + e + ", falling back to bundled");
                    try { m.release(); } catch (Throwable t) { }
                    mp = null; playing = false;
                    playRaw("iqamah");
                    return true;
                });
                mp.setOnPreparedListener(m -> { playing = true; if (tailTest) { try { m.seekTo(Math.max(0, m.getDuration() - 3000)); } catch (Throwable t) { } } m.start(); android.util.Log.i("NoorAdhan", "iqama sound=custom" + slot + " ms=" + m.getDuration()); });
                mp.prepareAsync();
                return;
            }
            android.util.Log.w("NoorAdhan", "iqama custom file missing, falling back to bundled");
        } catch (Throwable t) {
            android.util.Log.w("NoorAdhan", "iqama custom failed " + t + ", falling back to bundled");
            try { if (mp != null) mp.release(); } catch (Throwable x) { }
            mp = null;
        }
        playRaw("iqamah");
    }

    static boolean tailTest = false;

    /** Dua after the adhan (private bundled clip). Plays right after the main adhan ends; without the clip the service just stops. */
    void playDua() {
        try {
            int rid = getResources().getIdentifier("dua_after", "raw", getPackageName());
            if (rid == 0) { AdhanAlarmPlugin.fire(this, "dua clip missing in this build"); shutdown(); return; }
            if (mp != null) { try { mp.release(); } catch (Throwable t) { } }
            mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
            mp.setDataSource(this, Uri.parse("android.resource://" + getPackageName() + "/" + rid));
            mp.setOnCompletionListener(m -> { android.util.Log.i("NoorAdhan", "dua done"); AdhanAlarmPlugin.fire(this, "dua done"); shutdown(); });
            mp.setOnErrorListener((m, w, e) -> { AdhanAlarmPlugin.fire(this, "dua player error " + w + "/" + e); shutdown(); return true; });
            mp.setOnPreparedListener(m -> { playing = true; m.start(); android.util.Log.i("NoorAdhan", "dua sound=dua_after ms=" + m.getDuration()); AdhanAlarmPlugin.fire(this, "dua after adhan PLAY"); });
            mp.prepareAsync();
        } catch (Throwable t) { AdhanAlarmPlugin.fire(this, "dua failed " + t); shutdown(); }
    }

    void playRaw(String nm) {
        try {
            int rid = getResources().getIdentifier(nm, "raw", getPackageName());
            android.util.Log.i("NoorAdhan", "sound=" + nm + " rid=" + rid);
            if (rid == 0) { shutdown(); return; }
            if (mp != null) { try { mp.release(); } catch (Throwable t) { } }
            mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            mp.setDataSource(this, Uri.parse("android.resource://" + getPackageName() + "/" + rid));
            final boolean mainAdhan = "adhan_main".equals(nm);
            final boolean iqRaw = "iqamah".equals(nm);
            if (mainAdhan) { mainDone = false; mainMp = null; }
            mp.setOnCompletionListener(m -> { AdhanAlarmPlugin.fire(this, nm + " completed" + (mainAdhan ? " -> dua" : "")); if (mainAdhan) { mainDone = true; mainMp = null; } if (mainAdhan) playDua(); else { if (iqRaw) Silent.start(this); shutdown(); } });
            mp.setOnErrorListener((m, w, e) -> { AdhanAlarmPlugin.fire(this, nm + " player error " + w + "/" + e); shutdown(); return true; });
            mp.setOnPreparedListener(m -> { playing = true; if (mainAdhan) mainMp = m; if ((mainAdhan || iqRaw) && tailTest) { try { m.seekTo(Math.max(0, m.getDuration() - 3000)); } catch (Throwable t) { } } m.start(); });
            mp.prepareAsync();
        } catch (Throwable t) { shutdown(); }
    }

    void playBundled(String ch) {
        try {
            String nm = "adhan4";
            if (ch != null && ch.matches("adhan_[1-6]")) nm = "adhan" + ch.substring(6);
            int rid = getResources().getIdentifier(nm, "raw", getPackageName());
            if (rid == 0) rid = getResources().getIdentifier("adhan4", "raw", getPackageName());
            android.util.Log.i("NoorAdhan", "sound=" + nm + " rid=" + rid);
            if (rid == 0) return;
            if (mp != null) { try { mp.release(); } catch (Throwable t) { } }
            mp = new MediaPlayer();
            mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build());
            mp.setDataSource(this, Uri.parse("android.resource://" + getPackageName() + "/" + rid));
            mp.setOnCompletionListener(m -> shutdown());
            mp.setOnErrorListener((m, w, e) -> { shutdown(); return true; });
            mp.setOnPreparedListener(m -> { playing = true; m.start(); });
            mp.prepareAsync();
        } catch (Throwable t) { shutdown(); }
    }

    void shutdown() {
        playing = false;
        mainMp = null;
        try { if (mp != null) { mp.stop(); mp.release(); } } catch (Throwable t) { }
        mp = null;
        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Throwable t) { }
        try { stopForeground(true); } catch (Throwable t) { }
        stopSelf();
    }

    @Override public void onDestroy() { playing = false; try { if (mp != null) mp.release(); } catch (Throwable t) { } super.onDestroy(); }
}
