import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Session = () => {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <h2 id="session-page-title">Save your Account to Keychain</h2>
      <form className="keystation-form">
        <img src="img/keychain.png" alt="" width="100%" />
        <br />
        <br />
        <p>You MUST press "Save" in order to complete registration of your account. If this pop-up does not appear, please press the Key logo on the top right corner of your browser.</p>

        <Link className="button" to={`/${i18n.language}/transaction`}>
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
