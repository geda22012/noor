package com.noor.islamic;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdhanAlarmPlugin.class);
        super.onCreate(savedInstanceState);
        remember(getIntent());
        try {
            getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
                @Override
                public void handleOnBackPressed() {
                    final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
                    if (wv == null) { finish(); return; }
                    wv.evaluateJavascript("(function(){try{return window.__noorBack?(window.__noorBack()?'1':'0'):'0'}catch(e){return '0'}})()", value -> {
                        if (value == null || !value.contains("1")) finish();
                    });
                }
            });
        } catch (Throwable t) { }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        remember(intent);
    }

    private void remember(Intent i) {
        if (i != null && i.hasExtra("noor_prayer")) {
            AdhanAlarmPlugin.launchPrayer = i.getIntExtra("noor_prayer", -1);
            AdhanAlarmPlugin.launchAt = i.getLongExtra("noor_at", 0);
            i.removeExtra("noor_prayer");
            try {
                if (Build.VERSION.SDK_INT >= 27) {
                    setShowWhenLocked(true);
                    setTurnScreenOn(true);
                } else {
                    getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                            | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
                }
                getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            } catch (Throwable t) { }
        }
    }
}
