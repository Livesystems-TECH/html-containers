const CYCLE_DURATION = 20000;
const COEFFICIENT = 0.9;
const TEST_DATA = {
	sunrise: '05:35',
	sunset: '21:28',
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
	this.ready();
};
LSContainer.prototype.adjustSize = function(offset = 100) {
	const orbit = document.getElementById('orbit');
	const orbitPath = document.getElementById('orbit-path');
	if (orbit) {
		const screenWidth  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		const screenHeight = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
		const smallestSide = Math.min(screenWidth, screenHeight);
		const orbitSize = smallestSide - offset;
		orbit.style.width = orbitSize + 'px';
		orbit.style.height = offset + 'px';
		if (orbitPath) {
			orbitPath.style.width = orbitSize + 'px';
			orbitPath.style.height = orbitSize + 'px';
		}
	}
}
LSContainer.prototype.getPeriodsData = function() {
	const sunriseRaw = this.get('sunrise');
	const sunsetRaw = this.get('sunset');
	if (!sunriseRaw || !sunsetRaw) {
		throw new Error('No sunset/sunrise data.');
	}
	const [sunriseH, sunriseM] = sunriseRaw.split(':');
	const [sunsetH, sunsetM] = sunsetRaw.split(':');
	const sunrise = sunriseH * 3600 + sunriseM * 60;
	const sunset = sunsetH * 3600 + sunsetM * 60;
	return {
		sunrise,
		sunset,
		day: sunset - sunrise,
		night: sunrise + (24 * 3600 - sunset)
	}
};
LSContainer.prototype.showNowTime = function(hours, minutes) {
	const sunElement = document.getElementById('sun');
	const infoElement = document.getElementById('now-info');
	if (sunElement && infoElement) {
		const nowString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
		const { top, left } = sunElement.getBoundingClientRect();
		infoElement.style.top = top + 80 + 'px';
		infoElement.style.left = left - 100 + 'px';
		infoElement.querySelector('strong').textContent = nowString;
	}
};

LSContainer.prototype.stopAtNow = function () {
	const date = new Date();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	const seconds = date.getSeconds();
	const nowSec = hours * 3600 + minutes * 60 + seconds;
	const { sunrise, sunset, day, night } = this.getPeriodsData();
	let timeout = CYCLE_DURATION;
	if (nowSec > sunrise && nowSec < sunset) {
		const fraction = (nowSec - sunrise) / (day * 2);
		timeout = CYCLE_DURATION * fraction;
	} else {
		const beforeMidnight = 24 * 3600 - sunset;
		const timeGone = nowSec > sunset ? nowSec - sunset : beforeMidnight + nowSec;
		const fraction = timeGone / (night * 2);
    timeout = CYCLE_DURATION / 2 + CYCLE_DURATION * fraction;
	}
	setTimeout(() => {
		this.stopAnimation();
		this.showNowTime(hours, minutes);
		setTimeout(() => {
			this.startAnimation();
		}, 2000)
	}, timeout * COEFFICIENT)
}

LSContainer.prototype.stopAnimation = function () {
	const sunsetContainer = document.getElementById('sunset-container');
	sunsetContainer.classList.add('paused');
}

LSContainer.prototype.startAnimation = function () {
	const sunsetContainer = document.getElementById('sunset-container');
	sunsetContainer.classList.remove('paused');
}

LSContainer.prototype.showDayInfo = function() {
	const lengthBlock = document.getElementById('period-length');
	if (lengthBlock) {
		const { day } = this.getPeriodsData();
		const hours = ~~(day / 3600);
		const minutes = ~~((day % 3600) / 60);
		const dayLengthString = `${hours}`.padStart(2,'0') + ':' + `${minutes}`.padStart(2,'0');
		const title = lengthBlock.querySelector('div');
		const value = lengthBlock.querySelector('strong');
		if (title && value) {
			title.textContent = 'Day length';
			value.textContent = dayLengthString;
		}
	}
}

LSContainer.prototype.showNightInfo = function() {
	const lengthBlock = document.getElementById('period-length');
	if (lengthBlock) {
		const { night } = this.getPeriodsData();
		const hours = ~~(night / 3600);
		const minutes = ~~((night % 3600) / 60);
		const nightLengthString = `${hours}`.padStart(2,'0') + ':' + `${minutes}`.padStart(2,'0');
		const title = lengthBlock.querySelector('div');
		const value = lengthBlock.querySelector('strong');
		if (title && value) {
			title.textContent = 'Night length';
			value.textContent = nightLengthString;
		}
	}
}

LSContainer.prototype.showSunInfo = function() {
	const sunriseRaw = this.get('sunrise');
	const sunsetRaw = this.get('sunset');
	if (!sunriseRaw || !sunsetRaw) {
		throw new Error('No sunset/sunrise data.');
	}
	const sunriseElement = document.querySelector('#sunrise-info strong');
	const sunsetElement = document.querySelector('#sunset-info strong');
	if (sunriseElement && sunsetElement) {
		sunriseElement.textContent = sunriseRaw;
		sunsetElement.textContent = sunsetRaw;
	}
}

LSContainer.prototype.play = function() {
	if (window.watchFps) {
		window.watchFps();
	}
	this.adjustSize();
	const sunsetContainer = document.getElementById('sunset-container');
	sunsetContainer.classList.remove('initial');

	this.stopAtNow();
	this.showSunInfo();
	this.showDayInfo();
	this.startAnimation();

	const sunElement = document.getElementById('sun');

	setTimeout(() => {
		this.showNightInfo()
	}, CYCLE_DURATION / 2 + 2000);
	setTimeout(() => {
		sunElement.classList.add('hidden');
	}, CYCLE_DURATION);

	document.dispatchEvent(new Event('playStarted'));
};

LSContainer.prototype.emulateStart = function () {
	this.setup({ detail: this.testData });
	this.play();
}

window.onload = function() {
	const container = new LSContainer();
	window.webContainer = container;
	container.init();
	// uncomment next line to test on PC
	// container.emulateStart()
};
