'use strict';

import level from 'level';
import bytewise from 'bytewise';

module.exports = function createArchiveDb (path) {
	return level(path, {
		keyEncoding: bytewise,
		valueEncoding: 'json'
	});
};
