import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useHistory } from 'react-router';

import { InputWrap } from './common';

import PinWrap from './PinWrap';

const SignIn = () => {
    const { t, i18n } = useTranslation();
    const history = useHistory();
    const $ = window.jQuery;
    function showPin() {
        var account = $('.input-account').val();
        var password = $('input[type=password]').val();

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
            <div className="menu">
                <button className="button" onClick={() => history.push('/contract/query')}>{t('query')}</button>
                <button className="button" onClick={() => history.push('/send')}>{t('send')}</button>
            </div>
        </div>
    );
};

export default SignIn;
