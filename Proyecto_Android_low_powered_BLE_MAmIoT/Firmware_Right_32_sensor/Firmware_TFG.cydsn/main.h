#include "project.h"
#include "Mahony.h"
#include "stdio.h"
#include "ism330dlc_reg.h"

#ifndef POWER
 #define POWER 1
#include "power.h"
#endif
    
#include "math.h"
#include "I2CFunctions.h"
// ================================================================
// ===                            BLE                           ===
// ================================================================


/*****************************************************************************
* Connection Parameters structure
*****************************************************************************/
CYBLE_GAP_CONN_UPDATE_PARAM_T connectionParameters = 
{
    10,                /* Minimum connection interval - 400 x 1.25 = 500 ms */
    10,                /* Maximum connection interval - 400 x 1.25 = 500 ms */
    13,                  /* Slave latency - 1 */
    500                 /* Supervision timeout - 500 x 10 = 5000 ms */
};

#define NUMBER_OF_FSR (32) 
#define BYTES_FOR_FSRS 15 // 10 bits for FSR
int16 Fsrs[NUMBER_OF_FSR]; //Data from the ADC.
char RAW_data[BYTES_FOR_FSRS];// Raw data from ADC.It remains to add another 2 FSR.
int8 isCurrentEventProcessed;//Used for not process the IMU and FSRs in the same event.

CYBLE_GATTS_HANDLE_VALUE_NTF_T 	FSRHandle;
CYBLE_GATTS_HANDLE_VALUE_NTF_T 	GyroHandle;
CYBLE_GATTS_HANDLE_VALUE_NTF_T 	AccelHandle;
    



// ================================================================
// ===                         ISM330dlc                        ===
// ================================================================
#define TX_BUF_DIM          1000
#define ISM330DLC_I2C_ADD     ISM330DLC_ID // ir a ism330dlc_reg.h linea 123

//      2g 250g/s               XA      YA    ZA    XG     YG     ZG
//const int MPU_OFFSETS[6] = { 1560,  -323,  907,  66,    10,    -4};

//      8g 1000g/s              XA     YA    ZA    XG     YG     ZG

const int MPU_OFFSETS[6] = { 0,  0,  0,  0,    0,    0};


float gyro[3];
float accel[3];
int16 RawAccel[3];
float ares=8.0/32768.0;
float gres=1000.0/32768.0;
float YPR[3]; 

static axis3bit16_t data_raw_acceleration;
static axis3bit16_t data_raw_angular_rate;
static axis1bit16_t data_raw_temperature;
static uint8_t whoamI, rst;
static uint8_t tx_buffer[TX_BUF_DIM];

static int32_t platform_write(void *handle, uint8_t Reg, uint8_t *Bufp,uint16_t len)
{
 I2CWriteBytes(ISM330DLC_I2C_ADD, Reg,len, Bufp);
  return 0;
}

static int32_t platform_read(void *handle, uint8_t Reg, uint8_t *Bufp,uint16_t len)
{
  I2CReadBytes(ISM330DLC_I2C_ADD,Reg, len,Bufp);
  return 0;
}

ism330dlc_ctx_t dev_ctx={.write_reg = platform_write, .read_reg = platform_read};


//Simulate IMU

int yaw;
int pitch;
int roll;
int maxRetry=20;
int counter=0;