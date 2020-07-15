#include "main.h"

void computeFSRs()
{
    //The following variables will be used in the for loop, as temporary storage.
    int16 firstFsr;//Data  from first FSR in a loop.
    int16 secondFsr;//Data from second FSR in a loop.
    ENABLE_BATT_LVL_Write(0);
    MUX_E_Write(0);
    ADC_Start();
    
    ADC_StartConvert();
    for(int i=0;i<8;i++){

        S2_Write((i & 0b100)>>2);
        S1_Write((i & 0b010)>>1);
        S0_Write( i & 0b001 );
        //CyDelayUs(2000);
        
        
        ADC_IsEndConversion(ADC_WAIT_FOR_RESULT);
        Fsrs[0][i]=ADC_GetResult16(0);
        Fsrs[1][i]=ADC_GetResult16(1);
        Fsrs[2][i]=ADC_GetResult16(2);
        Fsrs[3][i]=ADC_GetResult16(3);
        BATTERY_LVL=ADC_GetResult16(4);
        
    }
    ADC_StopConvert();
    MUX_E_Write(1);
    ENABLE_BATT_LVL_Write(1);

    
    ADC_Stop();
//16 bytes + 4 bytes = 20 bytes 8 sensores- mux0 y 2 del mux 3
//16 bytes + 4 bytes = 20 bytes 8 sensores- mux1 y 2 del mux 3
//16 bytes + 4 bytes = 20 bytes 8 sensores- mux2 y 2 del mux 3
//12 bytes + 4 bytes = 16 bytes Datos de la IMU  y 2 del mux 3
    
for(int i=0,j=0;i<8;i++,j+=2){
   RAW_data0[j]=Fsrs[0][i]>>8;
   RAW_data0[j+1]=Fsrs[0][i]&0xFF;
   RAW_data1[j]=Fsrs[1][i]>>8;
   RAW_data1[j+1]=Fsrs[1][i]&0xFF;
   RAW_data2[j]=Fsrs[2][i]>>8;
   RAW_data2[j+1]=Fsrs[2][i]&0xFF;
}

for(int i=0,j=16;i<2;i++,j+=2){
   RAW_data0[j]=Fsrs[3][i]>>8;
   RAW_data0[j+1]=Fsrs[3][i]&0xFF;

   RAW_data1[j]=Fsrs[3][i+2]>>8;
   RAW_data1[j+1]=Fsrs[3][i+2]&0xFF;

   RAW_data2[j]=Fsrs[3][i+4]>>8;
   RAW_data2[j+1]=Fsrs[3][i+4]&0xFF;
}
RawIMU[6]=Fsrs[3][6]; //En la caracteristica de las IMUs metemos los 2 int16 que nos faltan
RawIMU[7]=Fsrs[3][7];


}

// ================================================================
// ===       Send the updated data to the receiver.             ===
// ================================================================
void updateData()
{
    
    RAW0Handle.attrHandle = CYBLE_PRESSURE_RAW0_CHAR_HANDLE;
  	RAW0Handle.value.val = (void *)& RAW_data0;
    RAW0Handle.value.len =  20;
    CyBle_GattsNotification(cyBle_connHandle,&RAW0Handle);
    
    RAW1Handle.attrHandle = CYBLE_PRESSURE_RAW1_CHAR_HANDLE;
  	RAW1Handle.value.val = (void *)& RAW_data1;
    RAW1Handle.value.len = 20;
    CyBle_GattsNotification(cyBle_connHandle,&RAW1Handle);
    
    RAW2Handle.attrHandle = CYBLE_PRESSURE_RAW2_CHAR_HANDLE;
  	RAW2Handle.value.val = (void *)& RAW_data2;
    RAW2Handle.value.len = 20;
    CyBle_GattsNotification(cyBle_connHandle,&RAW2Handle);
    
    
    IMUHandle.attrHandle=CYBLE_IMU_GYRO_ACCEL_CHAR_HANDLE;
    IMUHandle.value.val = (void *)&RawIMU;
    IMUHandle.value.len = 16;
    CyBle_GattsNotification(cyBle_connHandle,&IMUHandle);
    

}


// ================================================================
// ===         Function to handle the BLE stack                 ===
// ================================================================
void BleCallBack(uint32 event, void* eventParam)
{
    CYBLE_GATTS_WRITE_REQ_PARAM_T *wrReqParam;
    uint32 register_value;
    switch(event)
    {case CYBLE_EVT_GAP_DEVICE_DISCONNECTED:
        case CYBLE_EVT_STACK_ON:
            CyBle_GappStartAdvertisement(CYBLE_ADVERTISING_FAST);
        break;
        case CYBLE_EVT_GAP_DEVICE_CONNECTED:
           CyBle_L2capLeConnectionParamUpdateRequest(cyBle_connHandle.bdHandle, &connectionParameters);
            break;      
        default:
            break;
    }
} 
//
//
//void YawRollPitch(float YPR[3]){
//    YPR[0]  = atan2(2.0f * (q1 * q2 + q0 * q3), q0 * q0 + q1 * q1 - q2 * q2 - q3 * q3);   
//    YPR[2]  = -asin(2.0f * (q1 * q3 - q0 * q2));
//    YPR[1]  =  M_PI-atan2(2.0f * (q0 * q1 + q2 * q3), q0 * q0 - q1 * q1 - q2 * q2 + q3 * q3);
//
//}

