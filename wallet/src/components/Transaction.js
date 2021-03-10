import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
// import { useHistory } from 'react-router';
import PinWrap, { openPinWrap } from './PinWrap';

const Transaction = ({ user }) => {
  const $ = window.jQuery;
  const { t, i18n } = useTranslation();
  // const history = useHistory();
  // const cosmos = window.cosmos;

  useEffect(() => {
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
