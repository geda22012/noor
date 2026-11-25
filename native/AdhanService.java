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
        if (in != null && "STOP".equals(in.getAction())) { shutdown(); return START_NOT_STICKY; }
        int idx = in != null ? in.getIntExtra("idx", 2) : 2;
        String ch0 = in != null ? in.getStringExtra("ch") : null;
        String body = in != null ? in.getStringExtra("body") : null;
        String[] names = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
        if (body == null || body.isEmpty()) body = "حان الآن موعد صلاة " + names[idx];
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(CH) == null) {
            NotificationChannel c = new NotificationChannel(CH, "شاشة الأذان", NotificationManager.IMPORTANCE_HIGH);
            c.setSound(null, null);
            c.enableVibration(false);
            c.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(c);
        }
        int pf = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        Intent la = launchIntent(this, idx);
        PendingIntent open = PendingIntent.getActivity(this, 100 + idx, la, pf);
        Intent st = new Intent(this, AdhanService.class).setAction("STOP");
        PendingIntent stop = PendingIntent.getService(this, 7, st, pf);
        Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(this, CH) : new Notification.Builder(this);
        b.setSmallIcon(getApplicationInfo().icon).setContentTitle("نور المسلم").setContentText(body)
         .setCategory(Notification.CATEGORY_ALARM).setOngoing(true).setAutoCancel(false)
         .setContentIntent(open).setDeleteIntent(stop).setFullScreenIntent(open, true)
         .addAction(new Notification.Action.Builder(null, "إيقاف الأذان", stop).build());
        if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_MAX);
        Notification n = b.build();
        try {
            if (Build.VERSION.SDK_INT >= 29) startForeground(NID, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
            else startForeground(NID, n);
        } catch (Throwable t) {
            try { sendBroadcast(new Intent(this, AdhanReceiver.class).putExtra("idx", idx).putExtra("ch", ch0).putExtra("body", in != null ? in.getStringExtra("body") : null).putExtra("big", in != null ? in.getStringExtra("big") : null).putExtra("fb", true)); } catch (Throwable t2) { }
            stopSelf(); return START_NOT_STICKY;
        }
        try {
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "noor:adhan");
            wl.acquire(6 * 60 * 1000L);
        } catch (Throwable t) { }
        play(ch0);
        // With "display over other apps" allowed, Android lets us open the screen directly.
        try {
            if (Build.VERSION.SDK_INT < 23 || Settings.canDrawOverlays(this)) startActivity(launchIntent(this, idx));
        } catch (Throwable t) { }
        return START_NOT_STICKY;
    }

    void play(String ch) {
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
        try { if (mp != null) { mp.stop(); mp.release(); } } catch (Throwable t) { }
        mp = null;
        try { if (wl != null && wl.isHeld()) wl.release(); } catch (Throwable t) { }
        try { stopForeground(true); } catch (Throwable t) { }
        stopSelf();
    }

    @Override public void onDestroy() { playing = false; try { if (mp != null) mp.release(); } catch (Throwable t) { } super.onDestroy(); }
}
