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
import android.os.Bundle;
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


    private  int[] valueFSR=new int[32];
    //private  float[] YawPitchRoll=new float[3];
    //private  float[] AccelerationXYZ=new float[3];
    private double[] RawDataIMU=new double[6];

    private long startTime=System.currentTimeMillis();
    private long difference;
    private  int freq=0;
    private  int auxfreq=0;
    private  short FSRReady;
    private int Char1;
    private int Char2;
    private int Char3;
    private int Char4;
    private  boolean GyroReady;
    private  boolean AccelReady;
    //private MadgwickAHRS Madgwich;
    //private MahonyAHRS Mahony;
    private double[] IMUData;
    //private double[] RPY;
    private double ares=8.0/32768.0;
    private double gres=1000.0/32768.0;

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
        this.FSRReady=0;
        this.Char1=0;
        this.Char2=0;
        this.Char3=0;
        this.Char4=0;
        this.GyroReady=false;
        this.AccelReady=false;
        this.auxfreq=0;
        this.mBluetoothAdapter=BluetoothAdapter;
        this.freq=0;
        //Madgwich=new MadgwickAHRS(50f,0.75f);

        IMUData=new double[6];
        //RPY= new double[3];
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
            mBluetoothGatt.discoverServices();
        } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
            Log.i(TAG, "Disconnected from GATT server.");
            reconnect();
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
            BluetoothGattCharacteristic PressRawData0Characteristic = PresureService.getCharacteristic(UUID.fromString(Tools.PresRawData0UUID));
            BluetoothGattCharacteristic PressRawData1Characteristic = PresureService.getCharacteristic(UUID.fromString(Tools.PresRawData1UUID));
            BluetoothGattCharacteristic PressRawData2Characteristic = PresureService.getCharacteristic(UUID.fromString(Tools.PresRawData2UUID));
            //BluetoothGattCharacteristic MUX3Characteristic = PresureService.getCharacteristic(UUID.fromString(Tools.MUX3UUID));


            BluetoothGattCharacteristic IMURawDataCharacteristic = IMUService.getCharacteristic(UUID.fromString(Tools.IMURawDataUUID));

            // Set the CCCD to notify us for the two tach readings
            setCharacteristicNotification(IMURawDataCharacteristic, true);

            setCharacteristicNotification(PressRawData0Characteristic, true);
            setCharacteristicNotification(PressRawData1Characteristic, true);
            setCharacteristicNotification(PressRawData2Characteristic, true);
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

        difference = System.currentTimeMillis() - startTime;
        if (difference > 1000) {
            startTime = System.currentTimeMillis();
            freq = auxfreq;
            auxfreq = 0;
        }
        //auxfreq++;

        switch (uuid) {
            case Tools.PresRawData0UUID:

                parseFSRValue(characteristic.getValue(),0,24);
                Char1++;
                break;
            case Tools.PresRawData1UUID:
                parseFSRValue(characteristic.getValue(),8,26);
                Char2++;
                break;
            case Tools.PresRawData2UUID:
                parseFSRValue(characteristic.getValue(),16,28);
                Char3++;
                break;

            case Tools.IMURawDataUUID:

                byte[] RAWvalueIMU = characteristic.getValue();
                //YawPitchRoll = parseGyroValue(RAWvalueGyro);
                RawDataIMU = parseIMUValues(RAWvalueIMU);
                Char4++;
                break;

        }

        // Tell the activity that new data is available
        //if (Char1>0 && Char2>0 && Char3>0 && Char4>0){// & GyroReady& AccelReady) {
        //if (Char1>=1 && Char2>=1 && Char3>=1 && Char4>=1){
        if (Char1>=1){
            auxfreq++;
            Char1 = 0;
            Char2 = 0;
            Char3 = 0;
            Char4 = 0;
            IMUData=new double[]{
                    (RawDataIMU[3]*gres)*Math.PI/180.0f,
                    (RawDataIMU[4]*gres)*Math.PI/180.0f,
                    (RawDataIMU[5]*gres)*Math.PI/180.0f,
                    RawDataIMU[0]*ares,
                    RawDataIMU[1]*ares,
                    RawDataIMU[2]*ares
            };

//            Madgwich.update(
//                    (float)IMUData[0],
//                    (float)IMUData[1],
//                    (float)IMUData[2],
//                    (float)IMUData[3],
//                    (float)IMUData[4],
//                    (float)IMUData[5]
//            );




            broadcastUpdate(ACTION_DATA_AVAILABLE);
        }
