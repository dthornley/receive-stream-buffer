
# Receive Stream Buffer

Receive Stream Buffer is a simple module that will combine all the data
from a receive stream into a single buffer. The data in the buffer can then
be extracted and used as a string or a buffer.

The buffer stream can be reset which will clear the data and resize it
back to its initial size.

An object can be passed to the constructor containing options for this
class or the underlying buffer object.

Options specific to this class that can be passed to the constructor are:

- logger: what to use to log output (required)
- verbose: should we log anything (default: false)
- bufferSizeIncrement: By how much should the buffer increase if there
is not enough space (default: 10 MB)

Other buffer specific options can be passed as well but this code has only
been tested with the default options.

Example usage:

```js
const ReceiveStreamBuffer = require('buffer-write-stream/write-stream-buffer');

const bufferStream = new ReceiveStreamBuffer({ logger: console, verbose: false, bufferSizeIncrement: 10 * 1024 * 1024 });

inputStream.pipe(bufferStream)
  .on('finish', () => {
    const buf = bufferStream.getData();

    // Do something with buf

    bufferStream.resetData(); // or let it go out of scope and it will be garbage collected

  });

```

Currently being used to buffer data being streamed to a process. Using the buffer
allows large continuous writes to disk instead of many small writes for each chunk. 
