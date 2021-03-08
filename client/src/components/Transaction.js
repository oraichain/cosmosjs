import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
// import { useHistory } from 'react-router';
import PinWrap from './PinWrap';

const Transaction = ({ user }) => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  // const history = useHistory();
  // const cosmos = window.cosmos;

  useEffect(async () => {
    if (window.stdSignMsgByPayload) {
      const txBody = window.stdSignMsgByPayload;
      $('#tx-json').html(JSON.stringify(txBody));
    }
  }, []);

  const denyHandler = () => {
    // clear, close if there is window.opener
    if (window.opener) {
      window.opener.postMessage('deny', '*');
      window.close();
    }
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
