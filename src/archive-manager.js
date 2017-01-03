'use strict';

import EventEmitter from 'events';
import Dat from 'dat-node';
import through from 'through2';
import pump from 'pump';

const _db = Symbol('db');
const _archives = Symbol('archives');
const _archiveOpts = Symbol('archivesOpts');
const _byPath = Symbol('byPath');
const _byKey = Symbol('byKey');
const _byDiscoveryKey = Symbol('byDiscoveryKey');

export default class ArchiveManager extends EventEmitter {
	constructor (db) {
		if (!db) {
			throw new TypeError('ArchiveManager requires a leveldb connection');
		}
		super();

		// Save private db reference
		this[_db] = db;

		// Indecies to speed lookups
		this[_archives] = [];
		this[_archiveOpts] = {};
		this[_byPath] = {};
		this[_byKey] = {};
		this[_byDiscoveryKey] = {};

		// Always return a fresh array
		Object.defineProperty(this, 'archives', {
			enumerable: true,
			get: () => {
				return this[_archives].slice();
			}
		});
	}

	load (cb = () => {}) {
		// Load up the archives
		return this.createReadStream()
			.on('data', (d) => {
				addToManager(this, d.archive, d.opts);
			})
			.on('error', cb)
			.on('end', cb);
	}

	forEach (fnc, ctx) {
		return this[_archives].forEach((a) => {
			return fnc.call(ctx || this, a, this.getOpts(a.key));
		});
	}

	byPath (path) {
		return this[_byPath][path];
	}

	byKey (key) {
		if (typeof key !== 'string') {
			key = key.toString('hex');
		}
		return this[_byKey][key];
	}

	byDiscoveryKey (key) {
		if (typeof key !== 'string') {
			key = key.toString('hex');
		}
		return this[_byDiscoveryKey][key];
	}

	getOpts (key) {
		if (typeof key !== 'string') {
			key = key.toString('hex');
		}
		return this[_archiveOpts][key];
	}

	createReadStream (qry = {}) {
		var query = this[_db].createReadStream({
			gt: ['archive', qry.gt || null],
			lt: ['archive', qry.lt || undefined]
		});

		var datify = through.obj((row, enc, cb) => {
			var opts = {
				db: this[_db],
				importFiles: row.value.importFiles,
				joinNetwork: row.value.joinNetwork
			};

			// We have this dat, just return it
			var a = this.byKey(row.key[1]);
			if (a) {
				return cb(null, {
					archive: a,
					opts: opts
				});
			}

			// We dont have this one, create it and return
			initArchive(row.value.path, opts, function (err, dat) {
				cb(err, {
					archive: dat,
					opts: opts
				});
			});
		});

		return pump(query, datify);
	}

	create (dir, opts = {}, cb = () => {}) {
		// Optional opts and defaults
		if (typeof opts === 'function') {
			cb = opts;
			opts = {};
		}
		opts.db = this[_db];
		opts.importFiles = typeof opts.importFiles === 'boolean' ? opts.importFiles : true;
		opts.joinNetwork = typeof opts.joinNetwork === 'boolean' ? opts.joinNetwork : true;

		// Ensures we dont try to open a second copy
		var a = this.byPath(dir);
		if (a) {
			return cb(null, a);
		}

		initArchive(dir, opts, (err, dat) => {
			if (err) {
				return cb(err);
			}

			// Add dat
			addToManager(this, dat, opts);

			// save to db
			saveArchive(dat, opts, this[_db], function (err) {
				cb(err, dat);
			});
		});
	}

	importFiles (key, cb = () => {}) {
		var a = this.byKey(key);
		if (!a) {
			return cb(new Error('No archive by that key'));
		}

		// Import if this dat hasnt already done so
		if (!a.importer) {
			a.importFiles();
		}

		// Update options
		updateOptionsAndSave(this, a, {
			importFiles: true
		}, function (err) {
			cb(err, a.importer, a);
		});
	}

	joinNetwork (key, cb = () => {}) {
		var a = this.byKey(key);
		if (!a) {
			return cb(new Error('No archive by that key'));
		}

		// Only join if no current networ
		if (!a.network) {
			a.joinNetwork();
		}

		updateOptionsAndSave(this, a, {
			joinNetwork: true
		}, function (err) {
			cb(err, a.network, a);
		});
	}
}

function updateOptionsAndSave (manager, archive, opts, cb) {
	// Update options
	opts = Object.assign(manager.getOpts(archive.key), opts);
	this[_archiveOpts][archive.key.toString('hex')] = opts;

	// Save the archive
	saveArchive(archive, opts, manager[_db], cb);
}

function saveArchive (archive, opts, db, cb) {
	db.put(['archive', archive.key], {
		path: archive.path,
		importFiles: opts.importFiles,
		joinNetwork: opts.joinNetwork
	}, cb);
}

function initArchive (dir, opts, cb) {
	Dat(dir, {
		db: opts.db
	}, function (err, dat) {
		if (err) {
			return cb(err);
		}
		if (opts.importFiles) {
			dat.importFiles();
		}
		if (opts.joinNetwork) {
			dat.joinNetwork();
		}
		cb(null, dat);
	});
}

function addToManager (manager, dat, opts) {
	manager[_archives].push(dat);
	manager[_archiveOpts][dat.key.toString('hex')] = opts;
	manager[_byPath][dat.path] = dat;
	manager[_byKey][dat.key.toString('hex')] = dat;
	manager[_byDiscoveryKey][dat.archive.discoveryKey.toString('hex')] = dat;

	// @TODO Do more with the importer
	if (dat.importer) {
		dat.importer.on('error', function (err) {
			manager.emit('error', err);
		});
	}

	// Emit that it was added
	manager.emit('added', dat);
}
