const i2c = require('i2c-bus');
const struct = require('python-struct');

const EEP_ADDRESS = 0x50;
const I2C_BLOCK = [0x00];
const BLOCK_READ_LENGTH = 29;

async function read(i2cBus = 1) {
  const openI2c = await i2c.openPromisified(i2cBus);
  const { bytesWritten } = await openI2c.writeI2cBlock(EEP_ADDRESS, 0, I2C_BLOCK.length, Buffer.from(I2C_BLOCK));
  console.log(`Wrote ${bytesWritten} byte${bytesWritten === 1 ? '' : 's'} to EEPROM.`);
  const { bytesRead, buffer } = await openI2c.readI2cBlock(EEP_ADDRESS, 0, BLOCK_READ_LENGTH, Buffer.alloc(BLOCK_READ_LENGTH));
  console.log(`Read ${bytesRead} byte${bytesRead === 1 ? '' : 's'} from EEPROM.`);

  const [width, height, color, pcbVariant, displayVariant, writeTime] = struct.unpack('<HHBBB22p', buffer);

  return { width, height, color, pcbVariant, displayVariant, writeTime };
}

module.exports = { read };
