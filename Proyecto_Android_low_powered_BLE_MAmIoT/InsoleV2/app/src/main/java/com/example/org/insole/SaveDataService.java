package com.example.org.insole;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Binder;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.support.v4.app.NotificationCompat;
import android.support.v4.content.ContextCompat;
import android.util.Base64;
import android.util.Log;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URL;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

public class SaveDataService extends Service {

    private static final int TIME_BEFORE_SENDING_DATA = 60000; //30min

    private NotificationManager mNM;
    private Timer uploadTimerTask;

    private List<int[]> leftSensors = new ArrayList<>();
    private List<int[]> rightSensors = new ArrayList<>();


    // Unique Identification Number for the Notification.
    // We use it on Notification start, and to cancel it.
    private int NOTIFICATION = R.string.data_service_started;

    public SaveDataService() {
        super();
    }

    /**
     * Class for clients to access.  Because we know this service always
     * runs in the same process as its clients, we don't need to deal with
     * IPC.
     */
    public class LocalBinder extends Binder {
        SaveDataService getService() {
            return SaveDataService.this;
        }
    }





    public void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    "101",
                    "InsoleService",
                    NotificationManager.IMPORTANCE_DEFAULT
            );

            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }

    @Override
    public void onCreate() {

        //Notificacion de la barra
        createNotificationChannel();
        Intent notificationIntent = new Intent(this, ScanActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, 0);

        // A Foreground service must provide a notification for the status bar.
        Notification notification = new NotificationCompat.Builder(this, "101")
                .setContentTitle("InsoleService")
                .setContentText("The Insole Service is currently working")
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentIntent(pendingIntent)
                .build();
        startForeground(101, notification);


        mNM = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);

        // Display a notification about us starting.  We put an icon in the status bar.
        showNotification();

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
        uploadTimerTask = new Timer("uploadTimerTask");

        uploadTimerTask.scheduleAtFixedRate(new UploadTimerTask(), 0, TIME_BEFORE_SENDING_DATA);
    }

    private BroadcastReceiver mRInsoleUpdateReceiver = new BroadcastReceiver() {
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

    protected  void data_availableL(Intent intent){
        try {
            Bundle data=intent.getBundleExtra("BundleData");
            int[] valueFSR= data.getIntArray("valueFSR");
            double[] IMUData=data.getDoubleArray("IMUData");

            //outputStreamLeft.write(fileContents.getBytes());

            leftSensors.add(valueFSR);


        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    protected  void data_availableR(Intent intent){

        try {
            Bundle data=intent.getBundleExtra("BundleData");
            int[] valueFSR= data.getIntArray("valueFSR");
            double[] IMUData=data.getDoubleArray("IMUData");

            //outputStreamLeft.write(fileContents.getBytes());

            rightSensors.add(valueFSR);


        } catch (Exception e) {
            e.printStackTrace();
        }



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


    private class UploadTimerTask extends TimerTask {
        @Override
        public void run() {

            try {

                ArrayList<int[]> copyLeftSensors = new ArrayList<>(leftSensors);
                ArrayList<int[]> copyRightSensors = new ArrayList<>(rightSensors);

                leftSensors.clear();
                rightSensors.clear();

//                byte[] fileContents = new byte[inputStream.available()];
//                inputStream.read(fileContents);
//                inputStream.close();
//
//                String encodedCsvBase64 = Base64.encodeToString(fileContents, Base64.NO_WRAP);

                JSONObject body = new JSONObject();
                body.put("date", new Date() );
                body.put("id", "1234");

                JSONArray dataR = new JSONArray();
                for (int[] leftSensor : copyLeftSensors) {
                    JSONArray ls = new JSONArray();
                    for (int value : leftSensor) {
                        ls.put(value);
                    }
                    dataR.put(ls);
                }

                JSONArray dataL = new JSONArray();
                for (int[] rightSensor : copyRightSensors) {
                    JSONArray rs = new JSONArray();
                    for (int value : rightSensor) {
                        rs.put(value);
                    }
                    dataR.put(rs);
                }
                
                try {
                    InetAddress inAddress= InetAddress.getByName("https://www.google.com");
                    if (inAddress.equals("")) {
                        Log.e("SaveDataTimerTask", "No se ha introducido dir");
                    } else {
                        Log.e("SaveDataTimerTask", "Ping correcto");
                    }
                } catch (Exception e) {
                    Log.e("SaveDataTimerTask", "Error", e);
                }
                body.put("rightInsole", dataR);
                body.put("leftInsole", dataL);

                URL url = new URL("http://192.168.100.106:3000/api/data");

                HttpURLConnection urlConnection = (HttpURLConnection) url.openConnection();

                urlConnection.setDoOutput(true);
                urlConnection.setRequestMethod("POST");
                urlConnection.setRequestProperty("Content-Type", "application/json");
                //urlConnection.setRequestProperty("Content-Encoding", "gzip");
                //urlConnection.setRequestProperty("Accept-Encoding", "gzip");
                urlConnection.setRequestProperty("Accept", "application/json");
                urlConnection.setReadTimeout(60000);
                urlConnection.setConnectTimeout(15000);

                urlConnection.connect();

                OutputStreamWriter outputStreamWriter = new OutputStreamWriter(urlConnection.getOutputStream());
                outputStreamWriter.write(body.toString());
                outputStreamWriter.close();


                if(urlConnection.getResponseCode() > 400) {
                    BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(new BufferedInputStream(urlConnection.getInputStream())));
                    StringBuilder result = new StringBuilder();
                    String line;
                    while((line = bufferedReader.readLine()) != null) {
                        result.append(line);
                    }
                    Log.e("SaveDataTimerTask", "Back-end error : " + urlConnection.getResponseCode() + " " + result.toString());
                }
                urlConnection.disconnect();

            } catch (Exception e) {
                Log.e("SaveDataTimerTask", "Error: " + e.getMessage());
            }


        }
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i("LocalService", "Received start id " + startId + ": " + intent);
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        // Cancel the persistent notification.
        mNM.cancel(NOTIFICATION);
        if(uploadTimerTask != null)
            uploadTimerTask.cancel();

        unregisterReceiver(mLInsoleUpdateReceiver);
        unregisterReceiver(mRInsoleUpdateReceiver);
        // Tell the user we stopped.
        Toast.makeText(this, R.string.data_service_stopped, Toast.LENGTH_SHORT).show();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return mBinder;
    }

    // This is the object that receives interactions from clients.  See
    // RemoteService for a more complete example.
    private final IBinder mBinder = new LocalBinder();

    /**
     * Show a notification while this service is running.
     */
    private void showNotification() {
        // In this sample, we'll use the same text for the ticker and the expanded notification
        CharSequence text = getText(R.string.data_service_started);

        // The PendingIntent to launch our activity if the user selects this notification
       // PendingIntent contentIntent = PendingIntent.getActivity(this, 0,
         //       new Intent(this, LocalServiceActivities.Controller.class), 0);

        // Set the info for the views that show in the notification panel.
        Notification notification = new Notification.Builder(this)
                .setSmallIcon(R.drawable.ic_launcher_foreground)  // the status icon
                .setTicker(text)  // the status text
                .setWhen(System.currentTimeMillis())  // the time stamp
                .setContentTitle(getText(R.string.data_service_label))  // the label of the entry
                .setContentText(text)  // the contents of the entry
               // .setContentIntent(contentIntent)  // The intent to send when the entry is clicked
                .build();

        // Send the notification.
        mNM.notify(NOTIFICATION, notification);
    }
}
