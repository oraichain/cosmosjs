<!-- TOTAL-DOWNLOADS-BADGE:START - Do not remove or modify this section -->
<!-- [![NPM Downloads](https://img.shields.io/npm/dt/@oraitation/oraijs.svg)](https://www.npmjs.com/package/@oraitation/oraijs) -->
<!-- TOTAL-DOWNLOADS-BADGE:END -->

## Installation

In order to fully use this library, you need to run a local or remote full node and set up its rest server, which acts as an intermediary between the front-end and the full-node

## Import

```js
import { Cosmos } from './src/index.js';
```

## Usage

- You need to import Protobuf message file as js. It is created by using `make proto-js` from [orai](https://github.com/oraichain/orai).

```js
import message from './src/messages/proto';
```

- Generate orai address from mnemonic

```js
const mnemonic = '...';
const chainId = 'stargate-final';
const cosmos = new Cosmos(lcdUrl, chainId);

cosmos.setPath("m/44'/118'/0'/0/0");
const address = cosmos.getAddress(mnemonic);
```

Generate both privKey and pubKeyAny that are needed for signing.

```js
const privKey = cosmos.getECPairPriv(mnemonic);
const pubKeyAny = cosmos.getPubKeyAny(privKey);
```

Transfer Orai to designated address.

- Make sure to input proper type, account number, and sequence of the orai account to generate protobuf structure. You can get those account information on blockchain. Protobuf signing is different from Amino signing.

```js
cosmos.getAccounts(address).then(data => {
	// signDoc = (1)txBody + (2)authInfo
	// ---------------------------------- (1)txBody ----------------------------------
	const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
		from_address: address,
		to_address: "orai1jf874x5vr6wkza6ahvamck4sy4w76aq4w9c4s5",
		amount: [{ denom: "orai", amount: String(100000) }]
	});

	const msgSendAny = new message.google.protobuf.Any({
		type_url: "/cosmos.bank.v1beta1.MsgSend",
		value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
	});

	const txBody = new message.cosmos.tx.v1beta1.TxBody({ messages: [msgSendAny], memo: "" });

	// --------------------------------- (2)authInfo ---------------------------------
	const signerInfo = new message.cosmos.tx.v1beta1.SignerInfo({
		public_key: pubKeyAny,
		mode_info: { single: { mode: message.cosmos.tx.signing.v1beta1.SignMode.SIGN_MODE_DIRECT } },
		sequence: data.account.sequence
	});

	const feeValue = new message.cosmos.tx.v1beta1.Fee({

		gas_limit: 200000
	});

	const authInfo = new message.cosmos.tx.v1beta1.AuthInfo({ signer_infos: [signerInfo], fee: feeValue });

	...
});
```

Sign transaction by using stdSignMsg and broadcast by using [/txs](http://localhost:1317/cosmos/tx/v1beta1/txs) REST API

```js
const signedTxBytes = cosmos.sign(
  txBody,
  authInfo,
  data.account.account_number,
  privKey
);
cosmos.broadcast(signedTxBytes).then((response) => console.log(response));
```

## Supporting Message Types (Updating...)

We will continue to update the protobuf signing structure.

## Documentation

This library is simple and easy to use. We don't have any formal documentation yet other than examples. Ask for help if our examples aren't enough to guide you

## Contribution

- Contributions, suggestions, improvements, and feature requests are always welcome

When opening a PR with a minor fix, make sure to add #trivial to the title/description of said PR.

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
