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
            int idx = in.getIntExtra("idx", 2);
            String[] names = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (Build.VERSION.SDK_INT >= 26) {
                NotificationChannel ch = new NotificationChannel("noor_fs", "شاشة الأذان", NotificationManager.IMPORTANCE_HIGH);
                ch.setSound(null, null);
                ch.enableVibration(false);
                ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(ch);
            }
            Intent a = new Intent(c, MainActivity.class);
            a.putExtra("noor_prayer", idx);
            a.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            int f = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
            PendingIntent p = PendingIntent.getActivity(c, 100 + idx, a, f);
            Notification.Builder b = Build.VERSION.SDK_INT >= 26 ? new Notification.Builder(c, "noor_fs") : new Notification.Builder(c);
            b.setSmallIcon(c.getApplicationInfo().icon)
             .setContentTitle("نور")
             .setContentText("حان الآن موعد صلاة " + names[idx])
             .setCategory(Notification.CATEGORY_ALARM)
             .setAutoCancel(true)
             .setContentIntent(p)
             .setFullScreenIntent(p, true);
            if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_MAX);
            nm.notify(9100 + idx, b.build());
        } catch (Throwable t) { }
    }
}
