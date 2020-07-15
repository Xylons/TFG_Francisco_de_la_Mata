package com.example.org.insole;

import android.app.Service;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.IBinder;
import android.util.Log;

public abstract class InsoleService extends Service {
    protected final static String TAG = InsoleService.class.getSimpleName();
    protected SharedPreferences preferences;
    protected  BluetoothManager mBluetoothManager;
    protected  BluetoothAdapter mBluetoothAdapter;
    protected  String InsoleAddress;
    protected  BluetoothGatt mBluetoothGatt;

    protected String TYPE;

    public InsoleService() { }

    @Override
    public IBinder onBind(Intent intent) {
        // TODO: Return the communication channel to the service.
        throw new UnsupportedOperationException("Not yet implemented");
    }

    @Override
    public int onStartCommand (Intent intent, int flags, int startId){
        Log.i(TAG, "Service onStartCommand");
            preferences = getApplicationContext().getSharedPreferences(Tools.GENERAL_PREFERENCES, MODE_PRIVATE);

        InsoleAddress=preferences.getString(TYPE+Tools.INSOLE_ADDRESS,null);
        connect();
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.i(TAG, "Service onDestroy");
        disconnect();
        close();

    }

    /**
     * Initialize a reference to the local Bluetooth adapter.
     *
     * @return Return true if the initialization is successful.
     */
    public boolean connect() {
        // For API level 18 and above, get a reference to BluetoothAdapter through
        // BluetoothManager.
        if (mBluetoothManager == null) {
            mBluetoothManager = (BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE);
            if (mBluetoothManager == null) {
                Log.i(TAG, "Unable to initialize BluetoothManager.");
                return false;
            }
        }

        mBluetoothAdapter = mBluetoothManager.getAdapter();
        Log.i(TAG, mBluetoothAdapter.toString());
        if (mBluetoothAdapter == null|| InsoleAddress == null) {
            Log.i(TAG, "BluetoothAdapter not initialized or unspecified address.");
            return false;
        }


        final BluetoothDevice device = mBluetoothAdapter.getRemoteDevice(InsoleAddress);
        if (device == null) {
            Log.w(TAG, "Device not found.  Unable to connect.");
            return false;
        }

        return configureCallback(device);

    }

    protected abstract boolean configureCallback(BluetoothDevice device);



    /**
     * Disconnects an existing connection or cancel a pending connection. The disconnection result
     * is reported asynchronously through the
     * {@code BluetoothGattCallback#onConnectionStateChange(android.bluetooth.BluetoothGatt, int, int)}
     * callback.
     */
    public void disconnect() {
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            Log.w(TAG, "BluetoothAdapter not initialized");
            return;
        }
        mBluetoothGatt.disconnect();
    }

    /**
     * After using a given BLE device, the app must call this method to ensure resources are
     * released properly.
     */
    public void close() {
        if (mBluetoothGatt == null) {
            return;
        }
        mBluetoothGatt.close();
        mBluetoothGatt = null;
    }

}
