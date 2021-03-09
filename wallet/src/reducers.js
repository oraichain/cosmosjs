// reducers.js
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

const userReducer = (state = {}, action = {}) => {
  switch (action.type) {
    case 'updateUser':
      return action.payload;
    default:
      return state;
  }
};

const createRootReducer = (history) =>
  combineReducers({
    user: userReducer,
    router: connectRouter(history)
  });

export default createRootReducer;
