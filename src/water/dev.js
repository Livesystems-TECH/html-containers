function renderControls() {
  const devWrapper = document.createElement('div');
  devWrapper.id = 'dev-wrapper';
  devWrapper.classList.add('dev-wrapper')
  devWrapper.innerHTML = `<div class="dev-controls">
    <button id='play-button'>Play</button>
    <button id='validate-button'>Validate</button>
  </div>`;
  const controlsStyle = document.createElement('style');
  controlsStyle.innerHTML = `
      .dev-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #C6E6E7;
        z-index: 999;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .dev-controls { 
        display: flex;
        gap: 25px; 
      }
      .dev-controls button {
        font-size: 32px;
        color: #fff;
        width: 200px;
        height: 200px;
        border-radius: 20px;
        background-color: #005b50;
        cursor: pointer;
      }
      .dev-wrapper.hidden {
        display: none;
      }
    `;
  controlsStyle.nonce = btoa('livesystems');
  document.head.appendChild(controlsStyle);
  document.body.appendChild(devWrapper);
}

let playPopup;
let validatePopup;

function play() {
  if (playPopup && !playPopup.closed) {
    playPopup.close();
    playPopup = undefined;
    return;
  }
  const height = ~~(window.screen.availHeight || window.outerHeight || window.innerHeight);
  const width = ~~(height * 9 / 16);
  playPopup = window.open('index.html#play-dev', 'play', `width=${width} height=${height}`);
  playPopup.focus();
}

function validate() {
  if (validatePopup && !validatePopup.closed) {
    validatePopup.window.close();
    return;
  }
  const height = ~~(window.screen.availHeight || window.outerHeight || window.innerHeight);
  const width = ~~(height * 9 / 16);
  validatePopup = window.open('index.html#validate', 'validate', `width=${width} height=${height}`);
  validatePopup.focus();
}

document.addEventListener('DOMContentLoaded', function() {
  if (window.location.hash && window.location.hash === '#play-dev') {
    setTimeout(() =>  window.document.dispatchEvent(new CustomEvent('test')), 200)
    return;
  }
  if (window.location.hash && window.location.hash === '#validate') {
    let invalidTimeout;
    function showResult(message) {
      clearTimeout(invalidTimeout);
      alert(message);
      const self = window.self;
      self.opener = window.self;
      self.close();
    }
    invalidTimeout = setTimeout(() => showResult('INVALID!\nNo response / no play started event'), 1500);
    const defaultOnError = window.onerror;
    window.onerror = function () {
      showResult('INVALID!\nErrors in container script.\nCheck browser console.');
    }
    setTimeout(() => {
      if (!window.webContainer) return showResult('INVALID!\nNo container instance found.');
      if (!window.webContainer.data) return showResult('INVALID!\nNo key-value storage found.');
      if (!window.webContainer.testData) return showResult('INVALID!\nNo test data found.');
      ['init', 'setup', 'play'].forEach(
        (method) => !window.webContainer[method] && showResult('INVALID\nNo "' + method + '" method found in container instance.')
      );
      const setupEvent = new CustomEvent('setup', {
        detail: Object.assign({ abc: 123 }, window.webContainer.testData)
      });
      window.document.addEventListener('ptvready', function () {
        window.document.dispatchEvent(new CustomEvent('play'))
      })
      window.document.addEventListener('playStarted', function () {
        const value = window.webContainer.data.abc;
        const message = !value || value !== 123 ? 'INVALID!\nKey-value passing doesn\'t work.' : 'VALID';
        showResult(message);
      })
      window.document.dispatchEvent(setupEvent);
    }, 500);
    window.onerror = defaultOnError;
    return;
  }
  renderControls();
  setTimeout(() => {
    document.getElementById('play-button').addEventListener('click', play, false);
    document.getElementById('validate-button').addEventListener('click', validate, false);
  }, 100)
});

