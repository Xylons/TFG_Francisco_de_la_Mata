package com.example.org.insole;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.util.Log;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.LinkedList;
import java.util.Queue;
import java.util.UUID;

public class BleGattCallback extends BluetoothGattCallback {
    private  final Queue<Object> BleQueue = new LinkedList<>();
    private  BluetoothAdapter mBluetoothAdapter;
    private  BluetoothGatt mBluetoothGatt;
    private  Context context;
    private  String ACTION_CONNECTED;
    private  String ACTION_DISCONNECTED;
    private  String ACTION_DATA_AVAILABLE;

    private  String TAG;
    private Handler mHandler;


    private  int[] valueFSR=new int[12];
    private  float[] YawPitchRoll=new float[3];
    private  float[] AccelerationXYZ=new float[3];

//    private long startTime=System.currentTimeMillis();
//    private long difference;
//    private  int freq=0;
//    private  int auxfreq=0;
    private  boolean FSRReady;
    private  boolean GyroReady;
    private  boolean AccelReady;

    public BleGattCallback(
            Context context,
            String ACTION_CONNECTED,
            String ACTION_DISCONNECTED,
            String ACTION_DATA_AVAILABLE,
            String TAG,
            BluetoothAdapter BluetoothAdapter)
    {

        this.context = context;
        this.ACTION_CONNECTED = ACTION_CONNECTED;
        this.ACTION_DISCONNECTED = ACTION_DISCONNECTED;
        this.ACTION_DATA_AVAILABLE = ACTION_DATA_AVAILABLE;
        this.TAG=TAG+"BleGattCallback";
        this.mHandler = new Handler();
        //this.FSRReady=false;
        //this.GyroReady=false;
        //this.AccelReady=false;
        //this.auxfreq=0;
        this.mBluetoothAdapter=BluetoothAdapter;
        //this.freq=0;

    }


