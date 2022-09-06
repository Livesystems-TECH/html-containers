// change to true for development without local server
const useFakeJson = false;

function LSContainer() {
  this.data = {};
  this.testData = {
    temp: 19.3
  };
}

LSContainer.prototype.init = function () {
  document.addEventListener("setup", this.setup.bind(this));
  document.addEventListener("play", this.play.bind(this));
  document.addEventListener('test', this.emulateStart.bind(this));
};
LSContainer.prototype.get = function (key) {
  return this.data[key];
};
LSContainer.prototype.set = function (key, value) {
  return (this.data[key] = value);
};

LSContainer.prototype.ready = function () {
  const event = new Event("ptvready");

  // sends ptvready event to own document where parent frame listens to
  document.dispatchEvent(event);
};

LSContainer.prototype.adjustSize = function() {
  // for f-12 inner width/height can be 0 on loading, but outer values are always set
  const screenHeight = window.innerHeight || window.outerHeight;
  const vh = screenHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}

LSContainer.prototype.setup = function(event) {
  return this.getVariables(event, useFakeJson)
    .then(data => Object.entries(data).forEach(
      ([key, value]) => this.set(key, value)
    ))
    .then(() => this.adjustSize())
    .then(() => this.ready());
};

LSContainer.prototype.getVariables = function (event, fakeJson = false) {
  return fakeJson
    ? Promise.resolve(event.detail || {})
    : fetch('content.json')
      .then(response => response.json());
}

LSContainer.prototype.play = function () {
  // window.watchFps && window.watchFps();

  const temp = document.getElementById('temp');
  const content = document.getElementById('content');
  temp.textContent = this.get('temp') + '°';
  content.classList.add('in');
  const event = new Event('playStarted');
  document.dispatchEvent(event);
};

LSContainer.prototype.emulateStart = function () {
  this.setup({ detail: this.testData })
    .then(() => this.play())
}

// registers onload event on own window
window.onload = function () {
  const container = new LSContainer();
  window.webContainer = container;
  container.init();
};
