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
                    wv.evaluateJavascript("(function(){try{if(window.__noorBack&&window.__noorBack())return '1';var ids=['diagBox','adq','adhs','prsh','duac','fsw','intro'];for(var i=0;i<ids.length;i++){var e=document.getElementById(ids[i]);if(e){try{if(ids[i]==='adhs'&&typeof stopSound==='function')stopSound()}catch(x){}e.remove();return '1'}}var s=document.querySelector('.sec.on');if(s&&s.id!=='s-times'){var b=document.querySelector('nav button[data-t=times]');if(b){b.click();return '1'}}return '0'}catch(e){return '0'}})()", value -> {
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
        try {
            final WebView wv = getBridge() != null ? getBridge().getWebView() : null;
            if (wv != null) wv.postDelayed(() -> wv.evaluateJavascript("window.__fsChk&&__fsChk()", null), 300);
        } catch (Throwable t) { }
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
