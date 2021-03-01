const Rpio = require('rpio');
const fs = require('fs');
const sharp = require('sharp');
const { getFilledArray } = require('./utils');
const { WHITE, BLACK } = require('./colors');

const DC_PIN = 22;
const RESET_PIN = 27;
const BUSY_PIN = 17;

const BUSY_TIMEOUT = 5;

class Inky {
  constructor([width, height], color) {
    this.width = width;
    this.height = height;
    this.buffer = getFilledArray(this.width, this.height);
    this.color = color;

    Rpio.init({ gpiomem: false, mapping: 'gpio' });
    Rpio.open(DC_PIN, Rpio.OUTPUT, Rpio.LOW);
    Rpio.pud(DC_PIN, Rpio.PULL_OFF);
    Rpio.open(RESET_PIN, Rpio.OUTPUT, Rpio.HIGH);
    Rpio.pud(RESET_PIN, Rpio.PULL_OFF);
    Rpio.open(BUSY_PIN, Rpio.INPUT, Rpio.PULL_OFF);

    this.gpio = {
      LOW: Rpio.LOW,
      HIGH: Rpio.HIGH,
      DC_PIN,
      RESET_PIN,
      BUSY_PIN,
      write: Rpio.write,
      read: Rpio.read,
      sleep: Rpio.sleep
    };

    Rpio.spiBegin();
    Rpio.spiChipSelect(0);
    Rpio.spiSetClockDivider(512);

    this.spi = {
      write: Rpio.spiWrite
    };

    this.gpio.write(this.gpio.RESET_PIN, this.gpio.LOW);
    this.gpio.sleep(0.5);
    this.gpio.write(this.gpio.RESET_PIN, this.gpio.HIGH);
    this.gpio.sleep(0.5);

    this._sendCommand(0x12); // soft reset
    this._busyWait();
  }

  show() {
    throw new Error('show() should be overridden in child class.');
  }

  setPixel(x, y, color) {
    // TODO validate color
    this.buffer[y][x] = color;
  }

  setRect(topLeftX, topLeftY, width, height, color) {
    for (let x = topLeftX; x < topLeftX + width; x++) {
      for (let y = topLeftY; y < topLeftY + height; y++) {
        this.setPixel(x, y, color);
      }
    }
  }

  async setImage(imagePath) {
    const whiteRgb = { r: 255, g: 255, b: 255 };

    const img = await sharp(imagePath)
      .resize(this.width, this.height, { fit: sharp.fit.contain, background: { ...whiteRgb, alpha: 1 } })
      .flatten({ background: whiteRgb }) // merge alpha channel
      .threshold() // convert to black / white
      .raw()
      .toBuffer();

    for (let i = 0; i < img.length; i += 3) {
      const x = (i / 3) % this.width;
      const y = Math.floor((i / 3) / this.width);

      this.setPixel(x, y, img[i] ? WHITE : BLACK);
    }
  }

  getLookUpTable(color) {
    throw new Error('getLookUpTable() should be overridden in child class.');
  }

  _sendCommand(command, data) {
    this.gpio.write(this.gpio.DC_PIN, this.gpio.LOW);

    const commandTxBuf = Buffer.from([command]);
    this.spi.write(commandTxBuf, commandTxBuf.length);

    if (data) {
      this.gpio.write(this.gpio.DC_PIN, this.gpio.HIGH);

      const dataTxBuf = Buffer.from(data);
      this.spi.write(dataTxBuf, dataTxBuf.length);
    }
  }

  _busyWait() {
    const startTime = Date.now();

    while (this.gpio.read(this.gpio.BUSY_PIN)) {
      this.gpio.sleep(0.01);

      if (Date.now() - startTime >= BUSY_TIMEOUT * 1000) {
        throw new Error(`Display failed to idle after ${BUSY_TIMEOUT} seconds.`);
      }
    }
  }
}

module.exports = Inky;
