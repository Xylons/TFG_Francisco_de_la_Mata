//=====================================================================================================
// MahonyAHRS.h
//=====================================================================================================
//
// Madgwick's implementation of Mayhony's AHRS algorithm.
// See: http://www.x-io.co.uk/node/8#open_source_ahrSerial_and_imu_algorithms
//
// Date			Author			Notes
// 29/09/2011	SOH Madgwick    Initial release
// 02/10/2011	SOH Madgwick	Optimised for reduced CPU load
//
//=====================================================================================================
#include "math.h"

#ifndef MahonyAHRSerial_h
#define MahonyAHRS_h
	
#define Angle(x) (x/M_PI * 180.0)
	
//typedef float MyFloat;
	
typedef float Eulers[3];	

//----------------------------------------------------------------------------------------------------
// Variable declaration

extern volatile float twoKp;			// 2 * proportional gain (Kp)
extern volatile float twoKi;			// 2 * integral gain (Ki)
extern volatile float q0, q1, q2, q3;	// quaternion of sensor frame relative to auxiliary frame

//---------------------------------------------------------------------------------------------------
// Function declarations

void MahonyAHRSupdate(float gx, float gy, float gz, float ax, float ay, float az, float mx, float my, float mz);
void MahonyAHRSupdateIMU(float gx, float gy, float gz, float ax, float ay, float az);
void ToEuler(Eulers e);
void ToAngle(Eulers e, Eulers a);
void YawRollPitch(float RollPitchYaw[3]);
//float arcsin(float x);
//float arctan2( float y, float x );
#endif
//=====================================================================================================
// End of file
//=====================================================================================================
