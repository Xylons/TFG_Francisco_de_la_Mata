#include "project.h"

/* Master/Slave control constants */
#define I2C_I2C_WRITE_XFER_MODE    (0u)    /* Write    */
#define I2C_I2C_READ_XFER_MODE     (1u)    /* Read     */
#define I2C_I2C_ACK_ADDR           (0u)    /* Send ACK to address */
#define I2C_I2C_NAK_ADDR           (1u)    /* Send NAK to address */
#define I2C_I2C_ACK_DATA           (0u)    /* Send ACK to data */
#define I2C_I2C_NAK_DATA           (1u)    /* Send NAK to data */

void I2CReadBytes(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint8_t *value);
void I2CReadByte(uint8_t devAddr, uint8_t regAddr, uint8_t *value);
void I2CReadBits(uint8_t devAddr, uint8_t regAddr, uint8_t bitStart, uint8_t length, uint8_t *value);
void I2CReadBit(uint8_t devAddr, uint8_t regAddr, uint8_t bitNum, uint8_t *value);
void I2CWriteBytes(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint8_t *value);
void I2CWriteByte(uint8_t devAddr, uint8_t regAddr, uint8_t value);
void I2CWriteBits(uint8_t devAddr, uint8_t regAddr, uint8_t bitStart, uint8_t length, uint8_t value);
void I2CWriteBit(uint8_t devAddr, uint8_t regAddr, uint8_t bitNum, uint8_t value);
void I2CWriteWords(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint16_t *value);
void I2CWriteWord(uint8_t devAddr, uint8_t regAddr, uint16_t value);