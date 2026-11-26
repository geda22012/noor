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
            AdhanAlarmPlugin.fire(c, "adhan-rx " + act + " idx=" + in.getIntExtra("idx", -1) + (in.getBooleanExtra("fb", false) ? " fb" : ""));
            if ("com.noor.islamic.TEST_ALARM".equals(act) && (c.getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
                Intent t = new Intent(c, AdhanReceiver.class).setAction("com.noor.islamic.ADHAN_TEST").putExtra("idx", in.getIntExtra("idx", 2)).putExtra("ch", in.getStringExtra("ch") != null ? in.getStringExtra("ch") : "adhan_4").putExtra("cu", in.getIntExtra("cu", 0)).putExtra("iq", in.getIntExtra("iq", 0));
                PendingIntent tp = PendingIntent.getBroadcast(c, 4998, t, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                PendingIntent sh = PendingIntent.getActivity(c, 4997, new Intent(c, MainActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                ((android.app.AlarmManager) c.getSystemService(Context.ALARM_SERVICE)).setAlarmClock(new android.app.AlarmManager.AlarmClockInfo(System.currentTimeMillis() + 6000, sh), tp);
                return;
            }
            NoorWidget.refresh(c);
            if (Intent.ACTION_BOOT_COMPLETED.equals(act) || Intent.ACTION_MY_PACKAGE_REPLACED.equals(act)) {
                String j = c.getSharedPreferences("noor_fs", 0).getString("alarms", "[]");
                AdhanAlarmPlugin.setAll(c, new org.json.JSONArray(j));
                return;
            }
            int idx = in.getIntExtra("idx", 2);
            String ch0 = in.getStringExtra("ch");
            if (!in.getBooleanExtra("fb", false)) try {
                Intent sv = new Intent(c, AdhanService.class);
                sv.putExtra("idx", idx); sv.putExtra("ch", ch0); sv.putExtra("cu", in.getIntExtra("cu", 0)); sv.putExtra("iq", in.getIntExtra("iq", 0)); sv.putExtra("body", in.getStringExtra("body"));
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
             .setContentTitle("نور المسلم")
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
