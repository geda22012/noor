package com.noor.islamic;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.widget.RemoteViews;
import org.json.JSONArray;
import org.json.JSONObject;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class NoorWidget extends AppWidgetProvider {
    static final String[] NAMES = {"الفجر", "الشروق", "الظهر", "العصر", "المغرب", "العشاء"};

    @Override
    public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
        try { for (int id : ids) m.updateAppWidget(id, build(c)); } catch (Throwable t) { android.util.Log.e("NoorWidget", "update failed " + t); }
    }

    public static void refresh(Context c) {
        try {
            RemoteViews probe = build(c);
            android.util.Log.i("NoorWidget", "build ok layout=" + (probe.getLayoutId() != 0));
            AppWidgetManager m = AppWidgetManager.getInstance(c);
            int[] ids = m.getAppWidgetIds(new ComponentName(c, NoorWidget.class));
            if (ids != null && ids.length > 0) for (int id : ids) m.updateAppWidget(id, build(c));
        } catch (Throwable t) { }
    }

    static RemoteViews build(Context c) {
        RemoteViews v = new RemoteViews(c.getPackageName(), R_layout(c));
        String name = "افتح نور", time = "", left = "";
        try {
            JSONArray arr = new JSONArray(c.getSharedPreferences("noor_fs", 0).getString("alarms", "[]"));
            long now = System.currentTimeMillis(), best = Long.MAX_VALUE;
            int bi = -1;
            for (int k = 0; k < arr.length(); k++) {
                JSONObject o = arr.getJSONObject(k);
                long at = o.getLong("at");
                if (at > now && at < best) { best = at; bi = o.getInt("idx"); }
            }
            if (bi >= 0 && bi < NAMES.length) {
                name = "الصلاة القادمة: " + NAMES[bi];
                time = new SimpleDateFormat("hh:mm a", new Locale("ar")).format(new Date(best));
                long mins = (best - now) / 60000;
                left = "بعد " + (mins / 60) + " س " + (mins % 60) + " د";
            } else {
                name = "افتح نور لتحديث المواقيت";
            }
        } catch (Throwable t) { }
        v.setTextViewText(res(c, "id", "w_title"), name);
        v.setTextViewText(res(c, "id", "w_time"), time);
        v.setTextViewText(res(c, "id", "w_left"), left);
        Intent i = new Intent(c, MainActivity.class);
        int f = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        v.setOnClickPendingIntent(res(c, "id", "w_root"), PendingIntent.getActivity(c, 4998, i, f));
        return v;
    }

    static int res(Context c, String type, String n) { return c.getResources().getIdentifier(n, type, c.getPackageName()); }
    static int R_layout(Context c) { return res(c, "layout", "widget_noor"); }
}
