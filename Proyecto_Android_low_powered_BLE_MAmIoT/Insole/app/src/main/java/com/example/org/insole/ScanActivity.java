package com.example.org.insole;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.os.Handler;
import android.os.ParcelUuid;
import android.support.v4.widget.SwipeRefreshLayout;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ScanActivity extends AppCompatActivity {
    private final static String TAG = ScanActivity.class.getSimpleName();
    private SharedPreferences preferences;
    private SharedPreferences.Editor preferencesEditor;
    // BLE related objects
    private  BluetoothAdapter mBluetoothAdapter;
    private  BluetoothLeScanner mLEScanner;
    private  boolean mScanning;
    private  Handler mHandler;
    private  final int REQUEST_ENABLE_BLE = 1;
    // Scan for 10 seconds.
    private  final long SCAN_TIMEOUT = 10000;
    // This allows rescanning when we swipe down from the top of the screen
    private  SwipeRefreshLayout mSwipeRefreshLayout;
    // This is the list view in the layout that holds the items
    private ListView    BleDeviceList;
    // These lists hold the BLE devices found during scanning and their names
    private List<BluetoothDevice> mBluetoothDevice;
    private List<String> mBleName;
    // The array adapter will be used to display the list of devices found during scanning
    private ArrayAdapter<String> mBleArrayAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_scan);
        // This is the list view in the layout that holds the items
        BleDeviceList =findViewById(R.id.BlelistItems);
        // This is used once scanning is started in a new thread
        mHandler = new Handler();
        preferences= getSharedPreferences(Tools.GENERAL_PREFERENCES,MODE_PRIVATE);
        preferencesEditor = preferences.edit();
        startBle();
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        // User chose not to enable Bluetooth so we will exit.
        if (requestCode == REQUEST_ENABLE_BLE) {
            switch (resultCode) {
                case Activity.RESULT_CANCELED:
                    finish();
                    break;
                case Activity.RESULT_OK:
                    scanLeDevice(true); // Start scanning automatically when we first start up
                    break;
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }
    @Override
    protected void onResume() {
        super.onResume();
        // Verify that bluetooth is enabled. If not, request permission to enable it.
        if (!mBluetoothAdapter.isEnabled()) {
            Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableBtIntent, REQUEST_ENABLE_BLE);
        }
        // Create arrays to hold BLE info found during scanning
        mBluetoothDevice = new ArrayList<>();
        mBleName = new ArrayList<>();
        // Create an array adapter and associate it with the list in the layout that displays the values
        mBleArrayAdapter = new ArrayAdapter<>(this, R.layout.ble_device_list, R.id.ble_name, mBleName);
        BleDeviceList.setAdapter(mBleArrayAdapter);
        // Setup the SwipeRefreshLayout and add a listener to refresh when the user
        // swipes down from the top of the screen.
        mSwipeRefreshLayout = findViewById(R.id.swipeRefreshId);

        // Setup a listener for swipe events
        mSwipeRefreshLayout.setOnRefreshListener(new SwipeRefreshLayout.OnRefreshListener() {
            @Override
            public void onRefresh() {
                if (!mScanning) {
                    mBluetoothDevice.clear(); // Remove all existing devices
                    mBleArrayAdapter.clear();
                    scanLeDevice(true); // Start a scan if not already running
                    Log.i(TAG, "Rescanning");
                }
                mSwipeRefreshLayout.setRefreshing(false);
            }
        });

        // Set up a listener for when the user clicks on one of the devices found.
        // We need to launch the control activity when that happens
        BleDeviceList.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                Log.i(TAG, "Item Selected");
                if(preferences.getString(Tools.LEFT+Tools.INSOLE_ADDRESS,null)==null) {
                    preferencesEditor.putString(Tools.LEFT + Tools.INSOLE_ADDRESS, mBluetoothDevice.get(position).getAddress());
                    preferencesEditor.commit();
                }else{
                    preferencesEditor.putString(Tools.RIGHT + Tools.INSOLE_ADDRESS, mBluetoothDevice.get(position).getAddress());
                    preferencesEditor.commit();
                    final Intent intent = new Intent(ScanActivity.this, DataViewActivity.class);
                    scanLeDevice(false); // Stop scanning
                    startActivity(intent);
                }
            }
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
        scanLeDevice(false);
        mBluetoothDevice.clear();
        mBleArrayAdapter.clear();
        mSwipeRefreshLayout.setRefreshing(false);
    }

    private void scanLeDevice(final boolean enable) {
        if (enable) { // enable set to start scanning
            // Stops scanning after a pre-defined scan period.
            mHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    if(mScanning) {
                        mScanning = false;
                        mLEScanner.stopScan(mScanCallback);
                        invalidateOptionsMenu();
                    }
                }
            }, SCAN_TIMEOUT);
            mScanning = true;
            ScanSettings settings;
            List<ScanFilter> filters;
            mLEScanner = mBluetoothAdapter.getBluetoothLeScanner();
            settings = new ScanSettings.Builder()
                    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                    .build();
            filters = new ArrayList<>();
            // We will scan just for the Insole UUID
            ParcelUuid PUuid = new ParcelUuid(UUID.fromString(Tools.IMUServiceUUID));
            ScanFilter filter = new ScanFilter.Builder().setServiceUuid(PUuid).build();
            filters.add(filter);
            mLEScanner.startScan(filters, settings, mScanCallback);
            //mLEScanner.startScan(mScanCallback);
        } else { // enable set to stop scanning
            if(mScanning) {
                mScanning = false;
                mLEScanner.stopScan(mScanCallback);
            }
        }
        invalidateOptionsMenu();
    }
    /**
     * This is the callback for BLE scanning for LOLLIPOP and later
     * It is called each time a devive is found so we need to add it to the list
     */
    private final ScanCallback mScanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            if(!mBluetoothDevice.contains(result.getDevice())) { // only add new devices
                mBluetoothDevice.add(result.getDevice());
                mBleName.add(result.getDevice().getName());
                mBleArrayAdapter.notifyDataSetChanged(); // Update the list on the screen
            }
        }
    };

    private void startBle(){
        // Initialize the Bluetooth adapter using the bluetoothManager
        final BluetoothManager bluetoothManager =
                (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
        mBluetoothAdapter = bluetoothManager.getAdapter();

        if (mBluetoothAdapter == null) {
            Toast.makeText(this, R.string.no_ble, Toast.LENGTH_SHORT).show();
            finish();
            return;
        }
    }


}
