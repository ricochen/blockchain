# Blockchain

Basic implementation of a blockchain with Proof of Work consensus

### Intructions

`git clone https://github.com/ricochen/blockchain.git`

`npm install`

`Go to index.js and CTRL + B to run the file, (note you may have to setup your IDE javascript build system)`

`Verify the blockchain works as intended`

### Consensus

- Verification of arriving blocks
- Verification of arriving transactions
- Synchronization of the transaction list
- Synchronization of the block list

**A block is added to the block list if:**

1. The block is the last one (previous index + 1);
2. The previous block is correct (previous hash == block.previousHash)
3. The hash is correct (calculated block hash == block.hash)
4. The difficulty level of the proof-of-work challenge is correct (difficulty at blockchain index n < block difficulty)
5. All transactions inside the block are valid
6. The sum of output transactions are equal the sum of input transactions + 10 coins representing the reward for the block miner
7. Check if there is a double spending in that block
There is only 1 fee transaction and 1 reward transaction

**A transaction inside a block is valid if:**

1. The transaction hash is correct (calculated transaction hash == transaction.hash)
2. The signature of all input transactions are correct (transaction data is signed by the public key of the address)
3. The sum of input transactions are greater than output transactions, it needs to leave some room for the transaction fee
4. The transaction isn’t already in the blockchain
5. All input transactions are unspent in the blockchain

**A transaction is added to the transaction list if:**

1. It’s not already in the transaction list
2. The transaction hash is correct (calculated transaction hash == transaction.hash)
3. The signature of all input transactions are correct (transaction data is signed by the public key of the address)
4. The sum of input transactions are greater than output transactions, it needs to leave some room for the transaction fee
5. The transaction isn’t already in the blockchain
6. All input transactions are unspent in the blockchain

**Assembling a new block:**

The Miner gets the list of pending transactions and creates a new block containing the transactions. By configuration, every block has at most 8 transactions in it.

1. From the list of unconfirmed transaction selected candidate transactions that are not already in the blockchain or is not already selected
2. Get the first two transactions from the candidate list of transactions
3. Add a new transaction containing the fee value to the miner’s address, 10 satoshi per transaction
4. Add a reward transaction containing 10 coins to the miner’s address
5. Prove work for this block
