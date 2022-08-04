/*
 * LiveSystems webContainer
 */
function LSContainer() {
	this.data = {};
	this.testData = {};
}

LSContainer.prototype.init = function () {
	document.addEventListener('setup', this.setup.bind(this));
	document.addEventListener('play', this.play.bind(this));
	document.addEventListener('test', this.emulateStart.bind(this));
}
LSContainer.prototype.get = function (key) {
	return this.data[key];
}
LSContainer.prototype.set = function (key, value) {
	return this.data[key] = value;
}

LSContainer.prototype.ready = function() {
	const event = new Event('ptvready');

	// sends ptvready event to own document where parent frame listens to
	document.dispatchEvent(event);
};
LSContainer.prototype.setup = function() {
	return fetch('content.json')
		.then(response => response.json())
		.then(content => console.log(content) || Object.entries(content).forEach(
			([key, value]) => this.set(key, value)
		))
		.then(() => this.adjustSize())
		.then(() => this.ready());
};
LSContainer.prototype.adjustSize = function() {
	const vh = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) * 0.01;
	document.documentElement.style.setProperty('--vh', vh + 'px');
}
LSContainer.prototype.animate = function() {
	const imgElement = document.getElementById('news-photo');
	const animation = this.get('animation');
	if (!imgElement) {
		return;
	}
	switch (animation) {
		case 'zoom':
			imgElement.classList.add('zoomed');
			return;
		case 'move-to-left':
			imgElement.classList.add('to-left');
			return;
		case 'move-to-right':
			imgElement.classList.add('to-right');
			return;
		case 'none':
		default:
			return;
	}
};
LSContainer.prototype.play = function() {
	// uncomment to see live fps value on screen
	// window.watchFps && window.watchFps();
	const wrapper = document.getElementById('wrapper');
	const text = document.getElementById('text');
	const textContainer = document.getElementById('text-container');
	const title = document.getElementById('title');
	if (wrapper) {
		wrapper.classList.add('in');
		text.textContent = this.get('text') || '';
		const titleText = this.get('title')
		if (titleText) {
			title.textContent = titleText;
		}
		textContainer.classList.add('in');
		this.animate();
	}
	const event = new Event('playStarted');
	document.dispatchEvent(event);
};

LSContainer.prototype.emulateStart = function () {
	this.setup()
		.then(() => {
			this.play();
		})
}

window.onload = function() {
	const container = new LSContainer();
	window.webContainer = container;
	container.init();
	// uncomment next line to test on PC
	// container.emulateStart()
};
