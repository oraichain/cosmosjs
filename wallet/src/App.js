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
import ImportPrivateKey from './components/ImportPrivateKey';
import Session from './components/Session';
import Home from './components/Home';
import Transaction from './components/Transaction';
import ContractQuery from './components/contract/Query';
import ContractExecute from './components/contract/Execute';
import ContractDeploy from './components/contract/Deploy';
import ScriptSet from './components/provider/SetScript';
import ScriptEdit from './components/provider/EditScript';
import RequestSet from './components/airequest/SetRequest';
import RequestGet from './components/airequest/GetRequest';
import { Cosmos } from 'cosmosjs';
import { networks } from './config';
import { customStyles } from './utils';

import './App.css';

const url = new window.URL(window.location.href);
const network = url.searchParams.get('network') || window.localStorage.getItem('wallet.network') || 'Oraichain';
const path = url.searchParams.get('path');
const lcd = url.searchParams.get('lcd') || (networks[network]?.lcd ?? 'https://lcd.orai.io');
// init cosmos version
const cosmos = new Cosmos(lcd, network);
const symbol = networks[network]?.denom ?? 'orai';
cosmos.setBech32MainPrefix(symbol);
if (path && path !== 'undefined') {
  cosmos.setPath(path);
}

// global params
window.cosmos = cosmos;
window.localStorage.setItem('wallet.network', network);
const $ = window.jQuery;

// there is post message from parent window, just update the stdSignMsgByPayload and ready for broadcast
window.addEventListener(
  'message',
  (e) => {
    // not the client to send message
    if (e.data.tx) {
      const txBody = e.data.tx;
      window.stdSignMsgByPayload = txBody;
      $('#tx-json').html(JSON.stringify(txBody));
    } else if (e.data.file) {
      // console.log(e.data.file);
      $('#filename').trigger('file', e.data.file);
    }
  },
  false
);

// trigger when document ready
$(() => {
  // send ready signal
  window.opener?.postMessage('ready', '*');
});

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
    console.log('match params: ', match);
    if (i18n.language !== locale) {
      changeLanguage(locale);
    }
  } else {
    window.location.href = `/${i18n.options.fallbackLng}${location.pathname}`;
  }

  return (
    <>
      <div className="inner">
        <div className="header">
          <h1>
            <Link to={`${match.url}`}>
              <img src="/img/full-logo-dark.png" alt="Home" width={145} />
            </Link>
          </h1>
          <Select styles={customStyles} defaultValue={selectedOption} onChange={changeNetwork} options={options} className="select" />
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
          <Route path={`${match.url}/import-privatekey`} component={ImportPrivateKey} />
          <PrivateRoute exact isLoggedIn={isLoggedIn} path={`${match.url}/`} component={Home} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/contract/query`} component={ContractQuery} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/contract/execute`} component={ContractExecute} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/contract/deploy`} component={ContractDeploy} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/provider/set`} component={ScriptSet} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/provider/edit`} component={ScriptEdit} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/airequest/set`} component={RequestSet} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/airequest/get`} component={RequestGet} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/send`} component={Send} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/transaction`} component={Transaction} />
          <PrivateRoute isLoggedIn={isLoggedIn} path={`${match.url}/session`} component={Session} />
          {isLoggedIn ? null : <Redirect from="*" to="/signin" />}
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
