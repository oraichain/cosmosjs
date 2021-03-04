import React from 'react';
import { Route, Redirect, Switch, useLocation, useRouteMatch, useHistory } from 'react-router';
import { pathToRegexp, compile } from 'path-to-regexp';
import { Link } from 'react-router-dom';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';

import i18n from './i18n';

import SignIn from './components/SignIn';
import Import from './components/Import';
import Session from './components/Session';
import Transaction from './components/Transaction';

import './App.css';

const lang = i18n.language;
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

const changeLanguage = (lng) => {
  i18n.changeLanguage(lng);
};

const App = () => {
  const location = useLocation();
  const history = useHistory();
  const match = useRouteMatch();
  const { locale } = match.params;
  if (i18n.options.resources[locale]) {
    if (lang != locale) {
      changeLanguage(locale);
    }
  } else {
    history.replace(`/${i18n.options.fallbackLng}${location.pathname}`);
  }

  return (
    <div className="inner">
      <div className="header">
        <h1>
          <img src="/img/oraichain_logo.png" alt="" width={145} />
        </h1>
      </div>
      <Switch>
        <Route path={`${match.url}/signin`} component={SignIn} />
        <Route path={`${match.url}/import`} component={Import} />
        <Route path={`${match.url}/transaction`} component={Transaction} />
        <Route path={`${match.url}/session`} component={Session} />
      </Switch>

      <div className="footer">
        <Link to={generateLanguage('vn', location)}>
          <button onClick={() => changeLanguage('vn')}>{getUnicodeFlagIcon('VN')}</button>
        </Link>

        <Link to={generateLanguage('en', location)}>
          <button onClick={() => changeLanguage('en')}>{getUnicodeFlagIcon('US')}</button>
        </Link>

        <div className="form-fotter">
          <a href="https://github.com/cosmostation/keystation" target="_blank">
            <i className="fa fa-fw fa-github" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;
