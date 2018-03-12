const AddressEnum = require('./address');

module.exports = [
  {
    'id': 'Transaction_1',
    'type': 'regular',
    'data': {
      'inputs': [
        {
          'transaction': '0x8c1940cdceae02794f1d73b867b8d83960979fe6ad1cfceed44231c078158453 ',
          'index': '0',
          'amount': 100000,
          'address': AddressEnum.aliceAddress,
          'signature': '031BB778D2AF7C8C974D8086EBB939A9CD00B4762052D4D4A3C8007A037F75E91F'
        },
        {
          'transaction': '0x00904d4c5fb0ac47cbfd159def14a6002641484a683f8175920915e905bbc12c',
          'index': '1',
          'amount': 200000,
          'address': AddressEnum.aliceAddress,
          'signature': '031BB778D2AF7C8C974D8086EBB939A9CD00B4762052D4D4A3C8007A037F75E91F'
        }
    ],
    'outputs': [
        {
          'amount': 11111,
          'address': AddressEnum.bobAddress
        },
        {
          'amount': 44444,
          'address': AddressEnum.bobAddress
        }
      ]
    }
  },
  {
    'id': 'Transaction_2',
    'type': 'regular',
    'data': {
      'inputs': [
        {
          'transaction': '0x78dfe15b951d59603abbc7179a4c1f20acff01db6f3be5df6d596ab782b489f7 ',
          'index': '2',
          'amount': 300000,
          'address': AddressEnum.bobAddress,
          'signature': '23GN923NG3G434GC974GH49G83H4GBW34BGW309GBU5H4WHGREG23G34G4Q3G54HJ5'
        }
    ],
    'outputs': [
        {
          'amount': 97623,
          'address': AddressEnum.aliceAddress
        },
      ]
    }
  },
];
