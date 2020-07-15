
#include "RV8803.h"


 void RTCsetCountdownTimerEnable(uint8_t timerState)
{
    I2CWriteBit(RV8803_ADDR, RV8803_EXTENSION, EXTENSION_TE, timerState);
	//return writeBit(RV8803_EXTENSION, EXTENSION_TE, timerState);
}

 void RTCsetCountdownTimerFrequency(uint8_t countdownTimerFrequency)
{
    I2CWriteBit(RV8803_ADDR, RV8803_EXTENSION, EXTENSION_TD, countdownTimerFrequency);
    
	//return writeBit(RV8803_EXTENSION, EXTENSION_TD, countdownTimerFrequency);
}
//
 void RTCsetCountdownTimerClockTicks(uint16_t clockTicks)
{
	//First handle the upper bit, as we need to preserve the GPX bits
	//uint8_t value = readRegister(RV8803_TIMER_1);
    uint8_t value;
    I2CReadByte(RV8803_ADDR, RV8803_TIMER_1, &value);
    
	value &= ~(0b00001111); //Clear the least significant nibble
	value |= (clockTicks >> 8);
	//bool returnValue = writeRegister(RV8803_TIMER_1, value);
    
    I2CWriteByte(RV8803_ADDR, RV8803_TIMER_1, value);
    
	value = clockTicks & 0x00FF;
    
	//writeRegister(RV8803_TIMER_0, value);
    I2CWriteByte(RV8803_ADDR, RV8803_TIMER_0, value);

}

void RTCenableHardwareInterrupt(uint8_t source)
{
	//uint8_t value = readregister(rv8803_control);
    uint8_t value;
    I2CReadByte(RV8803_ADDR, RV8803_CONTROL, &value);
	value |= (1<<source); //set the interrupt enable bit
    
	//return writeregister(rv8803_control, value);
     I2CWriteByte(RV8803_ADDR, RV8803_CONTROL, value);
}

  void RTCdisableAllInterrupts()
{
	//uint8_t value = readRegister(RV8803_CONTROL);
    uint8_t value;
    I2CReadByte(RV8803_ADDR, RV8803_CONTROL, &value);
	value &= 1; //Clear all bits except for Reset
	//return writeRegister(RV8803_CONTROL, value);
    I2CWriteByte(RV8803_ADDR, RV8803_CONTROL, value);
}
//
  uint8_t RTCgetInterruptFlag(uint8_t flagToGet)
{
	//uint8_t flag = readRegister(RV8803_FLAG);
    uint8_t flag;
    I2CReadByte(RV8803_ADDR, RV8803_FLAG, &flag);
    
	flag &= (1 << flagToGet);
	flag = flag >> flagToGet;
	return flag;
}
//
//  void RTCclearallinterruptflags() //read the status register to clear the current interrupt flags
//{
//	//return writeregister(RV8803_FLAG, 0b00000000);//write all 0's to clear all flags
//    I2CWriteByte(RV8803_ADDR, RV8803_FLAG, 0b00000000);
//}
void RTCclearInterruptFlag(uint8_t flagToClear)
{
	//uint8_t value = readRegister(RV8803_FLAG);
    uint8_t value;
    I2CReadByte(RV8803_ADDR, RV8803_FLAG, &value);
	value &= ~(1 << flagToClear); //clear flag
	//return writeRegister(RV8803_FLAG, value);
    I2CWriteByte(RV8803_ADDR, RV8803_FLAG, value);
}
