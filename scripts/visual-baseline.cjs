const zlib = require('node:zlib');

function encodeBaselineSample(sample) {
  if (!Buffer.isBuffer(sample) || sample.length === 0) {
    throw new Error('Visual baseline sample must be a non-empty Buffer.');
  }
  return zlib.deflateSync(sample, {level: 9}).toString('base64');
}

function decodeBaselineSample(baseline, expectedLength) {
  let sample;

  if (typeof baseline?.rgbDeflateBase64 === 'string' && baseline.rgbDeflateBase64) {
    try {
      sample = zlib.inflateSync(Buffer.from(baseline.rgbDeflateBase64, 'base64'));
    } catch (error) {
      throw new Error(`Invalid compressed visual baseline: ${error.message}`);
    }
  } else if (typeof baseline?.rgbBase64 === 'string' && baseline.rgbBase64) {
    sample = Buffer.from(baseline.rgbBase64, 'base64');
  } else {
    throw new Error('Visual baseline is missing rgbDeflateBase64/rgbBase64 sample data.');
  }

  if (sample.length !== expectedLength) {
    throw new Error(`Visual baseline sample length mismatch: expected ${expectedLength} bytes, got ${sample.length}.`);
  }

  return sample;
}

module.exports = {encodeBaselineSample, decodeBaselineSample};
