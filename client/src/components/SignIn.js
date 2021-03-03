import React from 'react';
import { useTranslation } from 'react-i18next';

const SignIn = () => {
  const { t } = useTranslation();
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
            <span className="input__label-content input__label-content--fumi">
              {t('walletName')}
            </span>
          </label>
        </span>
        <input
          style={{ display: 'none' }}
          type="password"
          autoComplete="current-password"
          tabIndex={-1}
          spellCheck="false"
        />
        <p id="formInfoMessage" className="information-text">
          <i className="fa fa-fw fa-question-circle" /> {t('unableIncognitoMode')}
        </p>
        <p id="errorOnSignIn" className="error">
          <i className="fa fa-fw fa-exclamation-circle" /> <span />
        </p>
        <button type="button" onClick={() => {}} id="nextBtn">
          {t('next')}
        </button>
      </form>
      <a href="{{.QueryUrl}}">{t('importWallet')}</a>
      <div className="form-fotter">
        <a href="https://github.com/cosmostation/keystation" target="_blank">
          <i className="fa fa-fw fa-github" />
        </a>
      </div>
      <a
        className="disableChecksum"
        style={{ position: 'fixed', bottom: 0, left: 0, color: '#fff' }}
        href="{{.QueryUrl}}disablechecksum"
      >
        ■
      </a>
      <div className="pin-wrap">
        <button type="button">✕</button>
        <div className="pin-cont">
          <h2>Please enter your PIN.</h2>
          <div className="dots-cointainer">
            <div className="dots">
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
              <div className="dot" />
              <div>+</div>
              <div className="dot" />
            </div>
          </div>
          <div className="wrapper-number no-select">ShuffledNumCode</div>
          <div className="wrapper-alphabet no-select">ShuffledAlphabetCode</div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
