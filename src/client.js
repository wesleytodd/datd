'use strict';

import path from 'path';
import grpc from 'grpc';

module.exports = function createClient (port = 29101) {
	var datd = grpc.load(path.join(__dirname, '..', 'datd.proto')).datd;
	return new datd.Daemon('localhost:' + port, grpc.credentials.createInsecure());
};
