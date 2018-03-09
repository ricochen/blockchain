const CryptoUtil = require('../util/cryptoUtil');
const Config = require('../config');

/*
Transaction structure:
{ // Transaction
    "id": "84286bba8d...7477efdae1", // random id (64 bytes)
    "hash": "f697d4ae63...c1e85f0ac3", // hash taken from the contents of the transaction: sha256 (id + data) (64 bytes)
    "type": "regular", // transaction type (regular, fee, reward)
    "data": {
        "inputs": [ // Transaction inputs
            {
                "transaction": "9e765ad30c...e908b32f0c", // transaction hash taken from a previous unspent transaction output (64 bytes)
                "index": "0", // index of the transaction taken from a previous unspent transaction output
                "amount": 5000000000, // amount of satoshis
                "address": "dda3ce5aa5...b409bf3fdc", // from address (64 bytes)
                "signature": "27d911cac0...6486adbf05" // transaction input hash: sha256 (transaction + index + amount + address) signed with owner address's secret key (128 bytes)
            }
        ],
        "outputs": [ // Transaction outputs
            {
                "amount": 10000, // amount of satoshis
                "address": "4f8293356d...b53e8c5b25" // to address (64 bytes)
            },
            {
                "amount": 4999989999, // amount of satoshis
                "address": "dda3ce5aa5...b409bf3fdc" // change address (64 bytes)
            }
        ]
    }
}
*/

class Transaction {
  constructor({id, hash, type, data}) {
    Object.assign(this, {id, hash, type});
    this.data = data || {
      inputs: [],
      outputs: []
    };
  }

  toHash() {
    return CryptoUtil.hash(this.id + this.type + JSON.stringify(this.data));
  }

  check() {
    if (this.hash !== this.toHash()) {
      throw new Error(`Invalid transaction hash '${this.hash}'`, this);
      return false;
    }

    this.data.inputs.forEach(txInput => {
      const txInputHash = CryptoUtil.hash({
        transaction: txInput.transaction,
        index: txInput.index,
        address: txInput.address
      });
      const isValidSignature = CryptoEdDSAUtil.verifySignature(txInput.address, txInput.signature, txInputHash);

      if (!isValidSignature) {
        throw new Error(`Invalid transaction input signature '${JSON.stringify(txInput)}'`);
      }
    });

    if (this.type === 'regular') {
      let sumOfInputsAmount = 0;
      this.data.inputs.forEach(txInput => sumOfInputsAmount += txInput.amount);

      let sumOfOutputsAmount = 0;
      this.data.outputs.forEach(txInput => sumOfOutputsAmount += txInput.amount);

      if (sumOfInputsAmount >= sumOfOutputsAmount) {
        throw new Error(`Invalid transaction balance: inputs sum '${sumOfInputsAmount}', outputs sum '${sumOfOutputsAmount}'`);
        return false;
      }

      const isEnoughFee = (sumOfInputsAmount - sumOfOutputsAmount) >= Config.FEE_PER_TRANSACTION;

      if (!isEnoughFee) {
        throw new Error(`Not enough fee: expected '${Config.FEE_PER_TRANSACTION}' got '${(sumOfInputsAmount - sumOfOutputsAmount)}'`);
        return false;
      }
    }

    return true;
  }
}

module.exports = Transaction;
