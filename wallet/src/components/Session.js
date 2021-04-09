import React from 'react';
import { useTranslation } from 'react-i18next';
import {useSelector} from "react-redux";
import { Link } from 'react-router-dom';
import queryString from 'query-string';

const Session = ({ history }) => {
  const { t, i18n } = useTranslation();
  const user = useSelector(state => state.user);
  const queryStringParse = queryString.parse(history.location.search) || {};
  
  const handleConnect = () => {
    if (queryStringParse.signInFromScan) {
        window.opener.postMessage({ address: user.address, account: user.name}, "*");
        window.close();
      }
    console.log(user)
    history.push(`/${i18n.language}/transaction`)
  }

  return (
    <div>
      <h2 id="session-page-title">Save your Account to Keychain</h2>
      <form className="keystation-form">
        <img src="img/keychain.png" alt="" width="100%" />
        <br />
        <br />
        <p>You MUST press "Save" in order to complete registration of your account. If this pop-up does not appear, please press the Key logo on the top right corner of your browser.</p>

        <Link className="button" onClick={handleConnect}>
          Connect
        </Link>
      </form>
      <a href="https://support.google.com/chrome/answer/95606?co=GENIE.Platform%3DDesktop&hl=en" target="_blank">
        How can I manage saved mnemonics?
      </a>
    </div>
  );
};

export default Session;
