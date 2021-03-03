import React, { useState } from 'react';
import classNames from 'classnames';
import CryptoJS from 'crypto-js';
import _ from 'lodash';

const getKeyStationMainAddress = (mnemonic, hdPath, checkSum = true) => {
  window.cosmos.setPath(hdPath);
  return window.cosmos.getAddress(mnemonic, checkSum);
};

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

const PinWrap = () => {
  let [state, setState] = useState({});
  let { input = '', correct = '' } = state;

  function showCorrectPinAnimation() {
    const dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
    dots.forEach(function (dot, index) {
      dot.className += ' correct';
    });
  }

  function showWrongPinAnimation() {
    const dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
    dots.forEach(function (dot, index) {
      dot.className += ' wrong';
    });
    window.$('.wrapper-number').css('display', 'grid');
    window.$('.wrapper-alphabet').css('display', 'none');
  }

  function cleanMnemonics(mnemonics) {
    mnemonics = mnemonics.split(',').join(' ');
    mnemonics = mnemonics.replace(/ +/g, ' '); // Replace connected spaces with one space
    return mnemonics;
  }

  // pin close
  const hidePin = () => {
    // Init PIN

    for (var i = 0; i < 5; i++) {
      input = input.substr(0, input.length - 1);
    }

    window.$('#pin-title').text('Please enter your PIN.');

    // Init Keypad
    window.$('.wrapper-number').css('display', 'grid');
    window.$('.wrapper-alphabet').css('display', 'none');

    setState({
      input,
      correct: ''
    });

    window.$('.pin-wrap').removeClass('open');
  };

  const numberClick = (e) => {
    const number = e.target;
    let inputStr = number.outerHTML;
    const dots = Array.prototype.slice.call(document.querySelectorAll('.dot'));
    if (inputStr.indexOf('<div class="finger grid-number">') != -1) {
      inputStr = inputStr.replace('<div class="finger grid-number">', '');
      inputStr = inputStr.replace('</div>', '');

      if (inputStr == '←') {
        if (input.length > 0) {
          dots[input.length - 1].className = 'dot';
          input = input.substr(0, input.length - 1);

          if (input.length < 4) {
            window.$('.wrapper-number').css('display', 'grid');
            window.$('.wrapper-alphabet').css('display', 'none');
          }
        }
      } else {
        input += inputStr;
        dots[input.length - 1].className += ' active';
      }
    }

    if (input.length == 4) {
      window.$('.wrapper-number').css('display', 'none');
      window.$('.wrapper-alphabet').css('display', 'grid');
    }

    if (input.length >= 5) {
      if (window.pinType == 'import' && correct == '') {
        correct = input;
        // Please confirm your PIN.
        window.setTimeout(function () {
          // Change title
          window.$('#pin-title').text('Please confirm your PIN.');

          // Init Keypad
          window.$('.wrapper-number').css('display', 'grid');
          window.$('.wrapper-alphabet').css('display', 'none');

          // Init PIN
          for (var i = 0; i < 5; i++) {
            dots[input.length - 1].className = 'dot';
            input = input.substr(0, input.length - 1);
          }
        }, 200);
      } else if (window.pinType == 'import' && correct.length == 5) {
        if (input !== correct) {
          showWrongPinAnimation();
        } else {
          showCorrectPinAnimation();

          // INIT
          var mnemonics = '';
          if (window.option == 'disablechecksum') {
            mnemonics = window.$('.input-mnemonics').val().trim();
          } else {
            mnemonics = cleanMnemonics(window.$('.input-mnemonics').val().trim());
          }
          var pinCode = input;

          var encrypted = CryptoJS.AES.encrypt(mnemonics, pinCode);

          setTimeout(function () {
            window.$('#encrypted-mnemonics').text(encrypted);
            window.$('#encrypted-mnemonics-for-copy').val(encrypted);
            window.$('.pin-wrap').removeClass('open');
            // import page2
            window.$('#import-form1').hide();
            window.$('#import-form2').show();
            window.$('#hidden-account').val(window.$('#account').val());
          }, 500);
        }
      } else if (window.pinType == 'signin' || window.pinType == 'tx') {
        // decrypt input value
        var encryptedMnemonics = window.$('input[type=password]').val().trim();
        var pinCode = input;

        try {
          var decrypted = CryptoJS.AES.decrypt(encryptedMnemonics, pinCode);
          var decryptedMnemonics = decrypted.toString(CryptoJS.enc.Utf8);

          if (decryptedMnemonics == '') {
            // wrong
            showWrongPinAnimation();
          } else {
            // correct
            showCorrectPinAnimation();

            if (window.pinType == 'signin') {
              var hdPath = getParameterByName('path');
              var hdPathArr = hdPath.split('/');
              var hdPathResult = '';
              for (var i = 0; i < hdPathArr.length; i++) {
                hdPathResult += String(hdPathArr[i]);
                if (i < 3) {
                  // 44, 118, 0
                  if (hdPathArr[i].indexOf("'") == -1) {
                    hdPathResult += "'";
                  }
                }

                if (i < hdPathArr.length - 1) {
                  hdPathResult += '/';
                }
              }

              var address = getKeyStationMainAddress(decryptedMnemonics, hdPathResult, false);

              var msgObj = {
                address: address,
                account: window.$('.input-account').val()
              };

              window.setTimeout(function () {
                try {
                  window.opener.postMessage(msgObj, '*');
                } catch (event) {
                  console.log(event);
                }
                window.close();
              }, 500);
            } else if (window.pinType == 'tx') {
              var password = window.$('input[type=password]').val();

              if (password.trim() == '') {
                alert('Could not retrieve account stored in Keychain.');
                return;
              }

              var decrypted = CryptoJS.AES.decrypt(password.trim(), pinCode);
              var decryptedMnemonics = decrypted.toString(CryptoJS.enc.Utf8);

              // // loader
              // window.$("#allowBtn").html('<i class="fa fa-spinner fa-spin"></i>');

              var hdPath = getParameterByName('path');
              var hdPathArr = hdPath.split('/');
              var hdPathResult = '';

              for (var i = 0; i < hdPathArr.length; i++) {
                hdPathResult += String(hdPathArr[i]);
                if (i < 3) {
                  // 44, 118, 0
                  if (hdPathArr[i].indexOf("'") == -1) {
                    hdPathResult += "'";
                  }
                }

                if (i < hdPathArr.length - 1) {
                  hdPathResult += '/';
                }
              }

              var stdSignMsg = new Object();
              stdSignMsg.json = JSON.parse(window.stdSignMsgByPayload);

              // IRIS exception handling
              if (
                stdSignMsg.json.msgs[0].type == 'irishub/bank/Send' ||
                stdSignMsg.json.msgs[0].type == 'irishub/stake/BeginUnbonding' ||
                stdSignMsg.json.msgs[0].type == 'irishub/stake/BeginRedelegate'
              ) {
                // stdSignMsg.jsonForSigningIrisTx = JSON.parse(window.stdSignMsgByPayload);
                // delete stdSignMsg.jsonForSigningIrisTx.msgs[0].type;
                // var tempJsonObj = stdSignMsg.jsonForSigningIrisTx.msgs[0].value;
                // stdSignMsg.jsonForSigningIrisTx.msgs[0] = tempJsonObj;
                // cosmos.submit(childKey, txBody)

                return;
              }

              //   cosmos.submit(childKey, txBody)
            }
          }
        } catch (error) {
          console.log(error);
          // Error: Malformed UTF-8 data
          showWrongPinAnimation();
        }
      }

      setState({
        input: ''
      });
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

export default PinWrap;
