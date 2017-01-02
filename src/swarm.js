/* es-lint-disable */
'use strict';

import swarmDefaults from 'datland-swarm-defaults';
import discoverySwarm from 'discovery-swarm';

module.exports = function createSwarm (archiveManager, opts = {}) {
	opts.stream = function (peer) {
		if (!peer || !peer.channel) {
			return;
		}

		// Get the requested dat,
		// then replicate it
		// var a = archiveManager.byDiscoveryKey(peer.channel);

		return opts.__archive.replicate({
			upload: true,
			download: true
		});
	};

	// Not sure what this is, but its done here:
	// https://github.com/karissa/hyperdiscovery/blob/master/index.js#L14
	opts.hash = false;

	opts.utp = true;
	opts.tcp = true;

	return discoverySwarm(swarmDefaults(opts));
};
