import { base64String } from './base64.js';

const TEST_DATA = {
	animation: 'zoom',
	category: 'WISSEN',
	text: 'Es gibt 208 Schweizer Berge, die mehr als 3000 Meter hoch sind.',
  // ~920kb jpg image base64 encoded
	imageSrc: base64String || ''
}

/*
 * LiveSystems webContainer
 */
function LSContainer() {
	this.data = {};
	this.testData = TEST_DATA;
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
LSContainer.prototype.setup = function(event) {
	const detail = event.detail || {};
	Object.entries(detail).forEach(
		([key, value]) => this.set(key, value)
	);
	const imgElement = document.getElementById('news-photo');
	if (imgElement) {
		imgElement.src = this.get('imageSrc');
	}
	this.adjustSize();
	this.ready();
};
LSContainer.prototype.adjustSize = function() {
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty('--vh', `${vh}px`);
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
			return;
		case 'move-to-right':
			return;
	}
};
LSContainer.prototype.play = function() {
	if (window.watchFps) {
		window.watchFps();
	}
	const wrapper = document.getElementById('wrapper');
	const text = document.getElementById('text');
	const textContainer = document.getElementById('text-container');
	const category = document.getElementById('category');
	if (wrapper) {
		wrapper.classList.add('in');
		text.textContent = this.get('text') || '';
		const categoryText = this.get('category')
		if (categoryText) {
			category.textContent = categoryText;
		}
		textContainer.classList.add('in');
		this.animate();
	}
	document.dispatchEvent(new Event('playStarted'));
};

LSContainer.prototype.emulateStart = function () {
	this.setup({ detail: TEST_DATA });
	this.play();
}

window.onload = function() {
	const container = new LSContainer();
	window.webContainer = container;
	container.init();
	// uncomment next line to test on PC
	// container.emulateStart()
};
