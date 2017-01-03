/* es-lint-disable*/
'use strict';

import swarmDefaults from 'datland-swarm-defaults';
import discoverySwarm from 'discovery-swarm';
import hypercore from 'hypercore';

module.exports = function createSwarm (db, archiveManager, opts = {}) {
	// Create a hypercore to replicate
	var core = hypercore(db);

	opts.stream = function (peer) {
		var stream = core.replicate();

		// Get the requested dat, then replicate it
		if (peer.channel) {
			var a = archiveManager.byDiscoveryKey(peer.channel);
			if (a) {
				a.archive.replicate({
					stream: stream
				});
			}
		}

		return stream;
	};

	// This tells the swarm that the discovery keys are already hashed
	opts.hash = false;

	// Allow the swarm to be configured
	opts.utp = typeof opts.utp !== 'undefined' ? opts.utp : true;
	opts.tcp = typeof opts.tcp !== 'undefined' ? opts.tcp : true;

	return discoverySwarm(swarmDefaults(opts));
};
