// Find Left Boundry of the Screen/Monitor
function FindLeftScreenBoundry() {
  // Check if the window is off the primary monitor in a positive axis
  // X,Y                  X,Y                    S = Screen, W = Window
  // 0,0  ----------   1280,0  ----------
  //     |          |         |  ---     |
  //     |          |         | | W |    |
  //     |        S |         |  ---   S |
  //      ----------           ----------
  if (window.leftWindowBoundry() > window.screen.width) {
    return window.leftWindowBoundry() - (window.leftWindowBoundry() - window.screen.width);
  }

  // Check if the window is off the primary monitor in a negative axis
  // X,Y                  X,Y                    S = Screen, W = Window
  // 0,0  ----------  -1280,0  ----------
  //     |          |         |  ---     |
  //     |          |         | | W |    |
  //     |        S |         |  ---   S |
  //      ----------           ----------
  // This only works in Firefox at the moment due to a bug in Internet Explorer opening new windows into a negative axis
  // However, you can move opened windows into a negative axis as a workaround
  if (window.leftWindowBoundry() < 0 && window.leftWindowBoundry() > window.screen.width * -1) {
    return window.screen.width * -1;
  }

  // If neither of the above, the monitor is on the primary monitor whose's screen X should be 0
  return 0;
}

window.leftScreenBoundry = FindLeftScreenBoundry;

function PopupCenter(url, title, w, h) {
  var newWindow = window.open(
    url,
    title,
    'resizable=1, scrollbars=1, fullscreen=0, height=' + h + ', width=' + w + ', screenX=' + window.leftScreenBoundry + ' , left=' + window.leftScreenBoundry + ', toolbar=0, menubar=0, status=1'
  );
  return newWindow;
}

class Keystation {
  constructor(client, lcd, path, keystationUrl) {
    // {client,lcd,path,keystationUrl}
    if (typeof client === 'object') {
      lcd = client.lcd;
      path = client.path;
      keystationUrl = client.keystationUrl;
      client = client.client;
    }
    this.client = client || window.location.origin;
    this.lcd = lcd;
    this.path = path;
    this.keystationUrl = keystationUrl || 'http://localhost:3000';
    // this.keystationUrl = "https://keystation.cosmostation.io";
  }

  getApiUrl(type = 'transaction') {
    switch (type) {
      case 'signin':
        return 'signin';
      case 'transaction':
        return 'transaction';
      case 'deploy':
        return 'contract/deploy';
      default:
        return type;
    }
  }

  openWindow(type = 'transaction', payload = '', account = '') {
    // The account parameter is required for users having multiple keychain accounts.
    var apiUrl = this.getApiUrl(type);

    const url =
      this.keystationUrl +
      '/' +
      apiUrl +
      '?account=' +
      encodeURIComponent(account) +
      '&client=' +
      encodeURIComponent(this.client) +
      '&lcd=' +
      encodeURIComponent(this.lcd) +
      '&path=' +
      encodeURIComponent(this.path) +
      '&payload=' +
      encodeURIComponent(payload);
    // create new one if closed

    return PopupCenter(url, '', '400', '705');
  }

  postMessage(popup, data, type) {
    popup.focus();
    popup.postMessage(data, '*');
  }

  send(message) {
    const popup = this.openWindow('transaction');
    const handler = (e) => {
      if (e.data === 'ready') {
        this.postMessage(popup, { tx: message, client: this.client });
      }
      window.removeEventListener('message', handler);
    };
    window.addEventListener('message', handler);
    return popup;
  }

  deploy(file) {
    const data = { file: file, client: this.client };

    const popup = this.openWindow('deploy');
    const handler = (e) => {
      if (e.data === 'ready') {
        this.postMessage(popup, data);
      }
      window.removeEventListener('message', handler);
    };
    window.addEventListener('message', handler);
    return popup;
  }
}

if (typeof module === 'object' && module.exports) {
  module.exports = Keystation;
} else {
  window.Keystation = Keystation;
}
