'use strict';

import swarmDefaults from 'datland-swarm-defaults';
import discoverySwarm from 'discovery-swarm';

module.exports = function createSwarm (drive, archiveManager, opts = {}) {
	// Setup the stream handler
	opts.stream = opts.stream || function (peer) {
		// Get the requested dat, then replicate it
		if (peer.channel) {
			var a = archiveManager.byDiscoveryKey(peer.channel);
			if (a) {
				return a.archive.replicate();
			}
		}

		return drive.replicate();
	};

	// This tells the swarm that the discovery keys are already hashed
	opts.hash = false;

	// Allow the swarm to be configured
	opts.utp = typeof opts.utp !== 'undefined' ? opts.utp : true;
	opts.tcp = typeof opts.tcp !== 'undefined' ? opts.tcp : true;

	var swarm = discoverySwarm(swarmDefaults(opts));

	// @TODO havent seen this hit yet...maybe remove?
	swarm.on('connection', function (stream, info) {
		if (info.channel) {
			return;
		}
		stream.on('open', function (key) {
			var a = archiveManager.byDiscoveryKey(key);
			if (a) {
				console.log('replicating archive on con', a.key.toString('hex'));
				a.archive.replicate({
					stream: stream
				});
			}
		});
	});

	return swarm;
};
