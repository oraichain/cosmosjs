import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
// import { useHistory } from 'react-router';
import message from 'cosmosjs/messages/proto';
import queryString from 'query-string';
import _ from 'lodash';
import Big from 'big.js';
import PinWrap, { openPinWrap } from './PinWrap';

const Transaction = ({ user, history }) => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  // const history = useHistory();
  const queryStringParse = queryString.parse(history.location.search) || {};
  const payload = JSON.parse(queryStringParse.payload);
  const cosmos = window.cosmos;

  useEffect(() => {
    // if (window.stdSignMsgByPayload) {
    //   const txBody = window.stdSignMsgByPayload;
    //   $('#tx-json').html(JSON.stringify(txBody));
    // }
    console.log(payload)
    if (payload && payload.value) {
      $('#tx-json').html(JSON.stringify(payload.value));
    }
  }, []);

  const denyHandler = () => {
    // clear, close if there is window.opener
    if (window.opener) {
      window.opener.postMessage('deny', '*');
      window.close();
    }
  };

  const getTxBodySend = (to_address, amount, memo) => {
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

  const getTxBodyDelegate = (validator_address, amount, memo) => {
    const msgSend = new message.cosmos.staking.v1beta1.MsgDelegate({
      delegator_address: user.address,
      validator_address,
      amount: { denom: cosmos.bech32MainPrefix, amount } // 10
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.staking.v1beta1.MsgDelegate',
      value: message.cosmos.staking.v1beta1.MsgDelegate.encode(msgSend).finish()
    });

    return new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo
    });
  };


  const onChildKey = async (childKey) => {
    try {
      // will allow return childKey from Pin
      const type = _.get(payload, 'type');
      let txBody;
      const memo = _.get(payload, 'value.memo') || "";
      switch (type) {
        case 'cosmos-sdk/MsgDelegate' : {
          const amount = new Big(_.get(payload, 'value.msg.0.value.amount.amount') || 0).toString();
          const validator_address = _.get(payload, 'value.msg.0.value.validator_address');
          txBody = getTxBodyDelegate(validator_address, amount, memo);
          break;
        }
        default : {
          const amount = new Big(_.get(payload, 'value.msg.0.value.amount.0.amount') || 0).toString();
          const to = _.get(payload, 'value.msg.0.value.to_address');
          txBody = getTxBodySend(to, amount, memo);
        }
        
      }
      // higher gas limit
      const res = await cosmos.submit(childKey, txBody, 'BROADCAST_MODE_BLOCK') || {};
      if (queryStringParse.signInFromScan) {
        window.opener.postMessage(res.tx_response, "*");
        // window.close();
      } else {
        $('#tx-json').text(res.tx_response.raw_log);
      }
    } catch (ex) {
      alert(ex.message);
    } finally {
      // setBlocking(false);
    }
  };

  return (
    <div>
      <h2>Sign Transaction</h2>
      <form className="keystation-form">
        <input style={{ display: 'none' }} type="text" tabIndex={-1} spellCheck="false" name="account" defaultValue={user.name} />
        <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
        <div className="keystation-tx-json" id="tx-json"></div>
        <div className="tx-btn-wrap">
          <button className="button" type="button" className="cancel" onClick={denyHandler}>
            {t('deny')}
          </button>
          <button type="button" onClick={openPinWrap} id="allowBtn">
            {t('allow')} <span></span>
          </button>
        </div>
      </form>

      <PinWrap show={false} pinType="tx" onChildKey={onChildKey} closePopup={queryStringParse.signInFromScan}/>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

export default connect(mapStateToProps)(Transaction);
