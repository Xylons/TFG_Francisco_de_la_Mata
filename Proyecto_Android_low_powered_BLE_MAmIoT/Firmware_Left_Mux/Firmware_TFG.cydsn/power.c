/* ========================================
 *
 * Copyright YOUR COMPANY, THE YEAR
 * All Rights Reserved
 * UNPUBLISHED, LICENSED SOFTWARE.
 *
 * CONFIDENTIAL AND PROPRIETARY INFORMATION
 * WHICH IS THE PROPERTY OF your company.
 *
 * ========================================
*/
#ifndef POWER
 #define POWER 1
#include "power.h"
#endif
// ================================================================
// ===               Low Power Implementation                   ===
// ================================================================

void LowPowerImplementation(int8* isCurrentEventProcessed){

    /* For advertising and connected states, implement deep sleep 
     * functionality to achieve low power in the system. For more details
     * on the low power implementation, refer to the Low Power Application 
     * Note.
     */
    if((CyBle_GetState() == CYBLE_STATE_ADVERTISING) || 
       (CyBle_GetState() == CYBLE_STATE_CONNECTED))
    {
        /* Request BLE subsystem to enter into Deep-Sleep mode between connection and advertising intervals */
        bleMode = CyBle_EnterLPM(CYBLE_BLESS_DEEPSLEEP);
        /* Disable global interrupts */
        interruptStatus = CyEnterCriticalSection();
        /* When BLE subsystem has been put into Deep-Sleep mode */
        if(bleMode == CYBLE_BLESS_DEEPSLEEP)
        {
            /* And it is still there or ECO is on */
            if((CyBle_GetBleSsState() == CYBLE_BLESS_STATE_ECO_ON) || 
               (CyBle_GetBleSsState() == CYBLE_BLESS_STATE_DEEPSLEEP))
            {
                *isCurrentEventProcessed=0;
                CySysPmDeepSleep();
            }
        }
        else /* When BLE subsystem has been put into Sleep mode or is active */
        {
            *isCurrentEventProcessed=1;
            /* And hardware doesn't finish Tx/Rx opeation - put the CPU into Sleep mode */
            if(CyBle_GetBleSsState() != CYBLE_BLESS_STATE_EVENT_CLOSE)
            {
                /* change HF clock source from IMO to ECO, as IMO is not required and can be stopped to save power */
                CySysClkWriteHfclkDirect(CY_SYS_CLK_HFCLK_ECO); 
                /* stop IMO for reducing power consumption */
                CySysClkImoStop();              
                /* put the CPU to sleep */
                CySysPmSleep();            
                /* starts execution after waking up, start IMO */
                CySysClkImoStart();
                
                /* change HF clock source back to IMO */
                CySysClkWriteHfclkDirect(CY_SYS_CLK_HFCLK_IMO);

            }
        }
        /* Enable global interrupt */
        CyExitCriticalSection(interruptStatus);

    }
}

/* [] END OF FILE */
