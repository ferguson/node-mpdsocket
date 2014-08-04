# node-mpdsocket

`mpdsocket` is a node.js client for MPD. It is forked from [ewenig/node-mpdsocket](https://www.github.com/ewenig/node-mpdsocket), which is loosely based on (but aims to be more usable than) [robinduckett/node-mpd](https://www.github.com/robinduckett/node-mpd).

## Usage

### Example

	var mpdSocket = require('mpdsocket');
	var mpd = new mpdSocket('localhost','6600');
	
	mpd.on('connect',function() {
		mpd.send('status',function(r) {
			console.log(r);
		});
	});

Also check out the [Otto code it was writted to be used by](https://github.com/ferguson/otto/blob/master/otto.mpd.coffee).

### Functions

* `mpdSocket.on(event,fn)` adds event handlers to the net.Socket object directly.
* `mpdSocket.send(req,callback)` sends a request to MPD with a callback function.

## Return objects

`mpdsocket` parses the output from the [MPD protocol](http://www.musicpd.org/doc/protocol/) into a JavaScript object. This object has three meta-attributes that mpdsocket adds:

* `_OK` denotes that the request was completed successfully.
* `_error` is the error returned if `_OK` is false.
* ~~`_ordered_list` denotes that the object is an ordered list~~ Output has changed, see below

### Output

Output is different from ewenig/node-mpdsocket. It isn't necessarily sane or stable yet. Biggest difference is everything returned is wrapped in an array, even things that only ever return a single result. Also, _ordered_list isn't currently added.

### License
`node-mpdsocket` is made available under the [MIT License](http://www.opensource.org/licenses/mit-license.php). A copy of the license is distributed with this software.

Copyright (c) 2011 Eli Wenig
