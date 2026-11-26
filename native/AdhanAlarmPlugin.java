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
    public static volatile String launchAzkar = null;

    static void fire(Context c, String tag) {
        try {
            android.content.SharedPreferences sp = c.getSharedPreferences("noor_fire", 0);
            String cur = sp.getString("log", "");
            String line = new java.text.SimpleDateFormat("MM-dd HH:mm:ss", java.util.Locale.US).format(new java.util.Date()) + " " + tag;
            String[] a = cur.isEmpty() ? new String[0] : cur.split("\n");
            StringBuilder b = new StringBuilder();
            for (int i = Math.max(0, a.length - 39); i < a.length; i++) b.append(a[i]).append("\n");
            b.append(line);
            sp.edit().putString("log", b.toString()).apply();
        } catch (Throwable t) { }
    }

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
        fire(c, "setAll n=" + n);
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
    public void peekLaunch(PluginCall call) {
        JSObject r = new JSObject();
        r.put("idx", launchPrayer);
        call.resolve(r);
    }

    @PluginMethod
    public void getLaunch(PluginCall call) {
        JSObject r = new JSObject();
        r.put("idx", launchPrayer);
        r.put("firedAt", launchAt);
        r.put("canFullScreen", canFullScreen());
        r.put("azkar", launchAzkar == null ? "" : launchAzkar);
        launchAzkar = null;
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
        r.put("mfr", Build.MANUFACTURER);
        boolean exact = true;
        try { if (Build.VERSION.SDK_INT >= 31) exact = ((AlarmManager) c.getSystemService(Context.ALARM_SERVICE)).canScheduleExactAlarms(); } catch (Throwable t) { }
        r.put("exact", exact);
        boolean nt = true;
        try { nt = ((NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE)).areNotificationsEnabled(); } catch (Throwable t) { }
        r.put("notif", nt);
        boolean lc = true;
        try { if (Build.VERSION.SDK_INT >= 23) lc = c.checkSelfPermission("android.permission.ACCESS_FINE_LOCATION") == 0 || c.checkSelfPermission("android.permission.ACCESS_COARSE_LOCATION") == 0; } catch (Throwable t) { }
        r.put("loc", lc);
        r.put("sdk", Build.VERSION.SDK_INT);
        r.put("model", Build.MANUFACTURER + " " + Build.MODEL);
        r.put("playing", AdhanService.playing);
        call.resolve(r);
    }

    @PluginMethod
    public void diag(PluginCall call) {
        Context c = getContext();
        JSObject r = new JSObject();
        try {
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            StringBuilder o = new StringBuilder();
            try { android.content.pm.PackageInfo pi0 = c.getPackageManager().getPackageInfo(c.getPackageName(), 0); o.append("appVersion=").append(pi0.versionName).append(" code=").append(Build.VERSION.SDK_INT >= 28 ? pi0.getLongVersionCode() : pi0.versionCode).append("\n"); } catch (Throwable t) { }
            o.append("model=").append(Build.MANUFACTURER).append(" ").append(Build.MODEL).append(" sdk=").append(Build.VERSION.SDK_INT).append("\n");
            o.append("notificationsEnabled=").append(nm.areNotificationsEnabled()).append("\n");
            if (Build.VERSION.SDK_INT >= 33) o.append("POST_NOTIFICATIONS=").append(c.checkSelfPermission("android.permission.POST_NOTIFICATIONS") == 0).append("\n");
            boolean exact = true;
            try { if (Build.VERSION.SDK_INT >= 31) exact = ((AlarmManager) c.getSystemService(Context.ALARM_SERVICE)).canScheduleExactAlarms(); } catch (Throwable t) { }
            o.append("exactAlarm=").append(exact).append("\n");
            boolean bat = true;
            try { if (Build.VERSION.SDK_INT >= 23) bat = ((android.os.PowerManager) c.getSystemService(Context.POWER_SERVICE)).isIgnoringBatteryOptimizations(c.getPackageName()); } catch (Throwable t) { }
            o.append("batteryUnrestricted=").append(bat).append("\n");
            o.append("overlay=").append(Build.VERSION.SDK_INT < 23 || android.provider.Settings.canDrawOverlays(c)).append("\n");
            o.append("fullScreenIntent=").append(canFullScreen()).append("\n");
            if (Build.VERSION.SDK_INT >= 26) {
                String[] ids = {"noor_adhan_live", "azkar", "iqamah", "remind", "adhan_4", "adhan"};
                for (String id : ids) { android.app.NotificationChannel ch = nm.getNotificationChannel(id); o.append("ch ").append(id).append("=").append(ch == null ? "none" : ("imp" + ch.getImportance())).append("\n"); }
            }
            long now = System.currentTimeMillis();
            android.content.SharedPreferences sp = c.getSharedPreferences("noor_fs", 0);
            org.json.JSONArray al = new org.json.JSONArray(sp.getString("alarms", "[]"));
            long nxt = 0; int fut = 0;
            for (int i = 0; i < al.length(); i++) { long at = al.getJSONObject(i).optLong("at"); if (at > now) { fut++; if (nxt == 0 || at < nxt) nxt = at; } }
            java.text.SimpleDateFormat f = new java.text.SimpleDateFormat("MM-dd HH:mm", java.util.Locale.US);
            o.append("appTrackedAdhanAlarms stored=").append(al.length()).append(" future=").append(fut).append(" next=").append(nxt == 0 ? "none" : f.format(new java.util.Date(nxt))).append("\n");
            int live = 0;
            for (int k = 1; k <= al.length() + 5; k++) { PendingIntent p = pi(c, 5000 + k, 0, 0, false); if (p != null) live++; }
            o.append("appTrackedPendingIntentsFound(not an OS total)=").append(live).append("\n");
            try {
                AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
                AlarmManager.AlarmClockInfo ni = am.getNextAlarmClock();
                o.append("nextAlarmClock=").append(ni == null ? "none" : f.format(new java.util.Date(ni.getTriggerTime()))).append("\n");
            } catch (Throwable t) { }
            android.content.SharedPreferences sz = c.getSharedPreferences("noor_salat", 0);
            org.json.JSONArray az = new org.json.JSONArray(sz.getString("azkar", "[]"));
            long an = 0; for (int i = 0; i < az.length(); i++) { long at = az.getJSONObject(i).optLong("at"); if (at > now && (an == 0 || at < an)) an = at; }
            o.append("azkar stored=").append(az.length()).append(" next=").append(an == 0 ? "none" : f.format(new java.util.Date(an))).append(" hourlyOn=").append(sz.getBoolean("on", false)).append("\n");
            o.append("--- receiver fire log (device time) ---\n").append(c.getSharedPreferences("noor_fire", 0).getString("log", "(empty)"));
            r.put("text", o.toString());
            call.resolve(r);
        } catch (Throwable t) { call.reject("diag " + t); }
    }

    private void launch(Intent i) {
        try {
            android.app.Activity a = getActivity();
            if (a != null && !a.isFinishing()) { a.startActivity(i); return; }
        } catch (Throwable t) { }
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(i);
    }

    @PluginMethod
    public void requestBattery(PluginCall call) {
        Context c = getContext();
        fire(c, "requestBattery launch");
        try {
            Intent i = new Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, android.net.Uri.parse("package:" + c.getPackageName()));
            launch(i);
            call.resolve();
        } catch (Throwable t) {
            try {
                Intent i = new Intent(android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                launch(i);
                call.resolve();
            } catch (Throwable t2) { fire(c, "requestBattery FAILED " + t2); call.reject("" + t2); }
        }
    }

    @PluginMethod
    public void openAutostart(PluginCall call) {
        Context c = getContext();
        String[][] cands = {
            {"com.transsion.phonemaster", "com.cyin.himgr.autostart.AutoStartActivity"},
            {"com.transsion.phonemaster", "com.cyin.himgr.MainActivity"},
            {"com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"},
            {"com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"},
            {"com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"},
            {"com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"}};
        for (String[] k : cands) {
            try {
                Intent i = new Intent().setComponent(new android.content.ComponentName(k[0], k[1])).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                c.startActivity(i);
                fire(c, "openAutostart " + k[0]);
                call.resolve();
                return;
            } catch (Throwable t) { }
        }
        try {
            Intent i = new Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS, android.net.Uri.parse("package:" + c.getPackageName())).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
            fire(c, "openAutostart fallback app details");
            call.resolve();
        } catch (Throwable t) { call.reject("" + t); }
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
            launch(i);
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

    @PluginMethod
    public void setSalat(PluginCall call) {
        try {
            android.content.SharedPreferences.Editor e = SalatReceiver.prefs(getContext()).edit();
            e.putBoolean("on", Boolean.TRUE.equals(call.getBoolean("on", false)));
            e.putInt("qf", call.getInt("qf", 23)); e.putInt("qt", call.getInt("qt", 5));
            e.apply();
            SalatReceiver.scheduleSalat(getContext());
            call.resolve();
        } catch (Throwable t) { call.reject("" + t); }
    }

    @PluginMethod
    public void setAzkar(PluginCall call) {
        try {
            SalatReceiver.scheduleAzkar(getContext(), call.getArray("items", new JSArray()));
            call.resolve();
        } catch (Throwable t) { call.reject("" + t); }
    }

    @PluginMethod
    public void requestLocation(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= 23) getActivity().requestPermissions(new String[]{"android.permission.ACCESS_FINE_LOCATION", "android.permission.ACCESS_COARSE_LOCATION"}, 4242);
            call.resolve();
        } catch (Throwable t) { call.reject("" + t); }
    }

    @PluginMethod
    public void openSettings2_dummy(PluginCall call) { call.resolve(); }
}
