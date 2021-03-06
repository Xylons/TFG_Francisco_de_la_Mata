/******************************************************************************
SparkFun_RV8803.h
RV8803 Arduino Library
Andy England @ SparkFun Electronics
March 3, 2020
https://github.com/sparkfun/Qwiic_RTC

Resources:
Uses Wire.h for i2c operation
Uses SPI.h for SPI operation

Development environment specifics:
Arduino IDE 1.6.4

This code is released under the [MIT License](http://opensource.org/licenses/MIT).
Please review the LICENSE.md file included with this example. If you have any questions 
or concerns with licensing, please contact techsupport@sparkfun.com.
Distributed as-is; no warranty is given.
******************************************************************************/
#include "stdio.h"
#include "I2CFunctions.h"
//The 7-bit I2C address of the RV8803
#define RV8803_ADDR							0x32


//Register names:
#define RV8803_RAM							0x07
#define RV8803_HUNDREDTHS					0x10
#define RV8803_SECONDS						0x11
#define RV8803_MINUTES						0x12
#define RV8803_HOURS						0x13
#define RV8803_WEEKDAYS						0x14
#define RV8803_DATE         				0x15
#define RV8803_MONTHS        				0x16
#define RV8803_YEARS        				0x17
#define RV8803_MINUTES_ALARM     			0x18
#define RV8803_HOURS_ALARM       			0x19
#define RV8803_WEEKDAYS_DATE_ALARM   		0x1A
#define RV8803_TIMER_0						0x1B
#define RV8803_TIMER_1						0x1C
#define RV8803_EXTENSION					0x1D
#define RV8803_FLAG							0x1E
#define RV8803_CONTROL						0x1F
#define RV8803_HUNDREDTHS_CAPTURE			0x20
#define RV8803_SECONDS_CAPTURE				0x21
#define RV8803_OFFSET						0x2C
#define RV8803_EVENT_CONTROL				0x2F

//Enable Bits for Alarm Registers
#define ALARM_ENABLE						7

//Extension Register Bits
#define EXTENSION_TEST						7
#define EXTENSION_WADA						6
#define EXTENSION_USEL						5
#define EXTENSION_TE						4
#define EXTENSION_FD						2
#define EXTENSION_TD						0

//Flag Register Bits
#define FLAG_UPDATE							5
#define FLAG_TIMER							4
#define FLAG_ALARM							3
#define FLAG_EVI							2
#define FLAG_V2F							1
#define FLAG_V1F							0

//Interrupt Control Register Bits
#define UPDATE_INTERRUPT					5
#define TIMER_INTERRUPT						4
#define ALARM_INTERRUPT						3 //
#define EVI_INTERRUPT						2 //External Event Interrupt
#define CONTROL_RESET						0

//Event Control Bits
#define EVENT_ECP							7
#define EVENT_EHL							6
#define EVENT_ET							4
#define EVENT_ERST							0

//Possible Settings
#define TWELVE_HOUR_MODE					true
#define TWENTYFOUR_HOUR_MODE				false
#define COUNTDOWN_TIMER_FREQUENCY_4096_HZ	0b00
#define COUNTDOWN_TIMER_FREQUENCY_64_HZ		0b01
#define COUNTDOWN_TIMER_FREQUENCY_1_HZ		0b10
#define COUNTDOWN_TIMER_FREQUENCY_1/60_HZ	0b11
#define CLOCK_OUT_FREQUENCY_32768_HZ		0b00
#define CLOCK_OUT_FREQUENCY_1024_HZ			0b01
#define CLOCK_OUT_FREQUENCY_1_HZ			0b10

#define COUNTDOWN_TIMER_ON					true
#define COUNTDOWN_TIMER_OFF					false
#define TIME_UPDATE_1_SECOND				false
#define TIME_UPDATE_1_MINUTE				true

#define ENABLE_EVI_CALIBRATION				true
#define DISABLE_EVI_CALIBRATION				false
#define EVI_DEBOUNCE_NONE					0b00
#define EVI_DEBOUNCE_256HZ					0b01
#define EVI_DEBOUNCE_64HZ					0b10
#define EVI_DEBOUNCE_8HZ					0b11
#define RISING_EDGE							true
#define FALLING_EDGE						false
#define EVI_CAPTURE_ENABLE					true
#define EVI_CAPTURE_DISABLE					false

#define ENABLE								true
#define DISABLE								false

#define TIME_ARRAY_LENGTH 8 // Total number of writable values in device

enum time_order {
	TIME_HUNDREDTHS, // 0
	TIME_SECONDS,    // 1
	TIME_MINUTES,    // 2
	TIME_HOURS,      // 3
	TIME_WEEKDAY,	 // 4
	TIME_DATE,       // 5
	TIME_MONTH,      // 6
	TIME_YEAR,       // 7
};

void RTCsetCountdownTimerEnable(uint8_t timerState); //Starts and stops our countdown timer
void RTCsetCountdownTimerClockTicks(uint16_t clockTicks);
void RTCsetCountdownTimerFrequency(uint8_t countdownTimerFrequency);
void RTCenableHardwareInterrupt(uint8_t source); //Enables a given interrupt within Interrupt Enable register
void RTCdisableAllInterrupts();
uint8_t RTCgetInterruptFlag(uint8_t flagToGet);
void RTCclearInterruptFlag(uint8_t flagToClear);
