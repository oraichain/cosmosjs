export const updateUser = (name, address) => {
  return {
    type: 'updateUser',
    payload: { name, address }
  };
};