//        else if(Char1>1 || Char2>1 || Char3>1 || Char4>1){//Se ha perdido algun paquete y descartamos todo.
//            Char1 = 0;
//            Char2 = 0;
//            Char3 = 0;
//            Char4 = 0;
//        }


    }

    /**
     * Sends a broadcast to the listener in the main activity.
     *
     * @param action The type of action that occurred.
     */
    private void broadcastUpdate(final String action) {
        final Intent intent = new Intent(action);
        Bundle data=new Bundle();
        data.putIntArray("valueFSR",valueFSR);
        data.putDoubleArray("IMUData",IMUData);
        intent.putExtra("BundleData",data);
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

//        /* Set CCCD value locally and then write to the device to register for notifications */
//        BluetoothGattDescriptor descriptor = characteristic.getDescriptor(
//                UUID.fromString(Tools.CCCD_UUID));
//        if (enabled) {
//            descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
//        } else {
//            descriptor.setValue(BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
//        }
//        // Put the descriptor into the write queue
//        BleQueue.add(descriptor);
//        // If there is only 1 item in the queue, then write it. If more than one, then the callback
//        // will handle it
//        if (BleQueue.size() == 1) {
//            mBluetoothGatt.writeDescriptor(descriptor);
//            Log.i(TAG, "Writing Notification");
//        }
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

//    private float[] parseAccelerationValue(byte[] RAWvalueAcceleration){
//        float[] result=new float[3];
//
//        ByteBuffer bb = ByteBuffer.allocate(2);
//        bb.order(ByteOrder.LITTLE_ENDIAN);
//
//        for(int i=0,j=0;i<RAWvalueAcceleration.length;i+=2,j+=1){
//            bb.put(RAWvalueAcceleration[i]);
//            bb.put(RAWvalueAcceleration[i+1]);
//            result[j]=bb.getShort(0)*8.0f/32768.0f;
//            bb.clear();
//        }
//
//        return result;
//    }
    private double[] parseIMUValues(byte[] RAWvalue){
        double[] result=new double[6];
        int indiceResto=30;
        ByteBuffer bb = ByteBuffer.allocate(2);
        bb.order(ByteOrder.LITTLE_ENDIAN);

        for(int i=0,j=0;i<RAWvalue.length-4;i+=2,j+=1){
            bb.put(RAWvalue[i]);
            bb.put(RAWvalue[i+1]);
            result[j]=bb.getShort(0);
            bb.clear();
        }
        for(int i=12,j=0;i<16;i+=2,j++){ //procesamos los ultimos 4 bytes que contienen info del mux4
            bb.put(RAWvalue[i]);
            bb.put(RAWvalue[i+1]);
            valueFSR[indiceResto+j]=bb.getShort(0);
            bb.clear();
        }
        return result;
    }

private void parseFSRValue(byte[] RAWvalueFSR,int offset,int indiceResto){

    ByteBuffer bb = ByteBuffer.allocate(2);
    bb.order(ByteOrder.BIG_ENDIAN);

    for(int i=0,j=0;i<RAWvalueFSR.length-4;i=i+2,j++){ //restamos 4 para tratar los ultimos 4 bytes luego
        bb.put(RAWvalueFSR[i]);
        bb.put(RAWvalueFSR[i+1]);
        valueFSR[offset+j]=bb.getShort(0);
        bb.clear();
    }

    for(int i=16,j=0;i<20;i+=2,j++){ //procesamos los ultimos 4 bytes que contienen info del mux4
        bb.put(RAWvalueFSR[i]);
        bb.put(RAWvalueFSR[i+1]);
        valueFSR[indiceResto+j]=bb.getShort(0);
        bb.clear();
    }

    }



    public void setmBluetoothGatt(BluetoothGatt mBluetoothGatt) {
        this.mBluetoothGatt = mBluetoothGatt;
    }
}
