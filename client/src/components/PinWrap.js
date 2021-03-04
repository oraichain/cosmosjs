import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import CryptoJS from 'crypto-js';
import _ from 'lodash';
import { cleanMnemonics } from '../utils';
import { useHistory } from 'react-router';
import { useTranslation } from 'react-i18next';
import * as actions from '../actions';

window.CryptoJS = CryptoJS;
const PinWrap = ({ pinType, updateUser }) => {
  const history = useHistory();
  const { t, i18n } = useTranslation();
  let input = '',
    correct = '';
  const $ = window.jQuery;
  const cosmos = window.cosmos;

  useEffect(() => {
    $('.dot').attr('class', 'dot');
  });

  function showCorrectPinAnimation() {
    $('.dot').addClass('correct');
  }

  function showWrongPinAnimation() {
    $('.dot').addClass('wrong');
    $('.wrapper-number').css('display', 'grid');
    $('.wrapper-alphabet').css('display', 'none');
  }

  // pin close
  const hidePin = () => {
    // Init PIN

    for (let i = 0; i < 5; i++) {
      input = input.substr(0, input.length - 1);
    }

    $('#pin-title').text('Please enter your PIN.');

    // Init Keypad
    $('.wrapper-number').css('display', 'grid');
    $('.wrapper-alphabet').css('display', 'none');

    correct = '';

    $('.pin-wrap').removeClass('open');
    $('.dot').attr('class', 'dot');
  };

  const numberClick = (e) => {
    const number = e.target;
    let inputStr = number.innerText.trim();
    const dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));

    if (inputStr == '←') {
      if (input.length > 0) {
        dots[input.length - 1].className = 'dot';
        input = input.substr(0, input.length - 1);

        if (input.length < 4) {
          $('.wrapper-number').css('display', 'grid');
          $('.wrapper-alphabet').css('display', 'none');
        }
      }
    } else {
      input += inputStr;
      dots[input.length - 1].className = 'dot active';
    }

    if (input.length == 4) {
      $('.wrapper-number').css('display', 'none');
      $('.wrapper-alphabet').css('display', 'grid');
    }

    if (input.length >= 5) {
      if (pinType == 'import' && correct == '') {
        correct = input;
        // Please confirm your PIN.

        // Change title
        $('#pin-title').text('Please confirm your PIN.');

        // Init Keypad
        $('.wrapper-number').css('display', 'grid');
        $('.wrapper-alphabet').css('display', 'none');

        // Init PIN
        console.log(dots, input.length - 1, dots[input.length - 1]);
        for (let i = 0; i < 5; i++) {
          dots[input.length - 1].className = 'dot';
          input = input.substr(0, input.length - 1);
        }
      } else if (pinType == 'import' && correct.length == 5) {
        if (input !== correct) {
          showWrongPinAnimation();
        } else {
          showCorrectPinAnimation();

          // INIT
          let mnemonics = '';
          if (window.option == 'disablechecksum') {
            mnemonics = $('.input-mnemonics').val().trim();
          } else {
            mnemonics = cleanMnemonics($('.input-mnemonics').val().trim());
          }

          const account = $('#account').val();
          const address = cosmos.getAddress(mnemonics, false);
          updateUser(account, address);

          let encrypted = CryptoJS.AES.encrypt(mnemonics, input);

          setTimeout(function () {
            $('#encrypted-mnemonics').text(encrypted);
            $('#encrypted-mnemonics-for-copy').val(encrypted);
            $('.pin-wrap').removeClass('open');
            // import page2
            $('#import-form1').hide();
            $('#import-form2').show();
            $('#hidden-account').val(account);
          }, 500);
        }
      } else if (pinType == 'signin' || pinType == 'tx') {
        // decrypt input value
        let encryptedMnemonics = $('input[type=password]').val().trim();

        try {
          let decrypted = CryptoJS.AES.decrypt(encryptedMnemonics, input);
          let decryptedMnemonics = decrypted.toString(CryptoJS.enc.Utf8);

          if (decryptedMnemonics == '') {
            // wrong
            showWrongPinAnimation();
          } else {
            // correct
            showCorrectPinAnimation();

            if (pinType == 'signin') {
              const address = cosmos.getAddress(decryptedMnemonics, false);
              const account = $('.input-account').val().trim();

              // go to transaction with address
              console.log(address);
              updateUser(account, address);

              history.push(`/${i18n.language}/transaction`);
            } else if (pinType == 'tx') {
              let password = $('input[type=password]').val();

              if (password.trim() == '') {
                alert('Could not retrieve account stored in Keychain.');
                return;
              }

              let decrypted = CryptoJS.AES.decrypt(password.trim(), input);
              let decryptedMnemonics = decrypted.toString(CryptoJS.enc.Utf8);
              console.log('payload', window.stdSignMsgByPayload);
              // loader
              const childKey = cosmos.getChildKey(decryptedMnemonics);
              console.log(childKey);
              cosmos
                .submit(childKey, window.stdSignMsgByPayload)
                .then((res) => {
                  console.log(res);
                  $('#allowBtn>span').empty();
                  hidePin();
                })
                .catch((err) => {
                  console.log(err);
                  $('#allowBtn>span').empty();
                  hidePin();
                });
            }
          }
        } catch (error) {
          console.log(error);
          // Error: Malformed UTF-8 data
          showWrongPinAnimation();
        }
      }

      input = '';
    }
    window.setTimeout(function () {
      number.className = 'finger grid-number';
    }, 1000);
  };

  const ShuffledNumCode = () => {
    const numSlice = _.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    // Make these codes
    //<div class="finger grid-number">1</div>
    //<div class="finger grid-number">2</div>
    //...
    //<div class="finger grid-number">9</div>
    //<div class="grid-number"></div>
    //<div class="finger grid-number">0</div>
    //<div class="finger grid-number">←</div>

    const shuffledNumCode = [];
    let key = 0;
    for (let i = 0; i < 10; i++) {
      shuffledNumCode.push(
        <div key={key++} className="finger grid-number" onClick={numberClick}>
          {numSlice[i]}
        </div>
      );
      if (i === 8) {
        shuffledNumCode.push(<div key={key++} className="grid-number" onClick={numberClick}></div>);
      } else if (i === 9) {
        shuffledNumCode.push(
          <div key={key++} className="finger grid-number" onClick={numberClick}>
            ←
          </div>
        );
      }
    }
    return <>{shuffledNumCode}</>;
  };

  const ShuffledAlphabetCode = () => {
    const alphabetSlice = _.shuffle(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']);

    // Make these codes
    //<div class="finger grid-number">A</div>
    //<div class="finger grid-number">B</div>
    //...
    //<div class="finger grid-number">Z</div>
    //<div class="grid-number"></div>
    //<div class="finger grid-number">←</div>

    const shuffledAlphabetCode = [];
    let key = 0;
    for (let i = 0; i < 26; i++) {
      shuffledAlphabetCode.push(
        <div key={key++} className="finger grid-number" onClick={numberClick}>
          {alphabetSlice[i]}
        </div>
      );
      if (i == 25) {
        shuffledAlphabetCode.push(<div key={key++} className="grid-number" onClick={numberClick}></div>);
        shuffledAlphabetCode.push(
          <div key={key++} className="finger grid-number" onClick={numberClick}>
            ←
          </div>
        );
      }
    }
    return <>{shuffledAlphabetCode}</>;
  };

  return (
    <div className="pin-wrap">
      <button onClick={hidePin} type="button">
        ✕
      </button>
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
        <div className="wrapper-number no-select">
          <ShuffledNumCode />
        </div>
        <div className="wrapper-alphabet no-select">
          <ShuffledAlphabetCode />
        </div>
      </div>
    </div>
  );
};

export default connect(null, actions)(PinWrap);
