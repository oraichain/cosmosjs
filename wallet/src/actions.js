export const updateUser = (user) => {
  return {
    type: 'updateUser',
    payload: user
  };
};

export const updateContractAddress = (address) => {
  return {
    type: 'updateContractAddress',
    payload: address
  }
}

export const updateRequestId = (address) => {
  return {
    type: 'updateRequestId',
    payload: address
  }
}