// ================================================================
// ===                     GET Data values                      ===
// ================================================================

void GetImuData() {
    ism330dlc_reg_t reg;
    ism330dlc_status_reg_get(&dev_ctx, &reg.status_reg);
   
    if (reg.status_reg.xlda)
    {
      /* Read magnetic field data */
      memset(data_raw_acceleration.u8bit, 0x00, 3*sizeof(int16_t));
      ism330dlc_acceleration_raw_get(&dev_ctx, data_raw_acceleration.u8bit);
      RawIMU[0]=data_raw_acceleration.i16bit[0];
      RawIMU[1]=data_raw_acceleration.i16bit[1];
      RawIMU[2]=data_raw_acceleration.i16bit[2];
      //accel[0]=RawAccel[0]*ares;
      //accel[1]=RawAccel[1]*ares;
      //accel[2]=RawAccel[2]*ares;
    }
    

    
    if (reg.status_reg.gda)
    {
      /* Read magnetic field data */
      memset(data_raw_angular_rate.u8bit, 0x00, 3*sizeof(int16_t));
      ism330dlc_angular_rate_raw_get(&dev_ctx, data_raw_angular_rate.u8bit);
      RawIMU[3]=data_raw_angular_rate.i16bit[0];
      RawIMU[4]=data_raw_angular_rate.i16bit[1];
      RawIMU[5]=data_raw_angular_rate.i16bit[2];
      //gyro[0]=((data_raw_angular_rate.i16bit[0]-MPU_OFFSETS[3])*gres)*M_PI/180.0f;
      //gyro[1]=((data_raw_angular_rate.i16bit[1]-MPU_OFFSETS[4])*gres)*M_PI/180.0f;
      //gyro[2]=((data_raw_angular_rate.i16bit[2]-MPU_OFFSETS[5])*gres)*M_PI/180.0f;
    }
    
   //MahonyAHRSupdateIMU(gyro[0],gyro[1],gyro[2],accel[0],accel[1],accel[2]);
   //YawRollPitch(YPR);


}

void StartIMU(){

  /*
   *  Check device ID
   */
  whoamI = 0;
  ism330dlc_device_id_get(&dev_ctx, &whoamI);
    for(int i=0;i<20 &&  whoamI != ISM330DLC_ID;i++){
     ism330dlc_device_id_get(&dev_ctx, &whoamI);
        CyDelay(500);
    }
    if ( whoamI != ISM330DLC_ID )
      while(1); /*manage here device not found */
    
  /*
   *  Restore default configuration
   */
  ism330dlc_reset_set(&dev_ctx, PROPERTY_ENABLE);
  do {
    ism330dlc_reset_get(&dev_ctx, &rst);
  } while (rst);
  /*
   *  Enable Block Data Update
   */
  ism330dlc_block_data_update_set(&dev_ctx, PROPERTY_ENABLE);
  /*
   * Set Output Data Rate
   */
  ism330dlc_xl_data_rate_set(&dev_ctx, ISM330DLC_XL_ODR_52Hz);
  ism330dlc_gy_data_rate_set(&dev_ctx, ISM330DLC_GY_ODR_52Hz);
  /*
   * Set full scale
   */  
  ism330dlc_xl_full_scale_set(&dev_ctx, ISM330DLC_8g);
  ism330dlc_gy_full_scale_set(&dev_ctx, ISM330DLC_1000dps);
/*
* Set low_power mode
*/
  ism330dlc_gy_power_mode_set(&dev_ctx,ISM330DLC_GY_NORMAL);
  ism330dlc_xl_power_mode_set(&dev_ctx,ISM330DLC_XL_NORMAL);

}

int main()
{
    yaw=0;
    pitch=0;
    roll=0;
    CyGlobalIntEnable;
    CyBle_Start(BleCallBack);
   /* Set the divider for ECO, ECO will be used as source when IMO is switched off to save power */
    CySysClkWriteEcoDiv(CY_SYS_CLK_ECO_DIV8);
    I2C_Start();
    StartIMU();
    isCurrentEventProcessed=0;
    
    
    
    //ENABLE_BATT_LVL_Write(1);

while(1)
    {
        
        if(isCurrentEventProcessed==0 && CyBle_GetState() == CYBLE_STATE_CONNECTED)
        {
            GetImuData();
            computeFSRs();
            updateData();
        }
        CyBle_ProcessEvents(); 
        LowPowerImplementation(&isCurrentEventProcessed);
    }
}