const Block = require('../blockchain/block');
const CryptoUtil = require('../util/cryptoUtil');
const Transaction = require('../blockchain/transaction');
const Config = require('../config');

class Miner {
  constructor(blockchain, logLevel) {
    this.blockchain = blockchain;
    this.logLevel = logLevel;
  }

  mine(rewardAddress, feeAddress) {
    const newBlock = Miner.generateNextBlock(rewardAddress, feeAddress, this.blockchain);

    return Miner.proveWorkFor(newBlock, this.blockchain.getDifficulty());
  }

  static generateNextBlock(rewardAddress, feeAddress, blockchain) {
    const uniqueTransactionInputs = {};
    blockchain.getAllBlocks().forEach(block =>{
      block.transactions.forEach(tx => {
        tx.data.inputs.forEach(txInput => {
          uniqueTransactionInputs[txInput.transaction] = txInput.index;
        });
      });
    });

    const validTransactions = [];
    const nonValidTransactions = [];
    blockchain.getAllTransactions().forEach(transaction => {
      let uniqueTransactionInput = true;

      for (const txInput of transaction.data.inputs) {
        if (!uniqueTransactionInput) {
          break;
        }

        const duplicateTxInput = uniqueTransactionInputs[txInput.transaction];
        if (duplicateTxInput && duplicateTxInput === txInput.index) {
          uniqueTransactionInput = false;
        }

        uniqueTransactionInputs[txInput.transaction] = txInput.index;
      }

      if (uniqueTransactionInput) {
        validTransactions.push(transaction);
      } else {
        nonValidTransactions.push(transaction);
      }
    });

    console.info(`Selected ${validTransactions.length} candidate transactions with ${nonValidTransactions.length} being rejected.`);

    const transactions = [];
    for (let i = 0; i < validTransactions.length && i < Config.TRANSACTIONS_PER_BLOCK; i++) {
      transactions.push(validTransactions[i]);
    }

    if (transactions.length > 0) {
      const feeTransaction = new Transaction({
        id: CryptoUtil.randomId(64),
        hash: null,
        type: 'fee',
        data: {
          inputs: [],
          outputs: [
            {
              amount: Config.FEE_PER_TRANSACTION * transactions.length,
              address: feeAddress
            }
          ]
        }
      });

      transactions.push(feeTransaction);
    }

    if (rewardAddress != null) {
      let rewardTransaction = new Transaction({
        id: CryptoUtil.randomId(64),
        hash: null,
        type: 'reward',
        data: {
          inputs: [],
          outputs: [
            {
              amount: Config.MINING_REWARD,
              address: rewardAddress
            }
          ]
        }
      });

      transactions.push(rewardTransaction);
    }

    const previousBlock = blockchain.getLastBlock();
    const index = previousBlock.index + 1;
    const previousHash = previousBlock.hash;
    const timestamp = new Date().getTime() / 1000;

    return new Block({
      index,
      nonce: 0,
      previousHash,
      timestamp,
      transactions
    });
  }

  static proveWorkFor(jsonBlock, difficulty) {
    let blockDifficulty = null;
    const start = process.hrtime();
    const block = new Block(jsonBlock);

    do {
      block.timestamp = new Date().getTime() / 1000;
      block.nonce++;
      block.hash = block.toHash();
      blockDifficulty = block.getDifficulty();
    } while (blockDifficulty >= difficulty);
      console.info(`Block found: time '${process.hrtime(start)[0]} sec' dif '${difficulty}' hash '${block.hash}' nonce '${block.nonce}'`);
      return block;
  }
}

module.exports = Miner;
