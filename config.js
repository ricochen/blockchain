module.exports = {
  MINING_REWARD: 10000,
  FEE_PER_TRANSACTION: 10,
  TRANSACTIONS_PER_BLOCK: 8,
  genesisBlock: {
    index: 0,
    previousHash: '0',
    timestamp: Date.now(),
    nonce: 0,
    transactions: [
      {
        id: '63ec3ac02f822450039ef13ddf7c3c0f19bab4acd4dc128c62fcd78d5ebc6dba',
        hash: null,
        type: 'regular',
        data: {
          inputs: [],
          outputs: []
        }
      }
    ]
  },
  PoW: {
    getDifficulty: (blocks, index) => {
      const BASE_DIFFICULTY = Number.MAX_SAFE_INTEGER;
      const EVERY_X_BLOCKS = 10;
      const POW_CURVE = 10;

      return Math.max(
        Math.floor(
          BASE_DIFFICULTY / Math.pow(
            Math.floor(((index || blocks.length) + 1) / EVERY_X_BLOCKS) + 1
            , POW_CURVE
          )
        )
      , 0);
    }
  }
};
