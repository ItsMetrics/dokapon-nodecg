'use strict';

module.exports = function (nodecg) {
	Init(nodecg);
};

function Init(nodecg)
{
	// requires
	var fileManager = require('./fileManager')(nodecg);	
	var graphData = require('./graphData')(nodecg);
	var dmx = require('./dmx-controller')(nodecg);
}