<!-- TOTAL-DOWNLOADS-BADGE:START - Do not remove or modify this section -->
[![NPM Downloads](https://img.shields.io/npm/dt/@cosmostation/cosmosjs.svg)](https://www.npmjs.com/package/@cosmostation/cosmosjs)
<!-- TOTAL-DOWNLOADS-BADGE:END -->

<p align="center">
  <a href="https://www.cosmostation.io" target="_blank" rel="noopener noreferrer"><img width="100" src="https://user-images.githubusercontent.com/20435620/55696624-d7df2e00-59f8-11e9-9126-edf9a40b11a8.png" alt="Cosmostation logo"></a>
</p>
<h1 align="center">
    CosmosJS - Cosmos JavaScript Library 
</h1>

*:star: Was developed: [Cosmostation](https://www.cosmostation.io/)*

*:star: Is developing: [Oraichain](https://orai.io/)*

*;star: Will develop: The community*

A JavasSript Open Source Library for [Oraichain](https://orai.io/), [Cosmos Network](https://cosmos.network/) and other Cosmos based networks using the latest Cosmos SDK Stargate version upgrade.

This library supports cosmos address generation and verification. It enables you to create an offline signature functions of different types of transaction messages. It will eventually support all the other blockchains that are based on Tendermint in the future.

[![License]](https://www.npmjs.com/package/@oraichain/cosmosjs)
[![Latest Stable Version]](https://www.npmjs.com/package/@oraichain/cosmosjs)
[![NPM Downloads]](https://www.npmjs.com/package/@oraichain/cosmosjs)

## Installation

In order to fully use this library, you need to run a local or remote full node and set up its rest server, which acts as an intermediary between the front-end and the full-node

### NPM (Amino)

```bash
npm install @oraichain/cosmosjs
```

### Yarn (Amino)

```bash
yarn add @oraichain/cosmosjs
```

## Import 

#### NodeJS

```js
const Cosmos = require("@oraichain/cosmosjs");
```

#### ES6 module
```js
import Cosmos from "@oraichain/cosmosjs";
```

## Usage
- Cosmos: Generate Cosmos address from mnemonic 
```js
import Cosmos from '@oraichain/cosmosjs';

const lcdUrl = "http://localhost:1317";
const chainId = "Oraichain";
const mnemonic = "foo bar";
const toAddr = "orai1x6xl5kls4xkmkv3rst5tndmxtqt0u8dxhnw7cg";

const message = Cosmos.message;
const cosmos = new Cosmos(lcdUrl, chainId);

cosmos.setBech32MainPrefix('orai');
const childKey = cosmos.getChildKey(mnemonic);
const address = cosmos.getAddress(mnemonic);
```

Transfer ORAI to designated address.
```js
const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
    from_address: cosmos.getAddress(childKey),
    to_address: toAddr,
    amount: [{ denom: cosmos.bech32MainPrefix, amount: String(argv.amount) }] // 10
});

const msgSendAny = new message.google.protobuf.Any({
    type_url: '/cosmos.bank.v1beta1.MsgSend',
    value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
});

const txBody = new message.cosmos.tx.v1beta1.TxBody({
    messages: [msgSendAny],
    memo: ''
});

try {
    const response = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK', isNaN(argv.fees) ? 0 : parseInt(argv.fees));
    console.log(response);
} catch (ex) {
    console.log(ex);
}
```

## Supporting Message Types (Updating...)
- If you need more message types, you can see [/docs/msg_types](https://github.com/cosmostation/cosmosjs/tree/master/docs/msg_types)

## Documentation

This library is simple and easy to use. We don't have any formal documentation yet other than examples. Ask for help if our examples aren't enough to guide you

## Contribution

- Contributions, suggestions, improvements, and feature requests are always welcome

When opening a PR with a minor fix, make sure to add #trivial to the title/description of said PR.

## Cosmostation's Services and Community

- [Official Website](https://orai.io)
- [Mintscan Explorer](https://www.mintscan.io)
- [Web Wallet](https://wallet.cosmostation.io)
- [Android Wallet](https://bit.ly/2BWex9D)
- [iOS Wallet](https://apple.co/2IAM3Xm)
- [Telegram - International](https://t.me/cosmostation)
- [Kakao - Koreans](https://open.kakao.com/o/g6KKSe5)

## Oraichain's Services and Community

- [Official Website](https://www.cosmostation.io)
- [Mintscan Explorer](https://scan.orai.io)
- [Web Wallet](https://oraiwallet.web.app)
- [Telegram - International](https://t.me/oraichain)


## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.cosmostation.io/"><img src="https://avatars3.githubusercontent.com/u/34641838?v=4" width="100px;" alt=""/><br /><sub><b>Booyoun</b></sub></a><br /><a href="https://github.com/cosmostation/cosmosjs/commits?author=Booyoun-Kim" title="Code">💻</a> <a href="https://github.com/cosmostation/cosmosjs/issues?q=author%3ABooyoun-Kim" title="Bug reports">🐛</a> <a href="#maintenance-Booyoun-Kim" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/ducphamle2"><img src="https://avatars.githubusercontent.com/u/44611780?v=4" width="100px;" alt=""/><br /><sub><b>Le Duc Pham</b></sub></a><br /><a href="https://github.com/oraichain/cosmosjs/commits?author=ducphamle2" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/tubackkhoa"><img src="https://avatars.githubusercontent.com/u/5299269?v=4" width="100px;" alt=""/><br /><sub><b>Thanh Tu Pham</b></sub></a><br /><a href="https://github.com/oraichain/cosmosjs/commits?author=tubackkhoa" title="Code">💻</a></td>
    <td align="center"><a href="https://jaybdev.net"><img src="https://avatars1.githubusercontent.com/u/20435620?v=4" width="100px;" alt=""/><br /><sub><b>JayB</b></sub></a><br /><a href="https://github.com/cosmostation/cosmosjs/commits?author=kogisin" title="Code">💻</a> <a href="https://github.com/cosmostation/cosmosjs/commits?author=kogisin" title="Documentation">📖</a> <a href="#maintenance-kogisin" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://clovers.network"><img src="https://avatars2.githubusercontent.com/u/964052?v=4" width="100px;" alt=""/><br /><sub><b>billy rennekamp</b></sub></a><br /><a href="https://github.com/cosmostation/cosmosjs/commits?author=okwme" title="Code">💻</a> <a href="https://github.com/cosmostation/cosmosjs/issues?q=author%3Aokwme" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/tonyfeung"><img src="https://avatars3.githubusercontent.com/u/5483234?v=4" width="100px;" alt=""/><br /><sub><b>Tony Phuong Nguyen</b></sub></a><br /><a href="https://github.com/cosmostation/cosmosjs/commits?author=tonyfeung" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Tosch110"><img src="https://avatars2.githubusercontent.com/u/8368497?s=460&u=f82d3c518432276c191dc00f1524b7d8098bf828&v=4" width="100px;" alt=""/><br /><sub><b>Tobias Schwarz</b></sub></a><br /><a href="https://github.com/cosmostation/cosmosjs/commits?author=Tosch110" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/scottburch"><img src="https://avatars3.githubusercontent.com/u/103808?s=460&v=4" width="100px;" alt=""/><br /><sub><b>
Scott Burch</b></sub></a><br /><a href="https://github.com/cosmostation/cosmosjs/commits?author=scottburch" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/okwme"><img src="https://avatars0.githubusercontent.com/u/1866496?s=460&v=4" width="100px;" alt=""/><br /><sub><b>billy rennekamp</b></sub></a><br /><a href="https://github.com/cosmostation/cosmosjs/commits?author=okwme" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/pgrimaud"><img src="https://avatars3.githubusercontent.com/u/5483234?v=4" width="100px;" alt=""/><br /><sub><b>Pierre Grimaud</b></sub></a><br /><a href="https://github.com/cosmostation/cosmosjs/commits?author=pgrimaud" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/levackt"><img src="https://avatars3.githubusercontent.com/u/10286403?s=460&v=4" width="100px;" alt=""/><br /><sub><b>Taariq Levack</b></sub></a><br /><a href="https://github.com/cosmostation/cosmosjs/commits?author=levackt" title="Maintenance">🚧</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
