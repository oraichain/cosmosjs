import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getPassword } from '../utils';
import { InputWrap } from './common';

import PinWrap from './PinWrap';

const SignIn = () => {
  const { t, i18n } = useTranslation();
  const $ = window.jQuery;
  function showPin() {
    var account = $('.input-account').val();
    var password = getPassword();

    if ($.trim(account) === '') {
      $('#formInfoMessage').hide();
      $('#errorOnSignIn').show().find('span').text('Invalid account.');
      return;
    }

    if ($.trim(password) === '') {
      $('#formInfoMessage').hide();
      $('#errorOnSignIn').show().find('span').text('Could not retrieve account stored in Keychain. Press the button below the Import Wallet.');
      return;
    }

    $('.pin-wrap').addClass('open');
  }

  return (
    <div>
      <h2>{t('signIn')}</h2>
      <form className="keystation-form">
        <InputWrap label={t('walletName')}>
          <input className="input__field input__field--fumi input-account" type="text" />
        </InputWrap>

        <input style={{ display: 'none' }} type="password" autoComplete="current-password" tabIndex={-1} spellCheck="false" />
        <p id="formInfoMessage" className="information-text">
          <i className="fa fa-fw fa-question-circle" /> {t('unableIncognitoMode')}
        </p>
        <p id="errorOnSignIn" className="error">
          <i className="fa fa-fw fa-exclamation-circle" /> <span />
        </p>
        <button className="button" type="button" onClick={showPin} id="nextBtn">
          {t('next')}
        </button>
      </form>
      <Link to={`/${i18n.language}/import`}>{t('importWallet')}</Link>
      &nbsp;&nbsp;|&nbsp;&nbsp;
      <Link to={`/${i18n.language}/import-privatekey`}>{t('importPrivateKey')}</Link>
      <a className="disableChecksum" style={{ position: 'fixed', bottom: 0, left: 0, color: '#fff' }}></a>
      <PinWrap show={false} pinType="signin" />
    </div>
  );
};

export default SignIn;
