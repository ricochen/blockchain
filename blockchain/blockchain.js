const Block = require('./block');
const CryptoUtil = require('../util/cryptoUtil');
const Config = require('../config');

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
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
      this.chain.push(nnewBlock);
    }
  }
}

module.exports = Blockchain;
