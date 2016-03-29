'use strict';

import wxbot from './wxbot';

let bot = null;
window.getBot = () => {
	if (!bot)
		bot = new wxbot();
	return bot;
};
window.deleteBot = () => {
	bot = null;
};
window.getWxState = () => {
	return wxbot.STATE;
};
