import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route } from 'react-router-dom';
import PinWrap from './PinWrap';

const Import = () => {
  const { t, i18n } = useTranslation();
  return (
    <>
      <h1>
        <img src="/img/oraichain_logo.png" alt="" width={145} />
      </h1>
      <h2>Import Wallet</h2>
      {/* 1. Account Name, Mnemonics */}
      <form className="keystation-form" id="import-form1" noValidate>
        <span className="input input--fumi">
          <input className="input__field input__field--fumi input-account" id="account" type="text" />
          <label className="input__label input__label--fumi">
            <i className="fa fa-fw fa-user icon icon--fumi" />
            <span className="input__label-content input__label-content--fumi">Wallet Name</span>
          </label>
        </span>
        <span className="input input--fumi">
          <textarea className="input__field input__field--fumi input-mnemonics" id="mnemonics" defaultValue={''} />
          <label className="input__label input__label--fumi">
            <i className="fa fa-fw fa-key icon icon--fumi" />
            <span className="input__label-content input__label-content--fumi">Mnemonics</span>
          </label>
        </span>
        <p id="formInfoMessage" className="information-text">
          <i className="fa fa-fw fa-question-circle" /> Enter 12 / 16 / 24 words including spaces. Mnemonic phrase is encrypted and stored in Keychain.
        </p>
        <p id="errorOnImport" className="error">
          {/* error msg */}
          <i className="fa fa-fw fa-exclamation-circle" /> <span />
        </p>
        <button type="button" id="importBtn">
          Next
        </button>
      </form>
      {/* 1 END */}
      {/* 2. pin ( pin-wrap.open )*/}
      <PinWrap />

      {/* 2 end */}
      {/* 3. re-enter */}
      <div className="notification-modal">{/* Encrypted mnemonic phrase is copied. */}</div>
      <form action="/session" method="GET" className="keystation-form re-enter-form" id="import-form2" noValidate>
        <p>Please copy and paste the mnemonic encryption below.</p>
        <div className="pw-nnemonics">
          <div>
            <span>
              <i className="fa fa-lock" />
              Encrypted mnemonic phrase
            </span>
            <button type="button" onclick="copyAddress();">
              <i className="fa fa-files-o" />
              Copy
            </button>
          </div>
          {/* <input class="input__field input__field--fumi input-account" id="hidden-account" type="text" name="account" style="display: none" value=""> */}
          <span id="encrypted-mnemonics">{/* encrypted string */}</span>
        </div>
        <span className="input input--fumi">
          <input className="input__field input__field--fumi" id="hidden-account" type="text" name="account" style={{ display: 'none' }} defaultValue />
          <input className="input__field input__field--fumi input-password" type="password" autoComplete="new-password" />
          <label className="input__label input__label--fumi">
            <i className="fa fa-fw fa-key icon icon--fumi" />
            <span className="input__label-content input__label-content--fumi">Encrypted mnemonic phrase</span>
          </label>
        </span>
        <a href="https://medium.com/cosmostation/introducing-keystation-end-to-end-encrypted-key-manager-for-dapps-built-with-the-cosmos-sdk-37dac753feb5" target="_blank">
          <i className="fa fa-fw fa-question-circle" />
          Why do I have to encrypt my mnemonic phrase?
        </a>
        <input type="hidden" name="client" defaultValue="{{.Client}}" />
        <input type="hidden" name="path" defaultValue="{{.Path}}" />
        <input type="hidden" name="payload" defaultValue="{{.Payload}}" />
        <input type="hidden" name="lcd" defaultValue="{{.Lcd}}" />
        <input type="text" defaultValue id="encrypted-mnemonics-for-copy" />
        <button type="button" id="importBtn2">
          Next
        </button>
      </form>
      {/* 3 end */}
      {/* 4. loader ( loader-wrap.open )*/}
      <div className="loader-wrap">
        <div>
          <div className="spinner spinner-blink" />
        </div>
        <div>
          <div className="spinner spinner-bounce-middle" />
        </div>
      </div>
      {/* 4 end */}
      <Link to={`/${i18n.language}/login`}>Sign In</Link>
    </>
  );
};

export default Import;
