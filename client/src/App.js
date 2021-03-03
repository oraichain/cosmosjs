import React from 'react';
import { Route, Redirect, Switch, useLocation, useRouteMatch, useHistory } from 'react-router';
import { pathToRegexp, compile } from 'path-to-regexp';
import { Link } from 'react-router-dom';
import getUnicodeFlagIcon from 'country-flag-icons/unicode';

import i18n from './i18n';

import About from './components/About';
import Home from './components/Home';
import Topics from './components/Topics';
import SignIn from './components/SignIn';

// import { Cosmos } from './cosmos';
// import message from './cosmos/messages/proto';

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
      <Switch>
        <Route path={`${match.url}/login`} component={SignIn} />
        <Route path={`${match.url}/about`} component={About} />
        <Route path={`${match.url}/topics`} component={Topics} />
      </Switch>

      <div className="languages">
        <Link to={generateLanguage('vn', location)}>
          <button onClick={() => changeLanguage('vn')}>{getUnicodeFlagIcon('VN')}</button>
        </Link>

        <Link to={generateLanguage('en', location)}>
          <button onClick={() => changeLanguage('en')}>{getUnicodeFlagIcon('US')}</button>
        </Link>
      </div>
    </div>
  );
};

export default App;
