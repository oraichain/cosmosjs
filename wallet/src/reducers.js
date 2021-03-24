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

const contractReducer = (state = {}, action = {}) => {
  switch (action.type) {
    case 'updateContractAddress':
      return action.payload;
    default:
      return state;
  }
};

const requestReducer = (state = {}, action = {}) => {
  switch (action.type) {
    case 'updateRequestId':
      return action.payload;
    default:
      return state;
  }
};

const createRootReducer = (history) =>
  combineReducers({
    user: userReducer,
    contract: contractReducer,
    request: requestReducer,
    router: connectRouter(history)
  });

export default createRootReducer;
