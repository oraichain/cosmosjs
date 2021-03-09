import { createBrowserHistory } from 'history';
import { applyMiddleware, compose, createStore } from 'redux';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from './reducers';

export const history = createBrowserHistory();

// const reduxDevTools = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();

const reducer = createRootReducer(history);
const prefix = 'cosmos.user';

const configureStore = () => {
  let prevState = {};

  const defaultStateString = localStorage.getItem(prefix);
  if (defaultStateString) {
    try {
      prevState.user = JSON.parse(defaultStateString);
    } catch (ex) {
      console.log(ex);
    }
  }

  const store = createStore(
    reducer, // root reducer with router state
    prevState,
    compose(
      applyMiddleware(
        routerMiddleware(history) // for dispatching history actions
      )
      // reduxDevTools
    )
  );

  store.subscribe(() => {
    const currentState = store.getState();
    if (currentState.user !== prevState.user) {
      localStorage.setItem(prefix, JSON.stringify(currentState.user));
    }
    prevState = currentState;
  });

  return store;
};

export default configureStore;
