package com.example.org.insole;

import android.annotation.TargetApi;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Arrays;
@TargetApi(Build.VERSION_CODES.M) // This is needed so that we can use Marshmallow API calls
public class DataViewActivityGraphic extends DataViewActivity {
    private WebView webb;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.data_view_graphic);
        webb= findViewById(R.id.THREEJSWindow);
        WebSettings settings = webb.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccessFromFileURLs(true);
        webb.setWebViewClient(new WebViewClient());
        navigationView = findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webb.loadUrl("file:///android_asset/index.html");

    }

    @Override
    protected void onPause() {
        super.onPause();
        webb.loadUrl("about:blank");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }



    protected  void data_availableR(Intent intent){


        try {

            Bundle data=intent.getBundleExtra("BundleData");
            int[] valueFSR= data.getIntArray("valueFSR");
            double[] IMUData=data.getDoubleArray("IMUData");

            Mahony.MahonyAHRSupdateIMU(
                    (float)IMUData[0],
                    (float)IMUData[1],
                    (float)IMUData[2],
                    (float)IMUData[3],
                    (float)IMUData[4],
                    (float)IMUData[5]
            );
            YRP=Mahony.getYawRollPitch();
            int[] temporalFSRsValue=new int[32];
            for(int i=0;i<temporalFSRsValue.length;i++){
                temporalFSRsValue[i]=valueFSR[i];
            }
            String JSCode="javascript:updateColorRight("+ Arrays.toString(temporalFSRsValue)+")";
            double roll=(Math.abs(-YRP[1])<(Math.PI/2))?(-YRP[1]):0;//=(roll<(Math.PI/2))?roll:0;

            double pitch= (-YRP[0]-Math.PI-0.1);
            pitch=(Math.abs(pitch)<(Math.PI/2))?pitch:0;

            webb.evaluateJavascript(JSCode,null);
                    JSCode="javascript:pitchRollRight("+
                            roll+","+
                            pitch
                            +")";
                    webb.evaluateJavascript(JSCode,null);
                    JSCode="javascript:RightAcceleration(["+
                            IMUData[1]+","+
                            IMUData[2]
                            +"])";
                    webb.evaluateJavascript(JSCode,null);
//
//
//                         JSCode="javascript:updateColorLeft("+ Arrays.toString(temporalFSRsValue)+")";
//                        webb.evaluateJavascript(JSCode,null);
//                        JSCode="javascript:pitchRollLeft("+
//                                RightInsoleService.getValueGyroscope(1)+","+
//                                RightInsoleService.getValueGyroscope(2)
//                                +")";
//                        webb.evaluateJavascript(JSCode,null);
//                        JSCode="javascript:LeftAcceleration(["+
//                                RightInsoleService.getValueAcceleration(1)+","+
//                                RightInsoleService.getValueAcceleration(2)
//                                +"])";
//                        webb.evaluateJavascript(JSCode,null);

        } catch (Exception e) {
            e.printStackTrace();
        }



    }

    protected  void data_availableL(Intent intent){
        //                    int[] temporalFSRsValue={
//                            LeftInsoleService.getValueFSR(0),
//                            LeftInsoleService.getValueFSR(10),
//                            LeftInsoleService.getValueFSR(11),
//                            LeftInsoleService.getValueFSR(9),
//                            LeftInsoleService.getValueFSR(8),
//                            LeftInsoleService.getValueFSR(6),
//                            LeftInsoleService.getValueFSR(2),
//                            LeftInsoleService.getValueFSR(7),
//                            LeftInsoleService.getValueFSR(5),
//                            LeftInsoleService.getValueFSR(1),
//                            LeftInsoleService.getValueFSR(3),
//                            LeftInsoleService.getValueFSR(4)};
//
//                    String JSCode="javascript:updateColorLeft("+ Arrays.toString(temporalFSRsValue)+")";
//                    webb.evaluateJavascript(JSCode,null);
//                    JSCode="javascript:pitchRollLeft("+
//                            LeftInsoleService.getValueGyroscope(2)+","+
//                            LeftInsoleService.getValueGyroscope(1)
//                            +")";
//                    webb.evaluateJavascript(JSCode,null);
//                    JSCode="javascript:LeftAcceleration(["+
//                            LeftInsoleService.getValueAcceleration(1)+","+
//                            LeftInsoleService.getValueAcceleration(2)
//                            +"])";
//                    webb.evaluateJavascript(JSCode,null);

    }
}



