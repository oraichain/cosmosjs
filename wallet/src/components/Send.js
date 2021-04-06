import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';

import message from 'cosmosjs/messages/proto';
import PinWrap, { openPinWrap } from './PinWrap';

const Send = ({ user }) => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  const [blocking, setBlocking] = useState(false);
  const cosmos = window.cosmos;

  const getTxBody = (to_address, amount, memo) => {
    const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
      from_address: user.address,
      to_address,
      amount: [{ denom: cosmos.bech32MainPrefix, amount }] // 10
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.bank.v1beta1.MsgSend',
      value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo
    });
  };

  const onChildKey = async (childKey) => {
    try {
      setBlocking(true);
      // will allow return childKey from Pin
      const to = $('#to').val().trim();
      const amount = $('#amount').val().trim();
      const memo = $('#memo').val().trim();
      const txBody = getTxBody(to, amount, memo);
      // higher gas limit
      const res = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK');
      $('#tx-json').text(res.tx_response.raw_log);
    } catch (ex) {
      alert(ex.message);
    } finally {
      setBlocking(false);
    }
  };

  const updateBalance = async () => {
    try {
      const data = await fetch(`${cosmos.url}/cosmos/bank/v1beta1/balances/${user.address}`).then((res) => res.json());
      const balance = data.balances[0];
      $('#balance').html(`(${balance.amount} ${balance.denom})`);
    } catch (ex) {
      console.log(ex);
    }
  };

  useEffect(() => {
    updateBalance();
  }, []);

  return (
    <BlockUi tag="div" blocking={blocking}>
      <h2>Sign Transaction</h2>
      <form className="keystation-form">
        <input style={{ display: 'none' }} type="text" tabIndex={-1} spellCheck="false" name="account" defaultValue={user.name} />
        <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
        <div className="keystation-tx-info" id="tx-info">
          <h3 className="send">SEND</h3>
          <span>{t('from')}</span>
          <p>
            {user.address}{' '}
            <strong>
              <small id="balance"></small>
            </strong>
          </p>
          <div className="field">
            <span>{t('to')}</span>
            <input id="to" />
          </div>
          <div className="field">
            <span>{t('amount')} (orai)</span>
            <input id="amount" />
          </div>

          <div className="field">
            <span>{t('fee')} (orai)</span>
            <input id="fee" />
          </div>
          <span>{t('memo')}</span>
          <textarea id="memo"></textarea>
        </div>
        <div className="tx-btn-wrap btn-center">
          <button type="button" onClick={openPinWrap} id="allowBtn">
            Next
          </button>
        </div>
      </form>

      <div className="keystation-tx-json" id="tx-json"></div>

      <PinWrap show={false} pinType="tx" onChildKey={onChildKey} />
    </BlockUi>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

export default connect(mapStateToProps)(Send);
