const Crypto = require('crypto');

class CryptoUtil {
  static hash(any) {
    const anyString = typeof any === 'object' ? JSON.stringify(any) : any.toString();
    return Crypto.createHash('sha256').update(anyString).digest('hex');
  }

  static randomId(size = 64) {
    return Crypto.randomBytes(Math.floor(size / 2)).toString('hex');
  }
}

module.exports = CryptoUtil;
