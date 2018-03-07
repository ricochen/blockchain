const elliptic = require('elliptic');
const EdDSA = elliptic.eddsa;
const ec = new EdDSA('ed25519');

class CryptoEdDSAUtil {
  static verifySignature(publicKey, signature, messageHash) {
    let key = ec.keyFromPublic(publicKey, 'hex');
    let verified = key.verify(messageHash, signature);
    console.debug(`Verified: ${verified}`);
    return verified;
  }
}

module.exports = CryptoEdDSAUtil;
