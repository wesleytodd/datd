'use strict';
import grpc from 'grpc';
import path from 'path';

module.exports = function createRPCServer (archiveManager, port) {
	var datd = grpc.load(path.join(__dirname, '..', 'datd.proto')).datd;
	var server = new grpc.Server();
	server.addProtoService(datd.Daemon.service, {
		list: listArchives(archiveManager),
		create: createArchive(archiveManager),
		joinNetwork: joinNetwork(archiveManager)
	});

	server.bind('0.0.0.0:' + port, grpc.ServerCredentials.createInsecure());
	server.start();
};

function listArchives (archiveManager) {
	return function listArchivesRPC (call) {
		archiveManager.createReadStream({
			lt: call.request.lt.length ? call.request.lt : null,
			gt: call.request.gt.length ? call.request.gt : null
		})
			.on('data', function (d) {
				call.write({
					path: d.archive.path,
					key: d.archive.key,
					owner: d.archive.owner,
					live: d.archive.live,
					discoveryKey: d.archive.archive.discoveryKey
				});
			})
			.on('error', function (err) {
				call.emit('error', err);
			})
			.on('end', function () {
				call.end();
			});
	};
}

function createArchive (archiveManager) {
	return function createArchiveRPC (call, cb) {
		archiveManager.create(call.request.path, {
			importFiles: call.request.importFiles,
			joinNetwork: call.request.joinNetwork
		}, function (err, archive) {
			if (err) {
				// do something
				return cb(err);
			}
			cb(null, {
				path: archive.path,
				key: archive.key,
				owner: archive.owner,
				live: archive.live,
				discoveryKey: archive.archive.discoveryKey
			});
		});
	};
}

function joinNetwork (archiveManager) {
	return function joinNetwork (call, cb) {
		archiveManager.joinNetwork(call.request.key, function (err, network, archive) {
			if (err) {
				// do something
				return cb(err);
			}
			cb(null, {
				path: archive.path,
				key: archive.key,
				owner: archive.owner,
				live: archive.live,
				discoveryKey: archive.archive.discoveryKey
			});
		});
	};
}
