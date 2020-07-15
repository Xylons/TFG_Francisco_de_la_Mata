package com.example.org.insole;

public class MahonyAHRS {


    //=====================================================================================================
// MahonyAHRS.c
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

//---------------------------------------------------------------------------------------------------
// Header files

//---------------------------------------------------------------------------------------------------
// Definitions

private float sampleFreq=85.0f;			        // sample frequency in Hz
private float twoKp = (2.0f * 5f);			// 2 * proportional gain (Kp)
private float twoKi = (2.0f * 0.1f);			// 2 * integral gain (Ki)
private float q0 = 1.0f, q1 = 0.0f, q2 = 0.0f, q3 = 0.0f;					// quaternion of sensor frame relative to auxiliary frame
private float integralFBx = 0.0f,  integralFBy = 0.0f, integralFBz = 0.0f;	// integral error terms scaled by Ki


//---------------------------------------------------------------------------------------------------
// IMU algorithm update

public void MahonyAHRSupdateIMU(float gx, float gy, float gz, float ax, float ay, float az)
    {
        float recipNorm;
        float halfvx, halfvy, halfvz;
        float halfex, halfey, halfez;
        float qa, qb, qc;

        // Compute feedback only if accelerometer measurement valid (avoids NaN in accelerometer normalisation)
        if(!((ax == 0.0f) && (ay == 0.0f) && (az == 0.0f)))
        {
            // Normalise accelerometer measurement
            recipNorm = InvSqrt(ax * ax + ay * ay + az * az);
            ax *= recipNorm;
            ay *= recipNorm;
            az *= recipNorm;

            // Estimated direction of gravity and vector perpendicular to magnetic flux
            halfvx = q1 * q3 - q0 * q2;
            halfvy = q0 * q1 + q2 * q3;
            halfvz = q0 * q0 - 0.5f + q3 * q3;

            // Error is sum of cross product between estimated and measured direction of gravity
            halfex = (ay * halfvz - az * halfvy);
            halfey = (az * halfvx - ax * halfvz);
            halfez = (ax * halfvy - ay * halfvx);
//****************** From here on the same algorithm *********************
            // Compute and apply integral feedback if enabled
            if(twoKi > 0.0f)
            {
                integralFBx += twoKi * halfex * (1.0f / sampleFreq);	// integral error scaled by Ki
                integralFBy += twoKi * halfey * (1.0f / sampleFreq);
                integralFBz += twoKi * halfez * (1.0f / sampleFreq);
                gx += integralFBx;	// apply integral feedback
                gy += integralFBy;
                gz += integralFBz;
            }
            else
            {
                integralFBx = 0.0f;	// prevent integral windup
                integralFBy = 0.0f;
                integralFBz = 0.0f;
            }

            // Apply proportional feedback
            gx += twoKp * halfex;
            gy += twoKp * halfey;
            gz += twoKp * halfez;
        }

        // Integrate rate of change of quaternion
        gx *= (0.5f * (1.0f / sampleFreq));		// pre-multiply common factors
        gy *= (0.5f * (1.0f / sampleFreq));
        gz *= (0.5f * (1.0f / sampleFreq));
        qa = q0;
        qb = q1;
        qc = q2;
        q0 += (-qb * gx - qc * gy - q3 * gz);
        q1 += ( qa * gx + qc * gz - q3 * gy);
        q2 += ( qa * gy - qb * gz + q3 * gx);
        q3 += ( qa * gz + qb * gy - qc * gx);

        // Normalise quaternion
        NormalizeQT();
    }

private void	NormalizeQT()
    // Normalise quaternion
    {
        float	recipNorm = InvSqrt(q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3);
        q0 *= recipNorm;
        q1 *= recipNorm;
        q2 *= recipNorm;
        q3 *= recipNorm;
    }


    /** assumes q1 is a normalized quaternion */
//    void ToEuler(Eulers e)
//    {
//        double test = q0*q1 + q2*q3;
//        double sqx = q0*q0;
//        double sqy = q1*q1;
//        double sqz = q2*q2;
//        if (test > 0.499)
//        { // singularity at north pole
//            e[0] = 2 * arctan2(q0,q3);
//            e[1] = M_PI/2;
//            e[2] = 0;
//            return;
//        }
//        if (test < -0.499)
//        { // singularity at south pole
//            e[0] = -2 * arctan2(q0,q3);
//            e[1] = - M_PI/2;
//            e[2] = 0;
//            return;
//        }
//        e[0] = arctan2(2*q1*q3-2*q0*q2 , 1 - 2*sqy - 2*sqz);
//        e[1] = arcsin(2*test);
//        e[2] = arctan2(2*q0*q3-2*q1*q2 , 1 - 2*sqx - 2*sqz);
//    }
//
//    void ToAngle(Eulers e, Eulers a)
//    {
//        int ii;
//        for(ii = 0;ii < 3; ii++)
//        {
//            a[ii] = Angle(e[ii]);
//        }
//    }
    //
//float arcsin(float x)
//{
//	return arctan2(x,sqrt(1-x*x));
//}
//
//float arctan2( float y, float x )
//{
//// max |error| > 0.01
//#define ONEQTR_PI  (M_PI / 4.0)
//#define THRQTR_PI  (3.0 * M_PI / 4.0)
//float r, angle;
//float abSerial_y = fabs(y) + 1e-10f;      // kludge to prevent 0/0 condition
//	if ( x < 0.0f )
//	{
//		r = (x + abSerial_y) / (abSerial_y - x);
//		angle = THRQTR_PI;
//	}
//	else
//	{
//		r = (x - abSerial_y) / (x + abSerial_y);
//		angle = ONEQTR_PI;
//	}
//	angle += (0.1963f * r * r - 0.9817f) * r;
//	if ( y < 0.0f )
//		return( -angle );     // negate if in quad III or IV
//	else
//		return( angle );
//}
//
////---------------------------------------------------------------------------------------------------
//// Fast inverse square-root
//// See: http://en.wikipedia.org/wiki/Fast_inverse_square_root
//
//private float InvSqrt(float x)
//    {
//        long i = 0x5F1F1412 - (*(long*)&x >> 1);
//        float tmp = *(float*)&i;
//        return tmp * (1.69000231f - 0.714158168f * x * tmp * tmp);
//    }
    private float InvSqrt(float x) {
/*    float xhalf = 0.5f * x;
    int i = Float.floatToIntBits(x);
    i = 0x5f3759df - (i >> 1);
    x = Float.intBitsToFloat(i);
    x *= (1.5f - xhalf * x * x);*/
    return (float)(1/Math.sqrt(x));
}

    public double[] getYawRollPitch(){
        double[] YawRollPitch=new double[3];
//        YawRollPitch[0]  = Math.atan2(2.0f * (q1 * q2 + q0 * q3), q0 * q0 + q1 * q1 - q2 * q2 - q3 * q3);
//        YawRollPitch[2]  = -Math.asin(2.0f * (q1 * q3 - q0 * q2));
//        YawRollPitch[1]  =  Math.PI-Math.atan2(2.0f * (q0 * q1 + q2 * q3), q0 * q0 - q1 * q1 - q2 * q2 + q3 * q3);
        YawRollPitch[0] = Math.atan2(q0*q1 + q2*q3, 0.5f - q1*q1 - q2*q2);
        YawRollPitch[1] = Math.asin(-2.0f * (q1*q3 - q0*q2));
        YawRollPitch[2] = Math.atan2(q1*q2 + q0*q3, 0.5f - q2*q2 - q3*q3);

        return YawRollPitch;
    }
//====================================================================================================
// END OF CODE
//====================================================================================================

}
