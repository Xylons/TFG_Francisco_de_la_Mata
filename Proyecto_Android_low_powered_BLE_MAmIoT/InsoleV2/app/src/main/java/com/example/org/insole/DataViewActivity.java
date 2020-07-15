package com.example.org.insole;

import android.annotation.TargetApi;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Bundle;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.MenuItem;

@TargetApi(Build.VERSION_CODES.M) // This is needed so that we can use Marshmallow API calls
public abstract class DataViewActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {
    private final static String TAG = DataViewActivity.class.getSimpleName();
    protected SharedPreferences preferences;
    protected SharedPreferences.Editor preferencesEditor;
    protected NavigationView navigationView;
    protected MahonyAHRS Mahony;
    protected double[] YRP;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        preferences= getSharedPreferences(Tools.GENERAL_PREFERENCES,MODE_PRIVATE);
        preferencesEditor = preferences.edit();
        Mahony=new MahonyAHRS();
        YRP= new double[3];
    }

    @Override
    protected void onResume() {
        super.onResume();
        IntentFilter leftInsoleIntentFilter=makeInsoleIntentFilter(
                Tools.LEFT+Tools.ACTION_CONNECTED,
                Tools.LEFT+Tools.ACTION_DISCONNECTED,
                Tools.LEFT+Tools.ACTION_DATA_AVAILABLE
        );
        IntentFilter rightInsoleIntentFilter=makeInsoleIntentFilter(
                Tools.RIGHT+Tools.ACTION_CONNECTED,
                Tools.RIGHT+Tools.ACTION_DISCONNECTED,
                Tools.RIGHT+Tools.ACTION_DATA_AVAILABLE
        );
        registerReceiver(mLInsoleUpdateReceiver,leftInsoleIntentFilter);
        registerReceiver(mRInsoleUpdateReceiver,rightInsoleIntentFilter);
        Log.i(TAG, "onResume");
    }

    @Override
    protected void onPause() {
        super.onPause();
        unregisterReceiver(mLInsoleUpdateReceiver);
        unregisterReceiver(mRInsoleUpdateReceiver);
        Log.i(TAG, "onPause");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "onDestroy");
    }

    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        // Handle navigation view item clicks here.
        int id = item.getItemId();
        if (id == R.id.nav_camera) {
            stopService(new Intent(DataViewActivity.this,LeftInsoleService.class));
            stopService(new Intent(DataViewActivity.this,RightInsoleService.class));

            preferencesEditor.putString(Tools.LEFT+Tools.INSOLE_ADDRESS,null);
            preferencesEditor.putString(Tools.RIGHT+Tools.INSOLE_ADDRESS,null);
            preferencesEditor.commit();
            final Intent intent = new Intent(DataViewActivity.this, ScanActivity.class);
            startActivity(intent);
        }
        if (id == R.id.change_view) {//Change between the diferent views in the aplication.
            String modality=preferences.getString(Tools.VIEW_MODALITY, null);
            if(modality.equals(Tools.GRAPHIC)){
                preferencesEditor.putString(Tools.VIEW_MODALITY,Tools.RAW);
                preferencesEditor.commit();
                final Intent intent = new Intent(this, DataViewActivityRAW.class);
                finish();//finish the actual view.
                startActivity(intent);

            }else{
                preferencesEditor.putString(Tools.VIEW_MODALITY,Tools.GRAPHIC);
                preferencesEditor.commit();
                final Intent intent = new Intent(this, DataViewActivityGraphic.class);
                finish();
                startActivity(intent);
            }
        }
        DrawerLayout drawer = findViewById(R.id.data_view);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }


    private IntentFilter makeInsoleIntentFilter(
            String ACTION_CONNECTED,
            String ACTION_DISCONNECTED,
            String ACTION_DATA_AVAILABLE) {
        final IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(ACTION_CONNECTED);
        intentFilter.addAction(ACTION_DISCONNECTED);
        intentFilter.addAction(ACTION_DATA_AVAILABLE);
        return intentFilter;
    }
    private final BroadcastReceiver mLInsoleUpdateReceiver = new BroadcastReceiver() {

        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            switch (action) {
                case Tools.LEFT+Tools.ACTION_CONNECTED:
                    // No need to do anything here. Service discovery is started by the service.
                    break;
                case Tools.LEFT+Tools.ACTION_DISCONNECTED:
                    //For future implementation
                    break;
                case Tools.LEFT+Tools.ACTION_DATA_AVAILABLE:
                    data_availableL( intent);
                    break;
            }
        }
    };

    private  BroadcastReceiver mRInsoleUpdateReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            switch (action) {
                case Tools.RIGHT+Tools.ACTION_CONNECTED:
                    // No need to do anything here. Service discovery is started by the service.
                    break;
                case Tools.RIGHT+Tools.ACTION_DISCONNECTED:
                    //For future implementation
                    break;
                case Tools.RIGHT+Tools.ACTION_DATA_AVAILABLE:
                    data_availableR( intent);
                    break;
            }
        }
    };
protected abstract void data_availableR(Intent intent);
protected abstract void data_availableL(Intent intent);
}



