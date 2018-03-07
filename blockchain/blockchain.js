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

  getLastBlock() {
    return this.chain[this.chain.length - 1];
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

    // TO DO: Verify if all input transactions are unspent in the blockchain


    return true;
  }
}

module.exports = Blockchain;
