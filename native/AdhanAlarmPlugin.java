package com.noor.islamic;

import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import org.json.JSONObject;

@CapacitorPlugin(name = "AdhanAlarm")
public class AdhanAlarmPlugin extends Plugin {
    public static volatile int launchPrayer = -1;
    public static volatile long launchAt = 0;

    static PendingIntent pi(Context c, int id, int idx, long at, boolean create) {
        Intent i = new Intent(c, AdhanReceiver.class);
        i.setAction("com.noor.islamic.ADHAN_" + id);
        i.putExtra("idx", idx);
        i.putExtra("id", id);
        int f = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        if (!create) f = PendingIntent.FLAG_NO_CREATE | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        return PendingIntent.getBroadcast(c, id, i, f);
    }

    static int setAll(Context c, org.json.JSONArray arr) throws Exception {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        int old = c.getSharedPreferences("noor_fs", 0).getInt("count", 0);
        for (int k = 1; k <= old + 5; k++) {
            PendingIntent p = pi(c, 5000 + k, 0, 0, false);
            if (p != null) { am.cancel(p); p.cancel(); }
        }
        int n = 0;
        long now = System.currentTimeMillis();
        for (int k = 0; k < arr.length(); k++) {
            JSONObject o = arr.getJSONObject(k);
            long at = o.getLong("at");
            if (at <= now) continue;
            n++;
            Intent i = new Intent(c, AdhanReceiver.class);
            i.setAction("com.noor.islamic.ADHAN_" + (5000 + n));
            i.putExtra("idx", o.getInt("idx"));
            i.putExtra("ch", o.optString("ch", "adhan"));
            i.putExtra("body", o.optString("body", ""));
            i.putExtra("big", o.optString("big", ""));
            int f = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
            PendingIntent p = PendingIntent.getBroadcast(c, 5000 + n, i, f);
            PendingIntent show = PendingIntent.getActivity(c, 4999, new Intent(c, MainActivity.class), f);
            am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, show), p);
        }
        c.getSharedPreferences("noor_fs", 0).edit().putInt("count", n).putString("alarms", arr.toString()).apply();
        NoorWidget.refresh(c);
        return n;
    }

    @PluginMethod
    public void schedule(PluginCall call) {
        try {
            JSArray arr = call.getArray("alarms");
            int n = setAll(getContext(), new org.json.JSONArray(arr.toString()));
            JSObject r = new JSObject();
            r.put("scheduled", n);
            r.put("canFullScreen", canFullScreen());
            call.resolve(r);
        } catch (Throwable t) {
            call.reject("schedule failed: " + t);
        }
    }

    private boolean canFullScreen() {
        if (Build.VERSION.SDK_INT >= 34) {
            NotificationManager nm = (NotificationManager) getContext().getSystemService(Context.NOTIFICATION_SERVICE);
            return nm.canUseFullScreenIntent();
        }
        return true;
    }

    @PluginMethod
    public void getLaunch(PluginCall call) {
        JSObject r = new JSObject();
        r.put("idx", launchPrayer);
        r.put("firedAt", launchAt);
        r.put("canFullScreen", canFullScreen());
        launchPrayer = -1;
        call.resolve(r);
    }

    @PluginMethod
    public void status(PluginCall call) {
        Context c = getContext();
        JSObject r = new JSObject();
        r.put("fullScreen", canFullScreen());
        r.put("overlay", Build.VERSION.SDK_INT < 23 || android.provider.Settings.canDrawOverlays(c));
        boolean bat = true;
        try { if (Build.VERSION.SDK_INT >= 23) bat = ((android.os.PowerManager) c.getSystemService(Context.POWER_SERVICE)).isIgnoringBatteryOptimizations(c.getPackageName()); } catch (Throwable t) { }
        r.put("battery", bat);
        boolean exact = true;
        try { if (Build.VERSION.SDK_INT >= 31) exact = ((AlarmManager) c.getSystemService(Context.ALARM_SERVICE)).canScheduleExactAlarms(); } catch (Throwable t) { }
        r.put("exact", exact);
        r.put("sdk", Build.VERSION.SDK_INT);
        r.put("model", Build.MANUFACTURER + " " + Build.MODEL);
        r.put("playing", AdhanService.playing);
        call.resolve(r);
    }

    @PluginMethod
    public void stopAdhan(PluginCall call) {
        try { if (AdhanService.playing) getContext().startService(new Intent(getContext(), AdhanService.class).setAction("STOP")); } catch (Throwable t) { }
        call.resolve();
    }

    @PluginMethod
    public void openSettings2(PluginCall call) {
        try {
            String w = call.getString("what", "overlay");
            Context c = getContext();
            Intent i;
            if ("overlay".equals(w)) { i = new Intent(android.provider.Settings.ACTION_MANAGE_OVERLAY_PERMISSION, android.net.Uri.parse("package:" + c.getPackageName())); }
            else if ("battery".equals(w)) { i = new Intent(android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS); }
            else if ("exact".equals(w) && Build.VERSION.SDK_INT >= 31) { i = new Intent(android.provider.Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, android.net.Uri.parse("package:" + c.getPackageName())); }
            else { i = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS, android.net.Uri.parse("package:" + c.getPackageName())); }
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
            call.resolve();
        } catch (Throwable t) { call.reject("" + t); }
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            Intent i;
            if (Build.VERSION.SDK_INT >= 34) {
                i = new Intent(android.provider.Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT);
                i.setData(android.net.Uri.parse("package:" + getContext().getPackageName()));
            } else {
                i = new Intent(android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS);
                i.putExtra(android.provider.Settings.EXTRA_APP_PACKAGE, getContext().getPackageName());
            }
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(i);
            call.resolve();
        } catch (Throwable t) { call.reject("" + t); }
    }
}
