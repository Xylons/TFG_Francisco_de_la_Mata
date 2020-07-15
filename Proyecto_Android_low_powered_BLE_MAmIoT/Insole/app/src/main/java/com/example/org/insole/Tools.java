package com.example.org.insole;

public class Tools {
    // ---------------------------BROADCAST ACTION------------------------------
    public static final String ACTION_CONNECTED=       "ACTION_GATT_CONNECTED";
    public static final String ACTION_DISCONNECTED=    "ACTION_GATT_DISCONNECTED";
    public static final String ACTION_DATA_AVAILABLE=  "ACTION_DATA_AVAILABLE";
    //---------------------------------------------------------------------------

    public static final String INSOLE_ADDRESS ="MAC_ADDRESS_INSOLE";
    public static final String LEFT="LEFT_";
    public static final String RIGHT="RIGHT_";
    public static final String TYPE="TYPE";
    public static final String GENERAL_PREFERENCES ="GENERAL_PREFERENCES";

    // UUID for the custom motor characteristics
    public static final String basePresureUUID =       "2FB7E922-9C55-4445-9FCD-C77842FF236";
    public static final String PresureServiceUUID =    basePresureUUID  + "0";
    public static final String FSRRawUUID =          basePresureUUID    + "1";

    public static final String baseIMUUUID =           "9C056500-3B96-42E2-A104-6746503D4BA";
    public static final String IMUServiceUUID =        baseIMUUUID      + "0";
    public static final String GyroscopeUUID =       baseIMUUUID        + "1";
    public static final String AccelerometerUUID =   baseIMUUUID        + "2";
    public static final String CCCD_UUID =          "00002901-0000-1000-8000-00805f9b34fb";




}
