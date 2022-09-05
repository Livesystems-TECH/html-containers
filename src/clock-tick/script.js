const DIGIT_EL_IDS = ['hours-l', 'hours-r', 'minutes-l', 'minutes-r', 'seconds-l', 'seconds-r'];
const MAX_DIGITS = [2, 9, 5, 9, 5, 9];
const TEST_DATA = {};

/*
 * LiveSystems webContainer
 */
function LSContainer() {
	this.data = {};
	this.testData = TEST_DATA;
	this.prevDigits = [-1,-1,-1,-1,-1,-1];
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
	return this.getVariables(event)
		.then(data => Object.entries(data).forEach(
			([key, value]) => this.set(key, value)
		))
		.then(() => this.ready());
};

LSContainer.prototype.getVariables = function (event) {
	return Promise.resolve(event.detail || {});
}

LSContainer.prototype.adjustSize = function(initialClockSize, offset = 40) {
	const clockElement = document.getElementById('clock');
	if (clockElement) {
		const screenWidth  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		const screenHeight = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
		const smallestSide = Math.min(screenWidth, screenHeight);
		const proportion = +(smallestSide / (initialClockSize + offset)).toFixed(2);
		clockElement.style.zoom = proportion * 100 + '%';
	}
}

LSContainer.prototype.initClock = function() {
	const container = document.getElementById('clock');
	const dynamicElements = container.querySelector('.dynamic');
	const hourElement = container.querySelector('.hour');
	const minuteElement = container.querySelector('.minute');
	const secondElement = container.querySelector('.second');

	function addMinuteSegment(n) {
		const className = n % 5 === 0 ? 'major' : 'whole';
		const stroke = createDiv('element minute-line ' + className);
		attachTo(dynamicElements, stroke, n)
	}
	function addHourSegment(n) {
		const className = 'hour-item hour-' + n;
		const text = createDiv('anchor hour-text ' + className);
		const content = createDiv('origin-center content', n)
		append(content).to(text)
		rotate(text, -n * 5)
		attachTo(dynamicElements, text, n * 5)
	}
	for (let i = 1; i <= 60; i += 1) {
		addMinuteSegment(i);
		if (i % 5 === 0) {
			addHourSegment(i / 5);
		}
	}
	setTimeout(() => this.startClock(secondElement, minuteElement, hourElement), 0)
}

LSContainer.prototype.updateFlipPrevDigit = function(container, digit, maxDigit = 9) {
	if (container) {
		const prevDigit = String(digit === 0 ? maxDigit : digit - 1);
		const prevDigitElements = container.querySelectorAll('.previous .digit');
		if (prevDigitElements.length === 2) {
			prevDigitElements.forEach((el) => el.textContent = prevDigit);
		}
	}
}

LSContainer.prototype.updateFlipNextDigit = function(container, digit) {
	if (container) {
		const nextDigitElements = container.querySelectorAll('.next .digit');
		if (nextDigitElements.length !== 2) {
			return;
		}
		nextDigitElements.forEach((el) => el.textContent = String(digit));
	}
}

LSContainer.prototype.turnFlipClock = function(hours, minutes, seconds) {
	const flipClock = document.getElementById('flip-clock');
	const [hourL, hourR] = `${hours}`.padStart(2, '0').split('');
	const [minuteL, minuteR] = `${minutes}`.padStart(2, '0').split('');
	const [secondL, secondR] = `${seconds}`.padStart(2, '0').split('');
	const digits = [hourL, hourR, minuteL, minuteR, secondL, secondR];

	const elementsToUpdate = digits.reduce((acc, digit, index) => {
		const element = document.getElementById(DIGIT_EL_IDS[index]);
		if (digit === this.prevDigits[index]) {
			element.classList.remove('active');
			return acc;
		}
		const maxDigit = MAX_DIGITS[index];
		this.updateFlipPrevDigit(element, +digit, maxDigit);
		acc.push({ element, digit });
		return acc;
	}, []);

	flipClock.classList.remove('play');

	elementsToUpdate.forEach(({ element, digit }) => {
		element.classList.add('active');
		this.updateFlipNextDigit(element, +digit);
	})

	this.prevDigits = digits;
	setTimeout(() => {
		flipClock.classList.add('play');
	}, 0);
}

LSContainer.prototype.startClock = function(secondElement, minuteElement, hourElement) {
	let prevSeconds = 61;
	const turnFlipClock = this.turnFlipClock.bind(this);
	function draw() {
		const now = new Date();
		const seconds = now.getSeconds();
		if (prevSeconds !== seconds) {
			const hours = now.getHours();
			const minutes = now.getMinutes();
			const time = hours * 3600 + minutes * 60 + seconds + now.getMilliseconds() / 1000;
			setTimeout(() => {
				rotate(secondElement, time);
				rotate(minuteElement, time / 60);
				rotate(hourElement, time / 60 / 12);
			}, 0);
			turnFlipClock(hours, minutes, seconds);
		}
		prevSeconds = seconds;
		requestAnimationFrame(draw);
	}
	draw();
}

LSContainer.prototype.play = function() {
	// uncomment to see live fps value on screen
	window.watchFps && window.watchFps();
	this.adjustSize(400);
	this.initClock();
	document.dispatchEvent(new Event('playStarted'));
};

function rotate(element, seconds) {
	element.style.webkitTransform = 'rotate(' + (seconds * 6) + 'deg) translate3d(0,0,0)'
	element.style.transform = 'rotate(' + (seconds * 6) + 'deg) translate3d(0,0,0)'
}
function createDiv(className, innerHTML) {
	const element = document.createElement('div')
	element.className = className
	element.innerHTML = innerHTML || ''
	return element
}
function append(element) {
	return {
		to: function(parent) {
			parent.appendChild(element)
			return append(parent)
		}
	}
}
function attachTo(host, element, rotation) {
	const anchor = createDiv('anchor')
	rotate(anchor, rotation)
	append(element).to(anchor).to(host)
}

LSContainer.prototype.emulateStart = function () {
	this.setup({ detail: this.testData })
		.then(() => this.play());
}

window.onload = function() {
	const container = new LSContainer();
	window.webContainer = container;
	container.init();
	// uncomment next line to test on PC
	// container.emulateStart()
};
