package com.noor.islamic;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class AdhanReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context c, Intent in) {
        try {
            String act = in.getAction();
            NoorWidget.refresh(c);
            if (Intent.ACTION_BOOT_COMPLETED.equals(act) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(act)) {
                String j = c.getSharedPreferences("noor_fs", 0).getString("alarms", "[]");
                AdhanAlarmPlugin.setAll(c, new org.json.JSONArray(j));
                return;
            }
            int idx = in.getIntExtra("idx", 2);
            String ch0 = in.getStringExtra("ch");
            try {
                Intent sv = new Intent(c, AdhanService.class);
                sv.putExtra("idx", idx); sv.putExtra("ch", ch0); sv.putExtra("body", in.getStringExtra("body"));
                if (Build.VERSION.SDK_INT >= 26) c.startForegroundService(sv); else c.startService(sv);
                return;
            } catch (Throwable t) { /* fall back to the plain notification below */ }
            String body0 = in.getStringExtra("body");
            String big0 = in.getStringExtra("big");
            String[] names = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (ch0 == null || ch0.isEmpty()) ch0 = "adhan";
            if (Build.VERSION.SDK_INT >= 26 && nm.getNotificationChannel(ch0) == null) {
                NotificationChannel chx = new NotificationChannel(ch0, "الأذان", NotificationManager.IMPORTANCE_HIGH);
                chx.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(chx);
            }
            if (false) {
                NotificationChannel ch = new NotificationChannel("noor_fs", "شاشة الأذان", NotificationManager.IMPORTANCE_HIGH);
                ch.setSound(null, null);
                ch.enableVibration(false);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(ch);
            }
            Intent a = new Intent(c, MainActivity.class);
            a.putExtra("noor_prayer", idx);
            a.putExtra("noor_at", System.currentTimeMillis());
            a.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int f = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
            PendingIntent p = PendingIntent.getActivity(c, 100 + idx, a, f);
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, ch0) : new Notification.Builder(c);
            b.setSmallIcon(c.getApplicationInfo().icon)
             .setContentTitle("نور")
             .setContentText(body0 != null && !body0.isEmpty() ? body0 : "حان الآن موعد صلاة " + names[idx])
             .setStyle(new Notification.BigTextStyle().bigText(big0 != null && !big0.isEmpty() ? big0 : "حان الآن موعد صلاة " + names[idx]))
             .setCategory(Notification.CATEGORY_ALARM)
             .setAutoCancel(true)
             .setContentIntent(p)
             .setFullScreenIntent(p, true);
            if (Build.VERSION.SDK_INT < 26) { b.setPriority(Notification.PRIORITY_MAX); b.setDefaults(Notification.DEFAULT_ALL); }
            nm.notify(9100 + idx, b.build());
        } catch (Throwable t) { }
    }
}
