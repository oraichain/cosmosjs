import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import message from '../cosmos/messages/proto';
import PinWrap from './PinWrap';

const Transaction = ({ user }) => {
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

    $('#tx-json').html(JSON.stringify(txBody));
  };

  useEffect(async () => {
    $('#tx-info').find('input,textarea').keydown(updateTxPayload);

    const data = await fetch(`${cosmos.url}/cosmos/bank/v1beta1/balances/${user.address}`).then((res) => res.json());
    const balance = data.balances[0];
    $('#balance').html(`(${balance.amount} ${balance.denom})`);
  }, []);

  const denyHandler = () => {
    // clear
    window.close();
  };

  const requestSignTx = () => {
    let password = $('input[type=password]').val();

    if ($.trim(password) == '') {
      alert(
        'You cannot sign transactions.\n1. Check your browser is in private mode.\n2. Type "chrome://settings/passwords" into your browser and press Enter to toggle the switch "Offer to save passwords" to the on.'
      );
      return;
    }
    $('#allowBtn>span').html('<i class="fa fa-spinner fa-spin"></i>');
    $('.pin-wrap').addClass('open');
  };

  return (
    <div>
      <h2>Sign Transaction</h2>
      <form className="keystation-form">
        <input style={{ display: 'none' }} type="text" tabIndex={-1} spellCheck="false" name="account" defaultValue={user.name} />
        <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
        <div className="keystation-url-info">
          <strong>
            <i className="fa fa-fw fa-lock" />
            {window.cosmos.chainId}
          </strong>
          {t('usingSecureConnection')}
        </div>
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
        <div className="keystation-tx-json" id="tx-json"></div>
        <div className="tx-btn-wrap">
          <button className="button" type="button" className="cancel" onClick={denyHandler}>
            {t('deny')}
          </button>
          <button type="button" onClick={requestSignTx} id="allowBtn">
            {t('allow')} <span></span>
          </button>
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

export default connect(mapStateToProps)(Transaction);
