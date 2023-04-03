/* eslint-disable no-underscore-dangle */
const {Writable} = require('stream');
const {Buffer} = require('buffer');

class ReceiveStreamBuffer extends Writable {
  constructor({
                logger, bufferSizeIncrement = 10 * 1024 * 1024, verbose = false, ...options
              }) {
    super(options);
    this.fd = null;
    if (!logger) {
      throw new Error('Missing logger parameter');
    }
    this.logger = logger;
    this.verbose = verbose;
    this.bufferSizeIncrement = bufferSizeIncrement;
    this.init()
  }

  init() {
    this.buffer = Buffer.allocUnsafe(2 * this.bufferSizeIncrement);
    this.bufferLength = 2 * this.bufferSizeIncrement;
    this.bufferUsed = 0;
  }
  _construct(callback) {
    callback();
  }

  _write(chunk, encoding, callback) {
    if (encoding !== 'buffer') {
      callback(new Error(`Unexpected encoding ${encoding}`));
    } else {
      while (chunk.length + this.bufferUsed > this.bufferLength) {
        const origBuffer = this.buffer;
        const origBufferLength = this.buffer.length;
        this.buffer = Buffer.allocUnsafe(this.bufferLength + this.bufferSizeIncrement);
        this.bufferLength += this.bufferSizeIncrement;
        if (this.verbose) {
          this.logger.debug(`grow buffer: old size=${origBufferLength}, needed=${chunk.length + this.bufferUsed}, new size=${this.bufferLength}`);
        }
        origBuffer.copy(this.buffer, 0, 0, this.bufferUsed);
      }
      chunk.copy(this.buffer, this.bufferUsed);
      this.bufferUsed += chunk.length;
      callback();
    }
  }

  _final(callback) {
    if (this.verbose) {
      this.logger.debug(`finished: Collected ${this.bufferUsed} bytes`);
    }
    callback(null);
  }

  getData() {
    return this.buffer.subarray(0, this.bufferUsed);
  }

  resetData(callback) {
    this.buffer.fill(0);
    this.init();
    callback();
  }
}

module.exports = ReceiveStreamBuffer;
