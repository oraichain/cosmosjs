import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, useHistory } from 'react-router-dom';
import queryString from 'query-string';

import PinWrap from './PinWrap';

import { InputWrap } from './common';
import { cleanMnemonics, isMnemonicsValid, countWords, getPassword } from '../utils';

const Import = ({ history }) => {
  const { t, i18n } = useTranslation();
  const $ = window.jQuery;
  const queryStringParse = queryString.parse(history.location.search) || {};

  const importMnemonics = () => {
    window.pinType = 'import';

    var account = $('#account').val();
    var mnemonics = $('#mnemonics').val();

    if ($.trim(account) === '') {
      $('#formInfoMessage').hide();
      $('#errorOnImport').show().find('span').text('Invalid account.');
      return;
    }

    if ($.trim(mnemonics) === '') {
      $('#formInfoMessage').hide();
      $('#errorOnImport').show().find('span').text('Mnemonics is not valid.');
      return;
    }

    if (countWords($.trim(mnemonics)) !== 12 && countWords($.trim(mnemonics)) !== 16 && countWords($.trim(mnemonics)) !== 24) {
      $('#formInfoMessage').hide();
      $('#errorOnImport').show().find('span').text('Mnemonics is not valid.');
      // TODO: Check validation of mnemonics
      return;
    }

    if (!isMnemonicsValid(mnemonics)) {
      $('#formInfoMessage').hide();
      $('#errorOnImport').show().find('span').text('Invalid mnemonics checksum error.');
      // TODO: Check validation of mnemonics
      return;
    }

    if (window.option === 'disablechecksum') {
      $('#mnemonics').val(mnemonics);
    } else {
      $('#mnemonics').val(cleanMnemonics(mnemonics));
    }

    $('.pin-wrap').addClass('open');
  };

  const submitForm = (checksum = true) => {
    var account = $.trim($('#hidden-account').val());
    var mnemonics = $.trim($('#mnemonics').val());

    if (account === '') {
      $('#formInfoMessage').hide();
      $('#errorOnImport').show().find('span').text('Invalid account.');
      return;
    }

    if (mnemonics === '') {
      $('#formInfoMessage').hide();
      $('#errorOnImport').show().find('span').text('Invalid mnemonics.');
      return;
    }

    // Check encrypted mnemonic phrase and pasted value
    if (document.getElementById('encrypted-import').innerText !== getPassword()) {
      $('.notification-modal').text('Encrypted mnemonic phrase does not match.');
      $('.notification-modal').show();
      setTimeout(function () {
        $('.notification-modal').hide();
      }, 2000);
      return;
    }

    history.push(`/${i18n.language}/session${queryStringParse.signInFromScan ? '?signInFromScan=true' : ''}`);
  };

  const copyAddress = () => {
    const copyText = document.getElementById('encrypted-import-for-copy');
    copyText.select();
    localStorage.setItem('password', copyText.value);
    document.execCommand('copy');
    $('.notification-modal').text('Encrypted mnemonic phrase is copied.');
    $('.notification-modal').show();
    setTimeout(function () {
      $('.notification-modal').hide();
    }, 2000);
  };

  return (
    <div>
      <h2>Import Wallet</h2>
      {/* 1. Account Name, Mnemonics */}
      <form id="import-form1" className="keystation-form" noValidate>
        <InputWrap label="Wallet Name">
          <input className="input__field input__field--fumi input-account" id="account" type="text" />
        </InputWrap>

        <InputWrap label="Mnemonics">
          <textarea className="input__field input__field--fumi input-mnemonics" id="mnemonics" defaultValue={''} />
        </InputWrap>

        <p id="formInfoMessage" className="information-text">
          <i className="fa fa-fw fa-question-circle" /> Enter 12 / 16 / 24 words including spaces. Mnemonic phrase is encrypted and stored in Keychain.
        </p>
        <p id="errorOnImport" className="error">
          {/* error msg */}
          <i className="fa fa-fw fa-exclamation-circle" /> <span />
        </p>
        <button className="button" type="button" onClick={importMnemonics}>
          Next
        </button>
      </form>
      {/* 1 END */}
      {/* 2. pin ( pin-wrap.open )*/}
      <PinWrap pinType="import" />

      {/* 2 end */}
      {/* 3. re-enter */}
      <div className="notification-modal">{/* Encrypted mnemonic phrase is copied. */}</div>
      <form id="import-form2" method="GET" className="keystation-form re-enter-form" noValidate>
        <p>Please copy and paste the mnemonic encryption below.</p>
        <div className="pw-nnemonics">
          <div>
            <span>
              <i className="fa fa-lock" />
              Encrypted mnemonic phrase
            </span>
            <button type="button" onClick={copyAddress}>
              <i className="fa fa-files-o" />
              Copy
            </button>
          </div>
          {/* <input class="input__field input__field--fumi input-account" id="hidden-account" type="text" name="account" style="display: none" value=""> */}
          <span id="encrypted-import">{/* encrypted string */}</span>
        </div>

        <InputWrap label="Encrypted mnemonic phrase">
          <input className="input__field input__field--fumi" id="hidden-account" type="text" name="account" style={{ display: 'none' }} defaultValue />
          <input className="input__field input__field--fumi input-password" type="password" autoComplete="new-password" />
        </InputWrap>
        <a href="https://medium.com/cosmostation/introducing-keystation-end-to-end-encrypted-key-manager-for-dapps-built-with-the-cosmos-sdk-37dac753feb5" target="_blank">
          <i className="fa fa-fw fa-question-circle" />
          Why do I have to encrypt my mnemonic phrase?
        </a>
        <input type="text" defaultValue id="encrypted-import-for-copy" />
        <button className="button" type="button" onClick={submitForm}>
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
      <Link to={`/${i18n.language}/signin`}>Sign In</Link>
    </div>
  );
};

export default Import;
