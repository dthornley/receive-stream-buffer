const ReceiveStreamBuffer = require('./receive-stream-buffer');

describe('ReceiveStreamBuffer', () => {
  describe("constructor", () => {
    it('should initialize the class with the correct parameters', () => {
      const logger = {debug: jest.fn()};
      const receiveStreamBuffer = new ReceiveStreamBuffer({logger, bufferSizeIncrement: 1024});
      expect(receiveStreamBuffer.logger).toBe(logger);
      expect(receiveStreamBuffer.bufferSizeIncrement).toBe(1024);
      expect(receiveStreamBuffer.buffer.length).toBe(2048);
      expect(receiveStreamBuffer.bufferUsed).toBe(0);
    });
    it('should throw an error if logger is not provided', () => {
      expect(() => new ReceiveStreamBuffer({})).toThrowError('Missing logger parameter');
    });
  });
  describe("encoding", (done) => {
    it('should write data to the stream with correct encoding', (done) => {
      const logger = {debug: jest.fn()};
      const receiveStreamBuffer = new ReceiveStreamBuffer({logger});
      const data = Buffer.from('test data');
      receiveStreamBuffer.write(data, 'utf-8', () => {
        expect(receiveStreamBuffer.bufferUsed).toBe(data.length);
        expect(receiveStreamBuffer.buffer.slice(0, data.length)).toEqual(data);
        done();
      });
    });
  });
  describe("logging", (done) => {
    it('should check the finished logging when verbose', (done) => {
      const logger = {debug: jest.fn()};
      const receiveStreamBuffer = new ReceiveStreamBuffer({logger, verbose: true});
      const data = Buffer.from('test data');
      receiveStreamBuffer.write(data, 'utf-8', () => {
        receiveStreamBuffer.end(() => {
          expect(logger.debug).toHaveBeenCalledWith(`finished: Collected ${data.length} bytes`);
          done();
        });
      });
    });
    it('should check the finished logging when not verbose', (done) => {
      const logger = {debug: jest.fn()};
      const receiveStreamBuffer = new ReceiveStreamBuffer({logger});
      const data = Buffer.from('test data');
      receiveStreamBuffer.write(data, 'utf-8', () => {
        receiveStreamBuffer.end(() => {
          expect(logger.debug).not.toHaveBeenCalledWith(`finished: Collected ${data.length} bytes`);
          done();
        });
      });
    });
  });
  describe("resize buffer", (done) => {
    it('should resize the buffer to hold incoming data', (done) => {
      const logger = {debug: jest.fn()};
      const receiveStreamBuffer = new ReceiveStreamBuffer({logger, bufferSizeIncrement: 1024});
      const data = Buffer.allocUnsafe(2048);
      receiveStreamBuffer.write(data, 'binary', () => {
        expect(receiveStreamBuffer.bufferUsed).toBe(data.length);
        expect(receiveStreamBuffer.buffer.length).toBe(2048);
        done();
      });
    });
    it('should not throw an error when writing data to the stream that exceeds the initial buffer size', (done) => {
      const logger = {debug: jest.fn()};
      const receiveStreamBuffer = new ReceiveStreamBuffer({logger, bufferSizeIncrement: 1024});
      const data = Buffer.allocUnsafe(4096);
      receiveStreamBuffer.write(data, 'utf-8', () => {
        expect(receiveStreamBuffer.bufferUsed).toBe(data.length);
        expect(receiveStreamBuffer.buffer.length).toBe(4096);
        done();
      });
    });
  });
  describe('get data', () => {
    it('should return the data written to the stream', (done) => {
      const logger = {debug: jest.fn()};
      const receiveStreamBuffer = new ReceiveStreamBuffer({logger});
      const data = Buffer.from('test data');
      receiveStreamBuffer.write(data, 'utf-8', () => {
        expect(receiveStreamBuffer.getData()).toEqual(data);
        done();
      });
    });
  });
  describe('reset data', () => {
    it('should reset the data written to the stream and resize the buffer', (done) => {
      const logger = {debug: jest.fn()};
      const receiveStreamBuffer = new ReceiveStreamBuffer({logger, bufferSizeIncrement: 1024});
      const data = Buffer.allocUnsafe(4096);
      receiveStreamBuffer.write(data, 'utf-8', () => {
        expect(receiveStreamBuffer.bufferUsed).toBe(4096);
        expect(receiveStreamBuffer.buffer.length).toBe(4096);
        receiveStreamBuffer.resetData(() => {
          expect(receiveStreamBuffer.bufferUsed).toBe(0);
          expect(receiveStreamBuffer.buffer.length).toBe(2048);
          done();
        });
      });
    });
  });
});
