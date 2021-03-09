import React, { useEffect, useState } from 'react';
import { Route, Redirect, Switch, useLocation, useRouteMatch, useHistory } from 'react-router';
import { pathToRegexp, compile } from 'path-to-regexp';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { Link } from 'react-router-dom';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';
import { connect } from 'react-redux';
import * as actions from './actions';
import SignIn from './components/SignIn';
import Send from './components/Send';
import Import from './components/Import';
import Session from './components/Session';
import Transaction from './components/Transaction';

import { Cosmos } from './cosmos';
import { networks } from './config.json';

import './App.css';

const url = new window.URL(window.location.href);
const network = url.searchParams.get('payload') || window.localStorage.getItem('wallet.network') || 'Oraichain';
const path = url.searchParams.get('path');
const lcd = url.searchParams.get('lcd') || (networks[network]?.lcd ?? 'http://localhost:1317');
// init cosmos version
const cosmos = new Cosmos(lcd, network);
const symbol = networks[network]?.denom ?? 'orai';
cosmos.setBech32MainPrefix(symbol);
if (path && path !== 'undefined') {
  cosmos.setPath(path);
}

// global params
window.cosmos = cosmos;
window.client = url.searchParams.get('client');
window.localStorage.setItem('wallet.network', network);

// there is post message from parent window, just update the stdSignMsgByPayload and ready for broadcast
window.addEventListener(
  'message',
  (e) => {
    // not the client to send message
    console.log(e.data);
    if (e.data.client !== window.client) return;
    const txBody = e.data.tx;
    window.stdSignMsgByPayload = txBody;
    window.jQuery('#tx-json').html(JSON.stringify(txBody));
  },
  false
);

const generateLanguage = (locale, location) => {
  const ROUTE = '/:locale/:path*';
  const definePath = compile(ROUTE);
  const routeComponents = pathToRegexp(ROUTE).exec(location.pathname);

  let subPaths = null;
  if (routeComponents && routeComponents[2]) {
    subPaths = routeComponents[2].split('/');
  }

  return definePath({
    locale,
    path: subPaths
  });
};

const options = Object.keys(networks).map((value) => ({
  value: value,
  label: value
}));

const PrivateRoute = ({ component: Component, isLoggedIn, ...rest }) => {
  return <Route {...rest} render={(props) => (isLoggedIn ? <Component {...props} /> : <Redirect to={{ pathname: '/signin', state: { from: props.location } }} />)} />;
};

const App = ({ user, updateUser }) => {
  const location = useLocation();
  const history = useHistory();
  const match = useRouteMatch();
  const { locale } = match.params;
  const { t, i18n } = useTranslation();
  const [selectedOption, setSelectedOption] = useState({ value: network, label: network });
  const isLoggedIn = !!user;

  const changeNetwork = (option) => {
    setSelectedOption(option);
    cosmos.url = networks[option.value].lcd;
    cosmos.chainId = option.value;
    window.localStorage.setItem('wallet.network', option.value);
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  if (i18n.options.resources[locale]) {
    if (i18n.language != locale) {
      changeLanguage(locale);
    }
  } else {
    history.replace(`/${i18n.options.fallbackLng}${location.pathname}`);
  }

  useEffect(() => {
    // send ready signal
    window.opener?.postMessage('ready', '*');
  }, []);

  return (
    <>
      <div className="inner">
        <div className="header">
          <h1>
            <img src="/img/oraichain_logo.png" alt="" width={145} />
          </h1>
          <Select defaultValue={selectedOption} onChange={changeNetwork} options={options} className="select" />
        </div>
        <div className="keystation-url-info">
          <strong>
            <i className="fa fa-fw fa-lock" />
            {cosmos.chainId}
          </strong>
          {t('usingSecureConnection')}
        </div>

        <Switch>
          <Route path={`${match.url}/signin`} component={SignIn} />
          <Route path={`${match.url}/import`} component={Import} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/send`} component={Send} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/transaction`} component={Transaction} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/session`} component={Session} />
        </Switch>
      </div>
      <div className="footer">
        <div>
          <Link to={generateLanguage('vn', location)}>
            <button onClick={() => changeLanguage('vn')}>{getUnicodeFlagIcon('VN')}</button>
          </Link>

          <Link to={generateLanguage('en', location)}>
            <button onClick={() => changeLanguage('en')}>{getUnicodeFlagIcon('US')}</button>
          </Link>
        </div>

        {user && !location.pathname?.match(/\/(?:signin|import)\b/) && (
          <button onClick={() => updateUser(null)}>
            Logout <i className="fa fa-sign-out" />
          </button>
        )}

        <a href="https://github.com/oraichain/cosmosjs.git" target="_blank">
          <button>
            <i className="fa fa-fw fa-github" />
          </button>
        </a>
      </div>
    </>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user
  };
}

export default connect(mapStateToProps, actions)(App);
