package com.example.org.insole;

import android.annotation.TargetApi;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.support.design.widget.NavigationView;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import java.io.File;
import java.io.FileOutputStream;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;

@TargetApi(Build.VERSION_CODES.M) // This is needed so that we can use Marshmallow API calls
public class DataViewActivityRAW extends DataViewActivity {
    private final static String TAG = DataViewActivityRAW.class.getSimpleName();

    private static TextView[]FSRsTextR;
    private static TextView[] FSRsTextL;
    private static TextView FreqTextR;
    private static TextView FreqTextL;
    private static TextView[] GyroscopeR;
    private static TextView[] AccelerometerR;
    private static TextView[] GyroscopeL;
    private static TextView[] AccelerometerL;
    //private boolean HavePermission;
    private String LeftData = "LeftData";
    private String RightData = "RightData";
    private FileOutputStream outputStreamLeft;
    private FileOutputStream outputStreamRight;
    String root;
    String csvFileLeft;
    String csvFileRight;
    File directoryFiles;
    File FileOutputLeft;
    File FileOutputRight;
    private boolean StartRecord;
    private Button recordButton;




    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.data_view_raw);

        NavigationView navigationView = findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);
        FSRsTextR=new TextView[32];
        FSRsTextR[0] =  findViewById(R.id.R_FSR0);
        FSRsTextR[1] =  findViewById(R.id.R_FSR1);
        FSRsTextR[2] =  findViewById(R.id.R_FSR2);
        FSRsTextR[3] =  findViewById(R.id.R_FSR3);
        FSRsTextR[4] =  findViewById(R.id.R_FSR4);
        FSRsTextR[5] =  findViewById(R.id.R_FSR5);
        FSRsTextR[6] =  findViewById(R.id.R_FSR6);
        FSRsTextR[7] =  findViewById(R.id.R_FSR7);
        FSRsTextR[8] =  findViewById(R.id.R_FSR8);
        FSRsTextR[9] =  findViewById(R.id.R_FSR9);
        FSRsTextR[10] =  findViewById(R.id.R_FSR10);
        FSRsTextR[11] =  findViewById(R.id.R_FSR11);
        FSRsTextR[12] =  findViewById(R.id.R_FSR12);
        FSRsTextR[13] =  findViewById(R.id.R_FSR13);
        FSRsTextR[14] =  findViewById(R.id.R_FSR14);
        FSRsTextR[15] =  findViewById(R.id.R_FSR15);
        FSRsTextR[16] =  findViewById(R.id.R_FSR16);
        FSRsTextR[17] =  findViewById(R.id.R_FSR17);
        FSRsTextR[18] =  findViewById(R.id.R_FSR18);
        FSRsTextR[19] =  findViewById(R.id.R_FSR19);
        FSRsTextR[20] =  findViewById(R.id.R_FSR20);
        FSRsTextR[21] =  findViewById(R.id.R_FSR21);
        FSRsTextR[22] =  findViewById(R.id.R_FSR22);
        FSRsTextR[23] =  findViewById(R.id.R_FSR23);
        FSRsTextR[24] =  findViewById(R.id.R_FSR24);
        FSRsTextR[25] =  findViewById(R.id.R_FSR25);
        FSRsTextR[26] =  findViewById(R.id.R_FSR26);
        FSRsTextR[27] =  findViewById(R.id.R_FSR27);
        FSRsTextR[28] =  findViewById(R.id.R_FSR28);
        FSRsTextR[29] =  findViewById(R.id.R_FSR29);
        FSRsTextR[30] =  findViewById(R.id.R_FSR30);
        FSRsTextR[31] =  findViewById(R.id.R_FSR31);
        FSRsTextL=new TextView[32];
        FSRsTextL[0] =  findViewById(R.id.L_FSR0);
        FSRsTextL[1] =  findViewById(R.id.L_FSR1);
        FSRsTextL[2] =  findViewById(R.id.L_FSR2);
        FSRsTextL[3] =  findViewById(R.id.L_FSR3);
        FSRsTextL[4] =  findViewById(R.id.L_FSR4);
        FSRsTextL[5] =  findViewById(R.id.L_FSR5);
        FSRsTextL[6] =  findViewById(R.id.L_FSR6);
        FSRsTextL[7] =  findViewById(R.id.L_FSR7);
        FSRsTextL[8] =  findViewById(R.id.L_FSR8);
        FSRsTextL[9] =  findViewById(R.id.L_FSR9);
        FSRsTextL[10] =  findViewById(R.id.L_FSR10);
        FSRsTextL[11] =  findViewById(R.id.L_FSR11);
        FSRsTextL[12] =  findViewById(R.id.L_FSR12);
        FSRsTextL[13] =  findViewById(R.id.L_FSR13);
        FSRsTextL[14] =  findViewById(R.id.L_FSR14);
        FSRsTextL[15] =  findViewById(R.id.L_FSR15);
        FSRsTextL[16] =  findViewById(R.id.L_FSR16);
        FSRsTextL[17] =  findViewById(R.id.L_FSR17);
        FSRsTextL[18] =  findViewById(R.id.L_FSR18);
        FSRsTextL[19] =  findViewById(R.id.L_FSR19);
        FSRsTextL[20] =  findViewById(R.id.L_FSR20);
        FSRsTextL[21] =  findViewById(R.id.L_FSR21);
        FSRsTextL[22] =  findViewById(R.id.L_FSR22);
        FSRsTextL[23] =  findViewById(R.id.L_FSR23);
        FSRsTextL[24] =  findViewById(R.id.L_FSR24);
        FSRsTextL[25] =  findViewById(R.id.L_FSR25);
        FSRsTextL[26] =  findViewById(R.id.L_FSR26);
        FSRsTextL[27] =  findViewById(R.id.L_FSR27);
        FSRsTextL[28] =  findViewById(R.id.L_FSR28);
        FSRsTextL[29] =  findViewById(R.id.L_FSR29);
        FSRsTextL[30] =  findViewById(R.id.L_FSR30);
        FSRsTextL[31] =  findViewById(R.id.L_FSR31);
        
        
        GyroscopeR=new TextView[3];
        GyroscopeR[0]=(TextView) findViewById(R.id.R_GyroYaw);
        GyroscopeR[1]=(TextView) findViewById(R.id.R_GyroPitch);
        GyroscopeR[2]=(TextView) findViewById(R.id.R_GyroRoll);
        AccelerometerR=new TextView[3];
        AccelerometerR[0]=(TextView) findViewById(R.id.R_AccelX);
        AccelerometerR[1]=(TextView) findViewById(R.id.R_AccelY);
        AccelerometerR[2]=(TextView) findViewById(R.id.R_AccelZ);
        FreqTextR= (TextView) findViewById(R.id.R_Frequence);

        GyroscopeL=new TextView[3];
        GyroscopeL[0]=(TextView) findViewById(R.id.L_GyroYaw);
        GyroscopeL[1]=(TextView) findViewById(R.id.L_GyroPitch);
        GyroscopeL[2]=(TextView) findViewById(R.id.L_GyroRoll);
        AccelerometerL=new TextView[3];
        AccelerometerL[0]=(TextView) findViewById(R.id.L_AccelX);
        AccelerometerL[1]=(TextView) findViewById(R.id.L_AccelY);
        AccelerometerL[2]=(TextView) findViewById(R.id.L_AccelZ);
        FreqTextL= (TextView) findViewById(R.id.L_Frequence);



        StartRecord=false;
        recordButton = findViewById(R.id.Record);
        recordButton.setText("Start Record");
        root = Environment.getExternalStorageDirectory().toString();
        directoryFiles = new File(root + "/InsoleCSV");
        if (!directoryFiles.exists()) {
            directoryFiles.mkdirs();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();

        recordButton.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                try {
                    if(recordButton.getText()=="Start Record"){
                        recordButton.setText("Stop Record");
                        recordButton.setBackgroundColor(Color.RED);
                        StartRecord=true;
                        SimpleDateFormat sdf = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss");
                        String fname =LeftData + sdf.format(new Timestamp(System.currentTimeMillis())) + ".csv";
                        FileOutputLeft= new File (directoryFiles, fname);
                        outputStreamLeft = new FileOutputStream(FileOutputLeft);
                        //outputStreamLeft = openFileOutput(LeftData + sdf.format(new Timestamp(System.currentTimeMillis())) + ".csv", Context.MODE_PRIVATE);
                    }else{
                        recordButton.setText("Start Record");
                        recordButton.setBackgroundColor(Color.GREEN);
                        StartRecord=false;
                        outputStreamLeft.close();
                        Uri uri = Uri.fromFile(FileOutputLeft);
                        Intent scanFileIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, uri);
                        sendBroadcast(scanFileIntent);
                    }
                }catch (Exception e) {
                    e.printStackTrace();
                }
            }
        });
    }

    @Override
    protected void onPause() {
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
    }

    protected  void data_availableL(Intent intent){
        try {
            Bundle data=intent.getBundleExtra("BundleData");
            int[] valueFSR= data.getIntArray("valueFSR");
            double[] IMUData=data.getDoubleArray("IMUData");

            //outputStreamLeft.write(fileContents.getBytes());

            for(int i=0;i<FSRsTextL.length;i++){
                FSRsTextL[i].setText(String.format("%d",valueFSR[i]));
                if(StartRecord){
                    outputStreamLeft.write(String.format("%d",valueFSR[i]).getBytes());
                    outputStreamLeft.write(";".getBytes());
                }
            }

            AccelerometerL[0].setText(String.format("%.2f",IMUData[0]));
            AccelerometerL[1].setText(String.format("%.2f",IMUData[1]));
            AccelerometerL[2].setText(String.format("%.2f",IMUData[2]));
            //String.format("")
            //AccelerometerR[1].setText("1111111");
            GyroscopeL[0].setText(String.format("%.2f",IMUData[3]));
            GyroscopeL[1].setText(String.format("%.2f",IMUData[4]));
            GyroscopeL[2].setText(String.format("%.2f",IMUData[5]));

//            if(StartRecord) {
//                for(int i=0;i<IMUData.length;i++){
//                    outputStreamRight.write(String.format("%.2f",IMUData[i]).getBytes());
//                    outputStreamRight.write(";".getBytes());
//                }
//                outputStreamRight.write('\n');
//            }
            //FreqTextR.setText(String.format("%d",RightInsoleService.getFreq()));
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

                        for(int i=0;i<FSRsTextR.length;i++){
                            FSRsTextR[i].setText(String.format("%d",valueFSR[i]));
                            if(StartRecord){
                                outputStreamLeft.write(String.format("%d",valueFSR[i]).getBytes());
                                outputStreamLeft.write(";".getBytes());
                            }
                        }

                        AccelerometerR[0].setText(String.format("%.2f",IMUData[0]));
                        AccelerometerR[1].setText(String.format("%.2f",IMUData[1]));
                        AccelerometerR[2].setText(String.format("%.2f",IMUData[2]));
                        //String.format("")
                        //AccelerometerR[1].setText("1111111");
                        GyroscopeR[0].setText(String.format("%.2f",IMUData[3]));
                        GyroscopeR[1].setText(String.format("%.2f",IMUData[4]));
                        GyroscopeR[2].setText(String.format("%.2f",IMUData[5]));

            if(StartRecord) {
                for(int i=0;i<IMUData.length;i++){
                    outputStreamRight.write(String.format("%.2f",IMUData[i]).getBytes());
                    outputStreamRight.write(";".getBytes());
                }
                outputStreamRight.write('\n');
            }
           //FreqTextR.setText(String.format("%d",RightInsoleService.getFreq()));
        } catch (Exception e) {
            e.printStackTrace();
        }



    }


}



