const Blockchain = require('./blockchain/blockchain');
const Block = require('./blockchain/block');
const Transaction = require('./blockchain/transaction');
const Miner = require('./miner/miner');
const AddressEnum = require('./enums/address');
const TransactionEnum = require('./enums/transaction');

const blockchain = new Blockchain();
const miner = new Miner(blockchain);

const transaction1 = new Transaction(TransactionEnum[0]);
const transaction2 = new Transaction(TransactionEnum[1]);

if (!blockchain.getTransactionById(transaction1.id)) {
  blockchain.addTransaction(transaction1);
}

if (!blockchain.getTransactionById(transaction2.id)) {
  blockchain.addTransaction(transaction2);
}
console.log('There should be 2 pending transactions:', blockchain.getAllTransactions());

const newBlock = miner.mine(AddressEnum.rewardAddress, AddressEnum.feeAddress);
blockchain.addBlock(newBlock);
console.log('The new block added to the blockchain should have transaction1, transaction2, fee and reward transaction', blockchain.getLastBlock());
