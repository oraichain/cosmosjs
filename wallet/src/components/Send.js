import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import message from '../cosmos/messages/proto';
import PinWrap from './PinWrap';

const Send = ({ user }) => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  const cosmos = window.cosmos;

  const updateTxPayload = () => {
    const to = $('#to').val().trim();
    const amount = $('#amount').val().trim();
    const memo = $('#memo').val().trim();

    const msgSend = new message.cosmos.bank.v1beta1.MsgSend({
      from_address: user.address,
      to_address: to,
      amount: [{ denom: cosmos.bech32MainPrefix, amount }] // 10
    });

    const msgSendAny = new message.google.protobuf.Any({
      type_url: '/cosmos.bank.v1beta1.MsgSend',
      value: message.cosmos.bank.v1beta1.MsgSend.encode(msgSend).finish()
    });

    const txBody = new message.cosmos.tx.v1beta1.TxBody({
      messages: [msgSendAny],
      memo
    });
    window.stdSignMsgByPayload = txBody;
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
    $('#tx-info').find('input,textarea').keydown(updateTxPayload);
    updateBalance();
  }, []);

  return (
    <div>
      <h2>Sign Transaction</h2>
      <form className="keystation-form">
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
        <div className="tx-btn-wrap">
          <Link className="button" to={`/${i18n.language}/transaction`}>
            Next
          </Link>
        </div>
      </form>

      <PinWrap show={false} pinType="tx" />
    </div>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

export default connect(mapStateToProps)(Send);
