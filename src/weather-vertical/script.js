const PERIODS = {
	morning: { key: 'morning', weatherVar: 'wMorning', tempVar: 'tMorning', title: 'Morgen' },
	midday: { key: 'midday', weatherVar: 'wMidday', tempVar: 'tMidday', title: 'Mittag' },
	evening: { key: 'evening', weatherVar: 'wEvening', tempVar: 'tEvening', title: 'Abend' },
}
const WEATHERS = ['sun', 'cloud', 'sun-cloud', 'rain', 'thunder'];
const TEST_DATA = {
	place: 'Köniz',
	day1: 'Heute',
	day2: 'Morgen',
	wMorning1: 'rain',
	tMorning1: 19,
	wMidday1: 'sun',
	tMidday1: 29,
	wEvening1: 'cloud',
	tEvening1: 24,
	wMorning2: 'sun-cloud',
	tMorning2: 20,
	wMidday2: 'rain',
	tMidday2: 22,
	wEvening2: 'thunder',
	tEvening2: 18
};

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

LSContainer.prototype.showWeatherCard = function (period, dayIndex) {
	if (!Object.keys(PERIODS).includes(period)) throw new Error('Wrong period.');
	const { key, weatherVar, tempVar, title } = PERIODS[period];
	const weather = this.get(weatherVar + dayIndex);
	const temperature = this.get(tempVar + dayIndex);
	if (!weather || !WEATHERS.includes(weather)) throw new Error('Wrong weather.');
	if (!temperature || !parseInt(temperature)) throw new Error('Wrong temperature.');
	const card = document.getElementById(`period-${key}-${dayIndex}`);
	const widget = document.getElementById('ls-' + weather + '-widget');
	if (!card || !widget) throw new Error('Wrong template, no period/widget containers.');
	const widgetClone = widget.cloneNode(true);
	const tempElement = widgetClone.querySelector('div.temperature');
	const periodElement = widgetClone.querySelector('div.period-title');
	if (!tempElement || !periodElement) throw new Error('Wrong card/widget template.');
	periodElement.textContent = title;
	tempElement.textContent = temperature + '°';
	card.appendChild(widgetClone);
	setTimeout(() => card.classList.add('in'), 100)
}

LSContainer.prototype.showTitles = function (day, place, index) {
	const placeTitle = document.getElementById('place-title');
	const dayTitle = document.getElementById('day-title-' + index);
	dayTitle.textContent = day;
	placeTitle.textContent = place;
	dayTitle.classList.add('in');
	placeTitle.classList.add('in');
}

LSContainer.prototype.showBg = function (index) {
	const cards1 = document.getElementById('cards-' + index);
	cards1.classList.add('in');
}

LSContainer.prototype.adjustSize = function(initialCardsWidth) {
	const cardsElement = document.getElementById('cards-1');
	const wrapperElement = document.getElementById('wrapper');
	if (cardsElement && wrapperElement) {
		const wrapperWidth  = wrapperElement.clientWidth;
		const proportion = +(wrapperWidth / (initialCardsWidth)).toFixed(2);
		wrapperElement.style.zoom = proportion * 100 + '%';
	}
}

LSContainer.prototype.play = function() {
	// uncomment to see live fps value on screen
	// window.watchFps && window.watchFps();
	this.adjustSize(720);
	const place = this.get('place');
	const day1 = this.get('day1');
	const day2 = this.get('day2');
	if (!place || !day1 || !day2) {
		throw new Error('Missing day/place data.');
	}
	this.showTitles(day1, place, 1);
	this.showBg(1);
	setTimeout(() => this.showWeatherCard('morning', '1'), 500);
	setTimeout(() => this.showWeatherCard('midday', '1'), 3500);
	setTimeout(() => this.showWeatherCard('evening', '1'), 6500);
	setTimeout(() => {
	this.showTitles(day2, place, 2);
	this.showBg(2);
		setTimeout(() => this.showWeatherCard('morning', '2'), 500);
		setTimeout(() => this.showWeatherCard('midday', '2'), 3500);
		setTimeout(() => this.showWeatherCard('evening', '2'), 6500);
	}, 10500);
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
