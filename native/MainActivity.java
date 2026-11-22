package com.noor.islamic;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AdhanAlarmPlugin.class);
        super.onCreate(savedInstanceState);
        remember(getIntent());
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
