import { Cosmos } from './cosmos';
import message from './cosmos/messages/proto';

import './App.css';

const cosmos = new Cosmos('http://localhost:1317', 'Oraichain');
cosmos.setBech32MainPrefix('orai');
const childKey = cosmos.getChildKey(
  'equip swift twelve reveal execute ten news jeans junk talk bronze dignity wrong skirt cigar large situate dumb reduce wait gadget axis deputy update'
);

const App = () => {
  const send = async () => {
    const address = document.querySelector('#address').value;
    const amount = document.querySelector('#amount').value;

    const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
      from_address: cosmos.getAddress(childKey),
      to_address: address,
      amount: [{ denom: cosmos.bech32MainPrefix, amount: amount }]
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.bank.v1beta1.MsgSend',
      value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo: ''
    });

    const response = await cosmos.submit(childKey, txBody);
    console.log(response);
  };

  const showBalance = async () => {
    const address = document.querySelector('#address').value;
    const data = await fetch(
      `${cosmos.url}/cosmos/bank/v1beta1/balances/${address}`
    ).then((res) => res.json());

    const [balance] = data.balances;
    document.querySelector(
      '#balance'
    ).innerHTML = `${balance.amount} ${balance.denom}`;
  };

  return (
    <div className="App">
      <div>
        <label>Address</label>
        <input size={50} id="address" />
      </div>
      <div>
        <label>Amount</label>
        <input id="amount" />
      </div>
      <button onClick={send}>Send</button>
      <div id="balance"></div>
      <button onClick={showBalance}>Show balance</button>
    </div>
  );
};

export default App;
