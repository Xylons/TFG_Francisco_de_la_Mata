package com.example.org.insole;

import android.Manifest;
import android.annotation.TargetApi;
import android.app.ActivityManager;
import android.app.AlertDialog;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.MenuItem;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import java.util.Arrays;
import java.util.Random;

@TargetApi(Build.VERSION_CODES.M) // This is needed so that we can use Marshmallow API calls
public class DataViewActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {
    private final static String TAG = DataViewActivity.class.getSimpleName();
    //This is required for Android 6.0 (Marshmallow)
    private static final int PERMISSION_REQUEST_COARSE_LOCATION = 1;
    private SharedPreferences preferences;
    private SharedPreferences.Editor preferencesEditor;

    private Intent LeftInsoleServiceIntent;
    private Intent RightInsoleServiceIntent;

    private WebView webb;
    private Random rand = new Random();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.data_view);
        obtainBluetoothPermission();
        preferences= getSharedPreferences(Tools.GENERAL_PREFERENCES,MODE_PRIVATE);
        preferencesEditor = preferences.edit();
        NavigationView navigationView = findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);
        webb= findViewById(R.id.THREEJSWindow);
        WebSettings settings = webb.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccessFromFileURLs(true);
        webb.setWebViewClient(new WebViewClient());
    }

    @Override
    protected void onResume() {
        super.onResume();
        //Si los servicios no estan encendidos.
        if(!isServiceRunning("com.example.org.insole.RightInsoleService") &&
           !isServiceRunning("com.example.org.insole.LeftInsoleService") ) {
            //Si no se tiene la dirección fisica de las plantillas.
            if (preferences.getString(Tools.LEFT + Tools.INSOLE_ADDRESS, null) == null ||
                preferences.getString(Tools.RIGHT + Tools.INSOLE_ADDRESS, null) == null)
            {
                final Intent intent = new Intent(DataViewActivity.this, ScanActivity.class);
                startActivity(intent);
            } else {// LLegados aqui los servicios no estan corriendo pero si tenemos las direcciónes fisicas de estos
                LeftInsoleServiceIntent = new Intent(this, LeftInsoleService.class);
                startService(LeftInsoleServiceIntent);
                RightInsoleServiceIntent = new Intent(this, RightInsoleService.class);
                startService(RightInsoleServiceIntent) ;

            }
        }

        webb.loadUrl("file:///android_asset/index.html");
        Log.i(TAG, "onResume");
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
    }

    @Override
    protected void onPause() {
        super.onPause();
        webb.loadUrl("about:blank");
        unregisterReceiver(mLInsoleUpdateReceiver);
        unregisterReceiver(mRInsoleUpdateReceiver);
        Log.i(TAG, "onPause");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "onDestroy");
    }
    //    //This method required for Android 6.0 (Marshmallow) permissions
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String permissions[], @NonNull int[] grantResults) {
        switch (requestCode) {
            case PERMISSION_REQUEST_COARSE_LOCATION: {
                if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Log.i("Permission for 6.0:", "Coarse location permission granted");
                } else {
                    final AlertDialog.Builder builder = new AlertDialog.Builder(this);
                    builder.setTitle("Error");
                    builder.setMessage("Since location access has not been granted, scanning will not work.");
                    builder.setPositiveButton(android.R.string.ok, null);
                    builder.setOnDismissListener(new DialogInterface.OnDismissListener() {
                        @Override
                        public void onDismiss(DialogInterface dialog) {
                        }
                    });
                    builder.show();
                }
            }
        }
    } //End of section for Android 6.0 (Marshmallow)

    @SuppressWarnings("StatementWithEmptyBody")
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

        DrawerLayout drawer = findViewById(R.id.drawer_layout);
        drawer.closeDrawer(GravityCompat.START);
        return true;
    }

    private boolean isServiceRunning(String serviceClassName) {
        ActivityManager manager = (ActivityManager) getSystemService(ACTIVITY_SERVICE);
        for (ActivityManager.RunningServiceInfo runningServiceInfo  : manager.getRunningServices(Integer.MAX_VALUE)){
            if(serviceClassName.equals(runningServiceInfo.service.getClassName())) {
                return true;
            }
        }
        return false;
    }


    private void obtainBluetoothPermission(){
        // Check to see if the device supports BLE. If not, just exit right away.
        if (!getPackageManager().hasSystemFeature(PackageManager.FEATURE_BLUETOOTH_LE)) {
            Toast.makeText(this, R.string.no_ble, Toast.LENGTH_SHORT).show();
            finish();
        }
        //This section required for Android 6.0 (Marshmallow) permissions
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // Android M Permission check 
            if (this.checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
                final AlertDialog.Builder builder = new AlertDialog.Builder(this);
                builder.setTitle("This app needs location access ");
                builder.setMessage("Please grant location access so this app can detect devices.");
                builder.setPositiveButton(android.R.string.ok, null);
                builder.setOnDismissListener(new DialogInterface.OnDismissListener() {
                    public void onDismiss(DialogInterface dialog) {
                        requestPermissions(new String[]{Manifest.permission.ACCESS_COARSE_LOCATION}, PERMISSION_REQUEST_COARSE_LOCATION);
                    }
                });
                builder.show();
            }
        } //End of section for Android 6.0 (Marshmallow)

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
                    int[] temporalFSRsValue={
                            LeftInsoleService.getValueFSR(0),
                            LeftInsoleService.getValueFSR(10),
                            LeftInsoleService.getValueFSR(11),
                            LeftInsoleService.getValueFSR(9),
                            LeftInsoleService.getValueFSR(8),
                            LeftInsoleService.getValueFSR(6),
                            LeftInsoleService.getValueFSR(2),
                            LeftInsoleService.getValueFSR(7),
                            LeftInsoleService.getValueFSR(5),
                            LeftInsoleService.getValueFSR(1),
                            LeftInsoleService.getValueFSR(3),
                            LeftInsoleService.getValueFSR(4)};

                    String JSCode="javascript:updateColorLeft("+ Arrays.toString(temporalFSRsValue)+")";
                    webb.evaluateJavascript(JSCode,null);
                    JSCode="javascript:pitchRollLeft("+
                            LeftInsoleService.getValueGyroscope(2)+","+
                            LeftInsoleService.getValueGyroscope(1)
                            +")";
                    webb.evaluateJavascript(JSCode,null);
                    JSCode="javascript:LeftAcceleration(["+
                            LeftInsoleService.getValueAcceleration(1)+","+
                            LeftInsoleService.getValueAcceleration(2)
                            +"])";
                    webb.evaluateJavascript(JSCode,null);


                    break;
            }
        }
    };
    private final BroadcastReceiver mRInsoleUpdateReceiver = new BroadcastReceiver() {
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
                    int[] temporalFSRsValue={
//                            RightInsoleService.getValueFSR(0),
//                            RightInsoleService.getValueFSR(10),
//                            RightInsoleService.getValueFSR(11),
//                            RightInsoleService.getValueFSR(9),
//                            RightInsoleService.getValueFSR(8),
//                            RightInsoleService.getValueFSR(6),
//                            RightInsoleService.getValueFSR(2),
//                            RightInsoleService.getValueFSR(7),
//                            RightInsoleService.getValueFSR(5),
//                            RightInsoleService.getValueFSR(1),
//                            RightInsoleService.getValueFSR(3),
//                            RightInsoleService.getValueFSR(4)};
                            RightInsoleService.getValueFSR(0),
                            RightInsoleService.getValueFSR(1),
                            RightInsoleService.getValueFSR(2),
                            RightInsoleService.getValueFSR(3),
                            RightInsoleService.getValueFSR(4),
                            RightInsoleService.getValueFSR(5),
                            RightInsoleService.getValueFSR(6),
                            RightInsoleService.getValueFSR(7),
                            RightInsoleService.getValueFSR(8),
                            RightInsoleService.getValueFSR(9),
                            RightInsoleService.getValueFSR(10),
                            RightInsoleService.getValueFSR(11)};
                    String JSCode="javascript:updateColorRight("+ Arrays.toString(temporalFSRsValue)+")";
                    webb.evaluateJavascript(JSCode,null);
                    JSCode="javascript:pitchRollRight("+
                            RightInsoleService.getValueGyroscope(1)+","+
                            RightInsoleService.getValueGyroscope(2)
                            +")";
                    webb.evaluateJavascript(JSCode,null);
                    JSCode="javascript:RightAcceleration(["+
                            RightInsoleService.getValueAcceleration(1)+","+
                            RightInsoleService.getValueAcceleration(2)
                            +"])";
                    webb.evaluateJavascript(JSCode,null);
                    break;
            }
        }
    };


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


}



