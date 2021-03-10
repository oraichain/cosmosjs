export const networks = {
  Oraichain: {
    denom: 'orai',
    lcd: process.env.REACT_APP_LCD || 'http://localhost:1317'
  },
  cosmos: {
    denom: 'atom',
    lcd: 'https://lcd-cosmos-app.cosmostation.io'
  }
};
