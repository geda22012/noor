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
import java.io.File;
import java.io.FileOutputStream;
import org.json.JSONObject;

@CapacitorPlugin(name = "AdhanAlarm")
public class AdhanAlarmPlugin extends Plugin {
    public static volatile int launchPrayer = -1;
    public static volatile long launchAt = 0;
    public static volatile String launchAzkar = null;

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
            i.putExtra("cu", o.optInt("cu", 0));
            i.putExtra("iq", o.optInt("iq", 0));
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
    public void requestBattery(PluginCall call) {
        Context c = getContext();
        try {
            Intent i = new Intent(android.provider.Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, android.net.Uri.parse("package:" + c.getPackageName()));
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            c.startActivity(i);
            call.resolve();
        } catch (Throwable t) {
            try {
                Intent i = new Intent(android.provider.Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                c.startActivity(i);
                call.resolve();
            } catch (Throwable t2) { call.reject("" + t2); }
        }
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

    // ---- custom adhan file chosen by the user (kept in app-private storage, never bundled) ----
    static final long CU_MAX = 15L * 1024 * 1024;
    static String slotOf(String sl) { return ("iq1".equals(sl) || "iq2".equals(sl)) ? "_" + sl : ""; }
    static File customFile(Context c) { return new File(c.getFilesDir(), "custom_adhan"); }
    static File customTmp(Context c) { return new File(c.getFilesDir(), "custom_adhan.tmp"); }
    static File slotFile(Context c, String sl) { return new File(c.getFilesDir(), slotOf(sl).isEmpty() ? "custom_adhan" : "custom" + slotOf(sl)); }
    static File slotTmp(Context c, String sl) { return new File(slotFile(c, sl).getAbsolutePath() + ".tmp"); }

    @PluginMethod
    public void customWrite(PluginCall call) {
        try {
            String d = call.getString("data");
            boolean app = Boolean.TRUE.equals(call.getBoolean("append", false));
            byte[] b = android.util.Base64.decode(d, android.util.Base64.DEFAULT);
            File t = slotTmp(getContext(), call.getString("slot", ""));
            if (app && t.length() + b.length > CU_MAX) { t.delete(); call.reject("too_big"); return; }
            try (FileOutputStream o = new FileOutputStream(t, app)) { o.write(b); }
            JSObject r = new JSObject();
            r.put("size", t.length());
            call.resolve(r);
        } catch (Throwable t) {
            call.reject("write failed: " + t);
        }
    }

    @PluginMethod
    public void customCommit(PluginCall call) {
        String sl = call.getString("slot", "");
        File t = slotTmp(getContext(), sl);
        try {
            if (!t.exists() || t.length() == 0) { call.reject("empty"); return; }
            android.media.MediaMetadataRetriever mr = new android.media.MediaMetadataRetriever();
            long ms = 0; String hasAudio = null;
            try {
                mr.setDataSource(t.getAbsolutePath());
                String dur = mr.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_DURATION);
                hasAudio = mr.extractMetadata(android.media.MediaMetadataRetriever.METADATA_KEY_HAS_AUDIO);
                ms = dur == null ? 0 : Long.parseLong(dur);
            } finally { try { mr.release(); } catch (Throwable x) { } }
            if (ms < 1000 || hasAudio == null) { t.delete(); call.reject("not_audio"); return; }
            File f = slotFile(getContext(), sl);
            if (f.exists()) f.delete();
            if (!t.renameTo(f)) { t.delete(); call.reject("rename_failed"); return; }
            String name = call.getString("name", "");
            getContext().getSharedPreferences("noor_fs", 0).edit().putString("cu_name" + slotOf(sl), name).putLong("cu_ms" + slotOf(sl), ms).apply();
            JSObject r = new JSObject();
            r.put("ok", true); r.put("ms", ms); r.put("size", f.length());
            call.resolve(r);
        } catch (Throwable x) {
            try { t.delete(); } catch (Throwable y) { }
            call.reject("commit failed: " + x);
        }
    }

    @PluginMethod
    public void customInfo(PluginCall call) {
        String sl = call.getString("slot", "");
        File f = slotFile(getContext(), sl);
        android.content.SharedPreferences sp = getContext().getSharedPreferences("noor_fs", 0);
        JSObject r = new JSObject();
        r.put("has", f.exists() && f.length() > 0);
        r.put("size", f.exists() ? f.length() : 0);
        r.put("ms", sp.getLong("cu_ms" + slotOf(sl), 0));
        r.put("name", sp.getString("cu_name" + slotOf(sl), ""));
        r.put("path", f.getAbsolutePath());
        call.resolve(r);
    }

    @PluginMethod
    public void customClear(PluginCall call) {
        String sl = call.getString("slot", "");
        try { slotFile(getContext(), sl).delete(); slotTmp(getContext(), sl).delete(); } catch (Throwable t) { }
        getContext().getSharedPreferences("noor_fs", 0).edit().remove("cu_name" + slotOf(sl)).remove("cu_ms" + slotOf(sl)).apply();
        JSObject r = new JSObject();
        r.put("ok", true);
        call.resolve(r);
    }
}
