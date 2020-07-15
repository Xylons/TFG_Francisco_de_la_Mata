#include "I2CFunctions.h"


void I2CReadBytes(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint8_t *value) {
	uint8_t i=0;
    int ms=0;
	I2C_I2CMasterSendStart(devAddr, I2C_I2C_WRITE_XFER_MODE,ms);
	I2C_I2CMasterWriteByte(regAddr,ms);

	I2C_I2CMasterSendRestart(devAddr, I2C_I2C_READ_XFER_MODE,ms);
	while (i++ < (length-1)) {
		I2C_I2CMasterReadByte(I2C_I2C_ACK_DATA,value++,ms);
	}
	I2C_I2CMasterReadByte(I2C_I2C_NAK_DATA,value,ms);
	I2C_I2CMasterSendStop(ms);	
}

void I2CReadByte(uint8_t devAddr, uint8_t regAddr, uint8_t *value) {
	I2CReadBytes(devAddr, regAddr, 1, value);
}

void I2CReadBits(uint8_t devAddr, uint8_t regAddr, uint8_t bitStart, uint8_t length, uint8_t *value) {
   	uint8_t mask = ((1 << length) - 1) << (bitStart - length + 1);
    I2CReadByte(devAddr, regAddr, value);
    *value &= mask;
    *value >>= (bitStart - length + 1);
}

void I2CReadBit(uint8_t devAddr, uint8_t regAddr, uint8_t bitNum, uint8_t *value) {
	I2CReadByte(devAddr, regAddr, value);
	*value = *value & (1 << bitNum);
}

void I2CWriteBytes(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint8_t *value) {
	uint8_t i=0;
    int ms=0;
	I2C_I2CMasterSendStart(devAddr, I2C_I2C_WRITE_XFER_MODE,ms);
	I2C_I2CMasterWriteByte(regAddr,ms);
	while (i++ < length) {
		I2C_I2CMasterWriteByte(*value++,ms);
	}
	I2C_I2CMasterSendStop(ms);	
}

void I2CWriteByte(uint8_t devAddr, uint8_t regAddr, uint8_t value) {
	I2CWriteBytes(devAddr, regAddr, 1, &value);
}

void I2CWriteBits(uint8_t devAddr, uint8_t regAddr, uint8_t bitStart, uint8_t length, uint8_t value) {
	uint8_t b;
	uint8_t mask = ((1 << length) - 1) << (bitStart - length + 1);
	I2CReadByte(devAddr, regAddr, &b);
	value <<= (bitStart - length + 1);
	value &= mask;
	b &= ~(mask);
	b |= value;
	I2CWriteByte(devAddr, regAddr, b);	
}

void I2CWriteBit(uint8_t devAddr, uint8_t regAddr, uint8_t bitNum, uint8_t value) {
	uint8_t b;
	I2CReadByte(devAddr, regAddr, &b);
	b = (value != 0) ? (b | (1 << bitNum)) : (b & ~(1 << bitNum));
	I2CWriteByte(devAddr, regAddr, b);
}

void I2CWriteWords(uint8_t devAddr, uint8_t regAddr, uint8_t length, uint16_t *value) {
	uint8_t i=0;
	I2C_I2CMasterSendStart(devAddr, I2C_I2C_WRITE_XFER_MODE,0);
	I2C_I2CMasterWriteByte(regAddr,0);
	while (i++ < length) {
		I2C_I2CMasterWriteByte(((uint8_t)*value) >> 8,0);
		I2C_I2CMasterWriteByte((uint8_t)*value++,0);
	}
	I2C_I2CMasterSendStop(0);		
}

void I2CWriteWord(uint8_t devAddr, uint8_t regAddr, uint16_t value) {
	I2CWriteWords(devAddr, regAddr, 1, &value);
}