    /**
     * This is called on a connection state change (either connection or disconnection)
     *
     * @param gatt     The GATT database object
     * @param status   Status of the event
     * @param newState New state (connected or disconnected)
     */
    @Override
    public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {

        if (newState == BluetoothProfile.STATE_CONNECTED) {
            broadcastUpdate(ACTION_CONNECTED);
            Log.i(TAG, "Connected to GATT server.");
            // Attempts to discover services after successful connection.
            Log.i(TAG, "Attempting to start service discovery:" + mBluetoothGatt.discoverServices());

        } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
            Log.i(TAG, "Disconnected from GATT server.");
            reconnect();
            broadcastUpdate(ACTION_DISCONNECTED);
        }
    }

    /**
     * This is called when service discovery has completed.
     * It broadcasts an update to the main activity.
     *
     * @param gatt   The GATT database object
     * @param status Status of whether the discovery was successful.
     */
    @Override
    public void onServicesDiscovered(BluetoothGatt gatt, int status) {
        if (status == BluetoothGatt.GATT_SUCCESS) {

            // Get the characteristics for the motor service
            BluetoothGattService IMUService = mBluetoothGatt.getService(UUID.fromString(Tools.IMUServiceUUID));
            BluetoothGattService PresureService = mBluetoothGatt.getService(UUID.fromString(Tools.PresureServiceUUID));

            if (IMUService == null || PresureService == null)
                return; // return if the motor service is not supported
            //if (IMUService == null) return; // return if the motor service is not supported
            BluetoothGattCharacteristic mFSRRawCharacteristic = PresureService.getCharacteristic(UUID.fromString(Tools.FSRRawUUID));
            BluetoothGattCharacteristic mGyroscopeCharacteristic = IMUService.getCharacteristic(UUID.fromString(Tools.GyroscopeUUID));
            BluetoothGattCharacteristic mAccelerometerCharacteristic = IMUService.getCharacteristic(UUID.fromString(Tools.AccelerometerUUID));

            // Set the CCCD to notify us for the two tach readings
            setCharacteristicNotification(mFSRRawCharacteristic, true);
            setCharacteristicNotification(mGyroscopeCharacteristic, true);
            setCharacteristicNotification(mAccelerometerCharacteristic, true);
        } else {
            Log.w(TAG, "onServicesDiscovered received: " + status);
        }
    }

    /**
     * This handles the BLE Queue. If the queue is not empty, it starts the next event.
     */
    private void handleBleQueue() {
        if (BleQueue.size() > 0) {
            // Determine which type of event is next and fire it off
            if (BleQueue.element() instanceof BluetoothGattDescriptor) {
                mBluetoothGatt.writeDescriptor((BluetoothGattDescriptor) BleQueue.element());
            } else if (BleQueue.element() instanceof BluetoothGattCharacteristic) {
                mBluetoothGatt.writeCharacteristic((BluetoothGattCharacteristic) BleQueue.element());
            }
        }
    }

    /**
     * This is called when a characteristic write has completed. Is uses a queue to determine if
     * additional BLE actions are still pending and launches the next one if there are.
     *
     * @param gatt           The GATT database object
     * @param characteristic The characteristic that was written.
     * @param status         Status of whether the write was successful.
     */
    @Override
    public void onCharacteristicWrite(BluetoothGatt gatt,
                                      BluetoothGattCharacteristic characteristic,
                                      int status) {
        // Pop the item that was written from the queue
        BleQueue.remove();
        // See if there are more items in the BLE queues
        handleBleQueue();
    }

    /**
     * This is called when a CCCD write has completed. It uses a queue to determine if
     * additional BLE actions are still pending and launches the next one if there are.
     *
     * @param gatt       The GATT database object
     * @param descriptor The CCCD that was written.
     * @param status     Status of whether the write was successful.
     */
    @Override
    public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor,
                                  int status) {
        // Pop the item that was written from the queue
        BleQueue.remove();
        // See if there are more items in the BLE queues
        handleBleQueue();
    }

    /**
     * This is called when a characteristic with notify set changes.
     * It broadcasts an update to the main activity with the changed data.
     *
     * @param gatt           The GATT database object
     * @param characteristic The characteristic that was changed
     */
    @Override
    public  void onCharacteristicChanged(BluetoothGatt gatt,
                                                     BluetoothGattCharacteristic characteristic) {
        String uuid = characteristic.getUuid().toString().toUpperCase();

//        difference = System.currentTimeMillis() - startTime;
//        if (difference > 1000) {
//            startTime = System.currentTimeMillis();
//            freq = auxfreq;
//            auxfreq = 0;
//        }
        //auxfreq++;
        switch (uuid) {
            case Tools.FSRRawUUID:

                byte[] RAWvalueFSR = characteristic.getValue();
                valueFSR = parseFSRValue(RAWvalueFSR, (int) Math.floor(RAWvalueFSR.length * 8 / 10));
                FSRReady = true;
                break;
            case Tools.GyroscopeUUID:

                byte[] RAWvalueGyro = characteristic.getValue();
                YawPitchRoll = parseGyroValue(RAWvalueGyro);
                GyroReady = true;
                break;
            case Tools.AccelerometerUUID:

                byte[] RAWvalueAccel = characteristic.getValue();
                AccelerationXYZ = parseAccelerationValue(RAWvalueAccel);
                AccelReady = true;
                break;
        }
        // Tell the activity that new data is available
        if (FSRReady & GyroReady & AccelReady) {
//            auxfreq++;
            FSRReady = false;
            GyroReady = false;
            AccelReady = false;
            broadcastUpdate(ACTION_DATA_AVAILABLE);
        }
    }

    /**
     * Sends a broadcast to the listener in the main activity.
     *
     * @param action The type of action that occurred.
     */
    private void broadcastUpdate(final String action) {
        final Intent intent = new Intent(action);
        context.sendBroadcast(intent);
    }


    /**
     * Enables or disables notification on a give characteristic.
     *
     * @param characteristic Characteristic to act on.
     * @param enabled        If true, enable notification.  False otherwise.
     */
    private void setCharacteristicNotification(BluetoothGattCharacteristic characteristic,
                                               boolean enabled) {
        if (mBluetoothAdapter == null || mBluetoothGatt == null) {
            Log.i(TAG, "BluetoothAdapter not initialized");
            return;
        }

        /* Enable or disable the callback notification on the phone */
        mBluetoothGatt.setCharacteristicNotification(characteristic, enabled);

        /* Set CCCD value locally and then write to the device to register for notifications */
        BluetoothGattDescriptor descriptor = characteristic.getDescriptor(
                UUID.fromString(Tools.CCCD_UUID));
        if (enabled) {
            descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
        } else {
            descriptor.setValue(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
        }
        // Put the descriptor into the write queue
        BleQueue.add(descriptor);
        // If there is only 1 item in the queue, then write it. If more than one, then the callback
        // will handle it
        if (BleQueue.size() == 1) {
            mBluetoothGatt.writeDescriptor(descriptor);
            Log.i(TAG, "Writing Notification");
        }
    }
    private void reconnect(){
        if(!mBluetoothGatt.connect()) {
            mHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    reconnect();
                }
            }, 500);
        }
    }

    private float[] parseAccelerationValue(byte[] RAWvalueAcceleration){
        float[] result=new float[3];

        ByteBuffer bb = ByteBuffer.allocate(2);
        bb.order(ByteOrder.LITTLE_ENDIAN);

        for(int i=0,j=0;i<RAWvalueAcceleration.length;i+=2,j+=1){
            bb.put(RAWvalueAcceleration[i]);
            bb.put(RAWvalueAcceleration[i+1]);
            result[j]=bb.getShort(0)*8.0f/32768.0f;
            bb.clear();
        }

        return result;
    }
    private float[] parseGyroValue(byte[] RAWvalueGyro){
        float[] result=new float[RAWvalueGyro.length/4];


        ByteBuffer bb = ByteBuffer.allocate(4);
        bb.order(ByteOrder.LITTLE_ENDIAN);

        for(int i=0,j=0;i<RAWvalueGyro.length;i+=4,j+=1){
            bb.put(RAWvalueGyro[i]);
            bb.put(RAWvalueGyro[i+1]);
            bb.put(RAWvalueGyro[i+2]);
            bb.put(RAWvalueGyro[i+3]);
            result[j] = bb.getFloat(0);

            bb.clear();
        }

        return result;
    }

    private int[] parseFSRValue(byte[] RAWvalueFSR,int FSRNumber){
        int[] result=new int[FSRNumber];

        ByteBuffer bb = ByteBuffer.allocate(2);
        bb.order(ByteOrder.BIG_ENDIAN);

/* FSR\Bytes   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14
 *
 *  0          | 8 | 2 |   |   |   |   |   |   |   |   |   |   |   |   |   |
 *  1          |   | 6 | 4 |   |   |   |   |   |   |   |   |   |   |   |   |
 *  2          |   |   | 4 | 6 |   |   |   |   |   |   |   |   |   |   |   |
 *  3          |   |   |   | 2 | 8 |   |   |   |   |   |   |   |   |   |   |
 *  4          |   |   |   |   |   | 8 | 2 |   |   |   |   |   |   |   |   |
 *  5          |   |   |   |   |   |   | 6 | 4 |   |   |   |   |   |   |   |
 *  6          |   |   |   |   |   |   |   | 4 | 6 |   |   |   |   |   |   |
 *  7          |   |   |   |   |   |   |   |   | 2 | 8 |   |   |   |   |   |
 *  8          |   |   |   |   |   |   |   |   |   |   | 8 | 2 |   |   |   |
 *  9          |   |   |   |   |   |   |   |   |   |   |   | 6 | 4 |   |   |
 *  10         |   |   |   |   |   |   |   |   |   |   |   |   | 4 | 6 |   |
 *  11         |   |   |   |   |   |   |   |   |   |   |   |   |   | 2 | 8 |
 */
        bb.put(RAWvalueFSR[0]);
        bb.put(RAWvalueFSR[1]);
        result[0]=(bb.getShort(0)>>6)& 0b01111111111;
        bb.clear();
        bb.put(RAWvalueFSR[1]);
        bb.put(RAWvalueFSR[2]);
        result[1]=((bb.getShort(0)<<2)>>6)& 0b01111111111;
        bb.clear();
        bb.put(RAWvalueFSR[2]);
        bb.put(RAWvalueFSR[3]);
        result[2]=((bb.getShort(0)<<4)>>6)& 0b01111111111;
        bb.clear();
        bb.put(RAWvalueFSR[3]);
        bb.put(RAWvalueFSR[4]);
        result[3]=((bb.getShort(0)<<6)>>6)& 0b01111111111;
        bb.clear();

        bb.put(RAWvalueFSR[5]);
        bb.put(RAWvalueFSR[6]);
        result[4]=(bb.getShort(0)>>6)& 0b01111111111;
        bb.clear();
        bb.put(RAWvalueFSR[6]);
        bb.put(RAWvalueFSR[7]);
        result[5]=((bb.getShort(0)<<2)>>6)& 0b01111111111;
        bb.clear();
        bb.put(RAWvalueFSR[7]);
        bb.put(RAWvalueFSR[8]);
        result[6]=((bb.getShort(0)<<4)>>6)& 0b01111111111;
        bb.clear();
        bb.put(RAWvalueFSR[8]);
        bb.put(RAWvalueFSR[9]);
        result[7]=((bb.getShort(0)<<6)>>6)& 0b01111111111;
        bb.clear();

        bb.put(RAWvalueFSR[10]);
        bb.put(RAWvalueFSR[11]);
        result[8]=(bb.getShort(0)>>6)& 0b01111111111;
        bb.clear();
        bb.put(RAWvalueFSR[11]);
        bb.put(RAWvalueFSR[12]);
        result[9]=((bb.getShort(0)<<2)>>6)& 0b01111111111;
        bb.clear();
        bb.put(RAWvalueFSR[12]);
        bb.put(RAWvalueFSR[13]);
        result[10]=((bb.getShort(0)<<4)>>6)& 0b01111111111;
        bb.clear();
        bb.put(RAWvalueFSR[13]);
        bb.put(RAWvalueFSR[14]);
        result[11]=((bb.getShort(0)<<6)>>6)& 0b01111111111;
        bb.clear();
        return result;
    }

    public  int getValueFSR(int position) {
        return valueFSR[position];
    }

    public float getYawPitchRoll(int position) {
        return YawPitchRoll[position];
    }

    public float getAccelerationXYZ(int position) {
        return AccelerationXYZ[position];
    }

//    public int getFreq() {
//        return freq;
//    }
    public void setmBluetoothGatt(BluetoothGatt mBluetoothGatt) {
        this.mBluetoothGatt = mBluetoothGatt;
    }
}
