#include "main.h"

void computeFSRs()
{
    //The following variables will be used in the for loop, as temporary storage.
    int16 firstFsr;//Data  from first FSR in a loop.
    int16 secondFsr;//Data from second FSR in a loop.
    MUX_0_Write(1);
    //VCC_Write(1);
    //AMuxSeq_Start();
    ADC_Start();
    
    for(int i=0;i<NUMBER_OF_FSR;i=i+4){
        //AMuxSeq_Next();
        
        ADC_StartConvert();
        ADC_IsEndConversion(ADC_WAIT_FOR_RESULT);
        Fsrs[i]=ADC_GetResult16(0);
        Fsrs[i+1]=ADC_GetResult16(1);
        Fsrs[i+2]=ADC_GetResult16(2);
        Fsrs[i+3]=ADC_GetResult16(3);
        ADC_StopConvert();
    }
     MUX_0_Write(0);
    //VCC_Write(0);
    ADC_Stop();
    //AMuxSeq_Stop();
    
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

    RAW_data[0]= (Fsrs[0]>>2)& 0xFF;
    RAW_data[1]=((Fsrs[0] & (0b11))<<6)| ((Fsrs[1]>>4) & 0b111111);
    RAW_data[2]=((Fsrs[1] & 0xF)<<4)| ((Fsrs[2]>>6)&0xF);
    RAW_data[3]=((Fsrs[2]&0b111111)<<2)| ((Fsrs[3]>>8)&0b11);
    RAW_data[4]=Fsrs[3] & 0xFF;
    
    RAW_data[5]=(Fsrs[4]>>2) & 0xFF;
    RAW_data[6]=((Fsrs[4]&0b11)<<6)| ((Fsrs[5]>>4) & 0b111111);
    RAW_data[7]=((Fsrs[5] & 0xF)<<4)| ((Fsrs[6]>>6)&0xF);
    RAW_data[8]=((Fsrs[6]&0b111111)<<2)| ((Fsrs[7]>>8)&0b11);
    RAW_data[9]=Fsrs[7] & 0xFF;
    
    RAW_data[10]=(Fsrs[8]>>2)& 0xFF;
    RAW_data[11]=((Fsrs[8] & (0b11))<<6)| ((Fsrs[9]>>4) & 0b111111);
    RAW_data[12]=((Fsrs[9] & 0xF)<<4)| ((Fsrs[10]>>4) & 0b111111);;
    RAW_data[13]=((Fsrs[10]&0b111111)<<2)| ((Fsrs[11]>>8)&0b11);
    RAW_data[14]=Fsrs[11] & 0xFF;
    

    
}

// ================================================================
// ===       Send the updated data to the receiver.             ===
// ================================================================
void updateData()
{

    FSRHandle.attrHandle = CYBLE_PRESSURE_FSR_CHAR_HANDLE;
  	FSRHandle.value.val = (void *)&RAW_data;
    FSRHandle.value.len = BYTES_FOR_FSRS;
    CyBle_GattsNotification(cyBle_connHandle,&FSRHandle);
    
    //CYBLE_API_RESULT_T StatusFSR= CyBle_GattsNotification(cyBle_connHandle,&FSRHandle);
    
    GyroHandle.attrHandle= CYBLE_IMU_GYROSCOPE_CHAR_HANDLE;
    GyroHandle.value.val = (void *)&YPR;
    GyroHandle.value.len = 12; 
    CyBle_GattsNotification(cyBle_connHandle,&GyroHandle);
    //CYBLE_API_RESULT_T StatusGYRO=CyBle_GattsNotification(cyBle_connHandle,&GyroHandle);
    AccelHandle.attrHandle=CYBLE_IMU_ACCELEROMETER_CHAR_HANDLE;
    AccelHandle.value.val = (void *)&RawAccel;
    AccelHandle.value.len = 6;
    CyBle_GattsNotification(cyBle_connHandle,&AccelHandle);
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


void YawRollPitch(float YPR[3]){
    YPR[0]  = atan2(2.0f * (q1 * q2 + q0 * q3), q0 * q0 + q1 * q1 - q2 * q2 - q3 * q3);   
    YPR[1]  = -asin(2.0f * (q1 * q3 - q0 * q2));
    YPR[2]  = atan2(2.0f * (q0 * q1 + q2 * q3), q0 * q0 - q1 * q1 - q2 * q2 + q3 * q3);
    YPR[1] *= 180.0f / M_PI;
    YPR[0] *= 180.0f / M_PI; 
    YPR[2] *= 180.0f / M_PI;
}

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
      RawAccel[0]=data_raw_acceleration.i16bit[0]-MPU_OFFSETS[0];
      RawAccel[1]=data_raw_acceleration.i16bit[1]-MPU_OFFSETS[1];
      RawAccel[2]=data_raw_acceleration.i16bit[2]-MPU_OFFSETS[2];
      accel[0]=RawAccel[0]*ares;
      accel[1]=RawAccel[1]*ares;
      accel[2]=RawAccel[2]*ares;
    }
    

    
    if (reg.status_reg.gda)
    {
      /* Read magnetic field data */
      memset(data_raw_angular_rate.u8bit, 0x00, 3*sizeof(int16_t));
      ism330dlc_angular_rate_raw_get(&dev_ctx, data_raw_angular_rate.u8bit);

      gyro[0]=((data_raw_angular_rate.i16bit[0]-MPU_OFFSETS[3])*gres)*M_PI/180.0f;
      gyro[1]=((data_raw_angular_rate.i16bit[1]-MPU_OFFSETS[4])*gres)*M_PI/180.0f;
      gyro[2]=((data_raw_angular_rate.i16bit[2]-MPU_OFFSETS[5])*gres)*M_PI/180.0f;
 
    }
    
   MahonyAHRSupdateIMU(gyro[0],gyro[1],gyro[2],accel[0],accel[1],accel[2]);
   YawRollPitch(YPR);


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