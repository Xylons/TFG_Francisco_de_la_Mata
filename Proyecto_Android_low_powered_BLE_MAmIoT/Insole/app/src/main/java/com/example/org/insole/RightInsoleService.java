package com.example.org.insole;

import android.bluetooth.BluetoothDevice;
import android.content.Intent;
import android.os.IBinder;
import android.util.Log;

public class RightInsoleService extends InsoleService {

    protected static BleGattCallback mGattCallback;

    @Override// Si se quita la instancia de onStartCommand de aqui no se ejecutara la de InsoleService tampoco.
    public IBinder onBind(Intent intent) {
        return super.onBind(intent);
    }

    @Override // Si se quita la instancia de onStartCommand de aqui no se ejecutara la de InsoleService tampoco.
    public int onStartCommand (Intent intent, int flags, int startId){
        TYPE=Tools.RIGHT;
        return super.onStartCommand(intent,flags,startId);
    }

    protected  boolean configureCallback(BluetoothDevice device){
        // We want to directly connect to the device, so we are setting the autoConnect
        // parameter to false.
        mGattCallback=new BleGattCallback(
                getApplicationContext(),
                TYPE+Tools.ACTION_CONNECTED,
                TYPE+Tools.ACTION_DISCONNECTED,
                TYPE+Tools.ACTION_DATA_AVAILABLE,
                TAG,
                mBluetoothAdapter);

        mBluetoothGatt = device.connectGatt(this, false,mGattCallback);
        mGattCallback.setmBluetoothGatt(mBluetoothGatt);
        Log.i(TAG, "Trying to create a new connection.");
        mBluetoothGatt.requestConnectionPriority(1);//1 is higth 0 is balanced 2 is low power
        return true;
    }

    public static int getValueFSR(int position) {
        return mGattCallback.getValueFSR(position);
    }

    public static float getValueGyroscope(int position) {
        return mGattCallback.getYawPitchRoll(position);
    }

    public static float getValueAcceleration(int position) {
        return mGattCallback.getAccelerationXYZ((position));
    }
}
