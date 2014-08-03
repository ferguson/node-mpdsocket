/*******
** node-mpdsocket :: an MPD library for node.js
**
** author: Eli Wenig (http://eliwenig.com/) <eli@csh.rit.edu>
**
** copyright (c) 2011 Eli Wenig
** made available under the MIT license
**   http://www.opensource.org/licenses/mit-license.php
**
*******/

var net = require('net');
var sys = require('sys');

function mpdSocket(host,port) {
	if (!host) { 
		this.host = "localhost";
	} else {
		this.host = host;
	}

	if (!port){
		this.port = 6600;
	} else {
		this.port = port;
	}

	this.callbacks = [];
	this.commands = [];
	this.buffer = '';
	this.lines = [];
	this.isOpen = false;
	this.socket = null;
	this.version = undefined;
	this.host = null;
	this.port = null;

	this.open(this.host,this.port);
}

mpdSocket.prototype = {
	bufferData: function(data) {
		this.buffer += data;
		var pos = 0;
		var i;
		while ((i = this.buffer.indexOf('\n', pos)) > -1) {
				var line = this.buffer.substr(pos, i-pos);
				this.handleLine(line);
				pos = i+1;	// the +1 skips the \n
		}
		if (pos < this.buffer.length) {
				// incomplete line, save it for the next round
				this.buffer = this.buffer.substr(pos);
		} else {
				this.buffer = '';
		}
	},

	handleLine: function(line) {
		if (!this.version && line.match(/^OK MPD /)) {
			this.version = line.split(' ')[2];
			//console.log('mpd protocol version ' + this.version);
			return;
		}

		this.lines.push(line);

		if (line.match(/^OK$|^ACK \[/)) {
			this.handleLines(this.lines);
			this.lines = [];
		}
	},

	handleLines: function(lines) {
		var response = [new Object];
		var first_attr = false;
		for (var i in lines) {
				var line = lines[i];
				if (line.match(/^OK$|^ACK \[/)) {
						break;
				} else {
						var colon = line.indexOf(':');
						var attr = line.substr(0,colon);
						var value = line.substr(colon+1);
						value = value.replace(/^\s+|\s+$/g, ''); // trim whitespace
						if (typeof(response[response.length-1][attr]) !== 'undefined') {
								if (attr === first_attr) {
										// assume that when the first attribute we saw is repeated,
										// it represents the start of a new object
										response.push(new Object);
										response[response.length-1][attr] = value;
								} else {
										// otherwise handle multiple occurances of an attribute as an array
										response[response.length-1][attr] = [].concat(
												response[response.length-1][attr],
												value
												); // [].concat() will convert it to an array if it's not already one
								}
						} else {
								response[response.length-1][attr] = value;
								if (!first_attr) {
										first_attr = attr;
								}
						}
				}
		}

// uncomment this next section if you want the responses
// to be compatiable with old versions of mpdsocket
// otherwise all responses are returned in a list
//		// convert single line responses to not be in a 1 item list
//		// except playlist, file, and directory are always lists
//		if (["playlist", "file", "directory"].indexOf(first_attr) === -1) {
//			if (response.length === 1) {
//				response = response[0];
//			}
//		}

		response._verbatim = line;
		response._OK = (line === 'OK');
		if (!response._OK) {
				//console.log(line);
				if (line) {
						response._error = line.substr(line.indexOf('}') +2);
				}
		}
		return this.callbacks.shift()(response);
	},

	on: function(event, fn) {
		this.socket.on(event,fn);
	},

	open: function(host,port) {
		var self = this;
		if (!(this.isOpen)) {
			if (host.indexOf('/') === 0) {
        // support unix domain sockets
        this.socket = net.createConnection(host);
			} else {
        this.socket = net.createConnection(port,host);
			}
			this.socket.setEncoding('UTF-8');
			this.socket.addListener('connect',function() { self.isOpen = true; });
			this.socket.addListener('data',function(data) { self.handleData.call(self,data); self._send(); });
			this.socket.addListener('end',function() { self.isOpen = false; });
		}
	},

	_send: function() {
		if (this.commands.length != 0) this.socket.write(this.commands.shift() + "\n");
	},

	send: function(req,callback) {
		if (this.isOpen) {
			this.callbacks.push(callback);
			this.commands.push(req);
			if (this.commands.length == 1) this._send();
		} else {
			var self = this;
			this.open(this.host,this.port);
			this.on('connect',function() {
				self.send(req,callback);
			});
		}
	}
}

module.exports = mpdSocket;
