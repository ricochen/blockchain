const CryptoJS = require('crypto-js');

class CryptoUtil {
    static hash(any) {
        const anyString = typeof any === 'object' ? JSON.stringify(any) : any.toString();
        return CryptoJS.SHA256(anyString);
    }
}

module.exports = CryptoUtil;
