const Config = require('../config');
const CryptoUtil = require('../util/cryptoUtil');
const Block = require('./block');
const Transaction = require('./transaction');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.transactions = [];
  }

  createGenesisBlock() {
    const genesisBlock = new Block(Config.genesisBlock);
    genesisBlock.hash = genesisBlock.toHash();
    return genesisBlock;
  }

  getAllBlocks() {
    return this.chain;
  }

  getBlockByIndex(index) {
    return this.chain.find(block => block.index === index);
  }

  getBlockByHash(hash) {
    return this.chain.find(block => block.hash === hash);
  }

  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  getDifficulty(index) {
    return Config.PoW.getDifficulty(this.chain, index);
  }

  getAllTransactions() {
    return this.transactions;
  }

  getTransactionById(id) {
    return this.transactions.find(transaction => transaction.id === id);
  }

  getTransactionFromBlocks(transactionId) {
    for (const block of this.chain) {
      return block.transactions.find(transaction => transaction.id === transactionId);
    }
  }

  replaceChain(newBlockchain) {
    if (newBlockchain.length <= this.chain.length) {
      throw new Error('Blockchain shorter than the current blockchain');
    }

    this.isValidChain(newBlockchain);
    console.info('Received blockchain is valid. Replacing current blockchain with received blockchain');

    const newBlocksIndex = newBlockchain.length - (newBlockchain.length - this.chain.length);
    for (let i = newBlocksIndex; i < newBlockchain.length; i++) {
      this.addBlock(newBlockchain[i]);
    }
  }

  isValidChain(blockchainToValidate) {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(this.chain[0])) {
      throw new Error('Genesis blocks aren\'t the same');
    }

    try {
      for (let i = 1; i < blockchainToValidate.length; i++) {
        this.isValidBlock(blockchainToValidate[i], blockchainToValidate[i - 1]);
      }
    } catch (ex) {
      throw new Error('Invalid block sequence', null, ex);
    }

    return true;
  }

  isValidBlock(newBlock, previousBlock) {
    if (newBlock.index !== previousBlock.index + 1) {
      throw new Error(`Invalid index: expected '${previousBlock.index + 1}' got '${newBlock.index}'`);
      return false;
    } else if (newBlock.previousHash !== previousBlock.hash) {
      throw new Error(`Invalid previoushash: expected '${previousBlock.hash}' got '${newBlock.previousHash}'`);
      return false;
    } else if (newBlock.hash !== newBlock.toHash()) {
      throw new Error(`Invalid hash: expected '${newBlock.toHash()}' got '${newBlock.hash}'`);
      return false;
    }

    newBlock.transactions.forEach(transaction => this.isValidTransaction(transaction));

    let sumOfInputsAmount = Config.MINING_REWARD;
    let sumOfOutputsAmount  = 0;

    newBlock.transactions.forEach(transaction => {
      transaction.data.inputs.forEach(txInput => sumOfInputsAmount += txInput.amount);
      transaction.data.outputs.forEach(txOutput => sumOfOutputsAmount += txOutput.amount);
    });

    if (sumOfInputsAmount < sumOfOutputsAmount) {
      throw new Error(`Invalid block balance: inputs sum '${sumOfInputsAmount}', outputs sum '${sumOfOutputsAmount}'`);
    }

    let doubleSpending = false;
    const transactionInputs = {};
    for (const transaction of newBlock.transactions) {
      for (const transactionInput of transaction.data.inputs) {
        const transactionHash = transactionInput.transaction;
        const transactionIndex = transactionInput.index;
        if (transactionInputs[transactionHash] && transactionInputs[transactionHash] === transactionIndex) {
          doubleSpending = true;
          break;
        }
        transactionInputs[transactionHash] = transactionIndex;
      }
    }

    if (doubleSpending) {
      throw new Error(`There are unspent output transactions being used more than once: unspent output transaction: '${transactionInputs}'`);
    }

    let transactionsTypeFee = 0;
    let transactionsTypeReward = 0;

    for (const transaction of newBlock.transactions) {
      if (transactionsTypeFee > 1 && transactionsTypeReward > 1) {
        break;
      }
      if (transaction.type === 'fee') {
        transactionsTypeFee++;
      } else if (transaction.type === 'reward') {
        transactionsTypeReward++;
      }
    }

    if (transactionsTypeFee > 1) {
      throw new Error(`Invalid fee transaction count: expected '1' got '${transactionsTypeFee}'`);
    }

    if (transactionsTypeReward > 1) {
      throw new Error(`Invalid reward transaction count: expected '1' got '${transactionsTypeReward}'`);
    }


    return true;
  }

  addBlock(newBlock) {
    if (this.isValidBlock(newBlock, this.getLastBlock())) {
      this.chain.push(newBlock);

      this.removeBlockTransactionsFromTransactions(newBlock);

      console.info(`Block added: ${newBlock.hash}`);
    }
  }

  addTransaction(newTransaction) {
    if (this.isValidTransaction(newTransaction)) {
      this.transactions.push(newTransaction);

      console.info(`Transaction added: ${newTransaction.id}`);
    }
  }

  removeBlockTransactionsFromTransactions(newBlock) {
    const transactionsToRemove = newBlock.transactions.map(transaction => transaction.id);

    this.transactions = this.transactions.filter(transaction =>
      !transactionsToRemove.includes(transaction.id)
    );
  }

  isValidTransaction(transaction) {
    if (!transaction.check()) {
      return false;
    }

    const transactionIds = this.chain.map(block =>
      block.transactions.map(transaction => transaction.id).join()
    );
    const transactionIsInBlockchain = transactionIds.includes(transaction.id);

    if (transactionIsInBlockchain) {
      throw new Error(`Transaction '${transaction.id}' is already in the blockchain`, transaction);
    }

    const uniqueTransactionInputs = {};
    this.chain.forEach(block => {
      block.transactions.forEach(tx => {
        tx.data.inputs.forEach(txInput => {
          uniqueTransactionInputs[txInput.transaction] = txInput.index;
        });
      });
    });

    let transactionIsSpent = false;
    for (const txInput of transaction.data.inputs) {
      if (transactionIsSpent) {
        break;
      }

      const duplicateTxInput = uniqueTransactionInputs[txInput.transaction];
      if (duplicateTxInput && duplicateTxInput === txInput.index) {
        transactionIsSpent = true;
      }
    }

    if (transactionIsSpent) {
      throw new Error(`Not all inputs are unspent for transaction '${transaction.id}'`, transaction.data.inputs);
    }

    return true;
  }
}

module.exports = Blockchain;
