package com.mamiot.caresp32;

import android.graphics.Color;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;
import android.os.NetworkOnMainThreadException;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.SeekBar;

import java.io.DataOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;

public class MainActivity extends AppCompatActivity {

    private static final int SERVERPORT = 9999;
    private static final String SERVER_IP = "192.130.0.1";
    private SeekBar accelerationSeekBar;
    private SeekBar directionSeekBar;
    private Button connectButtom;

    Thread threadData;
    Thread threadNetwork;
    Handler mHandlerThread;
    Handler handlerNetwork;
    protected boolean connected;
    private byte[] dataForSocket;
    private static final int UPDATE_DIRECTION = 1;
    private static final int UPDATE_ACELERATION = 2;
    private static final int CONNECT = 3;
    private static final int UPDATE_INFO = 4;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        accelerationSeekBar=(SeekBar)findViewById(R.id.accelerationSeekBar);
        directionSeekBar=(SeekBar)findViewById(R.id.directionSeekBar);
        connectButtom = (Button) findViewById(R.id.connect);
        connected=false;
        dataForSocket=new byte[] {0,0};
        threadData=new Thread(new ClientThread());
        threadData.start();
        threadNetwork=new Thread(new NetworkThread());
        threadNetwork.start();
    }
    @Override
    protected void onDestroy() {
    super.onDestroy();
    }
    class NetworkThread implements Runnable {
        private InetAddress serverAddr;
        private Socket socket;
        private DataOutputStream dataOutput;
        @Override
        public void run() {
            Looper.prepare();
            try {
                serverAddr = InetAddress.getByName(SERVER_IP);
                socket = new Socket(serverAddr, SERVERPORT);
                dataOutput = new DataOutputStream(socket.getOutputStream());
            }catch (UnknownHostException e1) {
                    e1.printStackTrace();
                } catch (IOException e1) {
                    e1.printStackTrace();
                }
            handlerNetwork = new Handler() {
                @Override
                public void handleMessage(Message msg) {
                    super.handleMessage(msg);
                    if (msg.what == UPDATE_INFO){
                        try {
                            dataOutput.write(dataForSocket);
                            //socket.close();
                        } catch (IOException e1) {
                            e1.printStackTrace();
                        }
                    }
                }
            };
            Looper.loop();
        }

    }

    @Override
    protected void onResume() {
        super.onResume();
        mHandlerThread = new Handler() {
            @Override
            public void handleMessage(Message msg) {
                super.handleMessage(msg);

                //if (msg.what == CONNECT){
                    //Message message = new Message();
                    //message.what = UPDATE_INFO;
                    //handlerNetwork.sendMessage(message);
                //}
                //else
                if (msg.what == UPDATE_DIRECTION) {
                    dataForSocket[0] = (byte) (msg.arg1 & 0xFF);
                }
                if (msg.what == UPDATE_ACELERATION) {
                    dataForSocket[1] = (byte) (msg.arg1 & 0xFF);
                }
                Message message = new Message();
                message.what = UPDATE_INFO;
                handlerNetwork.sendMessage(message);
            }
        };
    }
        class ClientThread implements Runnable {
        @Override
        public void run() {
            directionSeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
                public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                    int progressInBytes=progress;
                    Message message = new Message();
                    message.what = UPDATE_DIRECTION;
                    message.arg1 = progressInBytes;
                    mHandlerThread.sendMessage(message);
                }
                public void onStartTrackingTouch(SeekBar seekBar) {
                    // TODO Auto-generated method stub
                }
                public void onStopTrackingTouch(SeekBar seekBar) {
                    // TODO Auto-generated method stub
                    seekBar.setProgress(50);
                }
            });

            accelerationSeekBar.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener() {
                public void onProgressChanged(SeekBar seekBar, int progress, boolean fromUser) {
                        int progressInBytes=progress;
                        Message message = new Message();
                        message.what = UPDATE_ACELERATION;
                        message.arg1 = progressInBytes;
                        mHandlerThread.sendMessage(message);
                }
                public void onStartTrackingTouch(SeekBar seekBar) {
                    // TODO Auto-generated method stub
                }
                public void onStopTrackingTouch(SeekBar seekBar) {
                    seekBar.setProgress(50);
                }
            });

            connectButtom.setOnClickListener(new View.OnClickListener() {
                public void onClick(View v) {
//                    Message message = new Message();
//                    message.what = CONNECT;
//                    mHandlerThread.sendMessage(message);
                }
            });
        }

    }

}
