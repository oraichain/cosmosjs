import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router';
import { Redirect } from 'react-router-dom';
import { ConnectedRouter } from 'connected-react-router';
import configureStore, { history } from './configureStore';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import App from './App';

import './index.css';
import reportWebVitals from './reportWebVitals';

const store = configureStore();

const render = (Component) =>
  ReactDOM.render(
    <I18nextProvider i18n={i18n}>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Switch>
            <Route path="/:locale" component={Component} />
            <Redirect to="/en" />
          </Switch>
        </ConnectedRouter>
      </Provider>
    </I18nextProvider>,
    document.getElementById('app')
  );

render(App);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
