import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { Cosmos } from '../cosmos';

import PinWrap from './PinWrap';

const SignIn = () => {
  const { t, i18n } = useTranslation();

  function showPin() {
    var account = window.$('.input-account').val();
    var password = window.$('input[type=password]').val();

    if (window.$.trim(account) == '') {
      window.$('#formInfoMessage').hide();
      window.$('#errorOnSignIn').show().find('span').text('Invalid account.');
      return;
    }

    if (window.$.trim(password) == '') {
      window.$('#formInfoMessage').hide();
      window.$('#errorOnSignIn').show().find('span').text('Could not retrieve account stored in Keychain. Press the button below the Import Wallet.');
      return;
    }

    window.pinType = 'signin';
    const cosmos = new Cosmos('http://localhost:1317', 'Oraichain');
    cosmos.setBech32MainPrefix('orai');
    window.cosmos = cosmos;
    window.$('.pin-wrap').addClass('open');
  }

  return (
    <>
      <h1>
        <img src="/img/oraichain_logo.png" alt="" width={145} />
      </h1>
      <h2>{t('signIn')}</h2>
      <form className="keystation-form">
        <span className="input input--fumi input--filled">
          <input className="input__field input__field--fumi input-account" type="text" />
          <label className="input__label input__label--fumi">
            <i className="fa fa-fw fa-user icon icon--fumi" />
            <span className="input__label-content input__label-content--fumi">{t('walletName')}</span>
          </label>
        </span>
        <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
        <p id="formInfoMessage" className="information-text">
          <i className="fa fa-fw fa-question-circle" /> {t('unableIncognitoMode')}
        </p>
        <p id="errorOnSignIn" className="error">
          <i className="fa fa-fw fa-exclamation-circle" /> <span />
        </p>
        <button type="button" onClick={showPin} id="nextBtn">
          {t('next')}
        </button>
      </form>
      <Link to={`/${i18n.language}/import`}>{t('importWallet')}</Link>
      <a className="disableChecksum" style={{ position: 'fixed', bottom: 0, left: 0, color: '#fff' }}>
        ■
      </a>

      <PinWrap show={false} />
    </>
  );
};

export default SignIn;
