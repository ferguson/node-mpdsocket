var mpdSocket = require('./mpdsocket');
var mpd = new mpdSocket('/Users/jon/Library/Otto/var/mpd/01socket');

function sendlog(cmd) {
  mpd.send(cmd, function(r) {
    console.log('response from', cmd);
    console.log(r);
  });
};

sendlog('play');
sendlog('status');
sendlog('currentsong');
sendlog('playlistinfo');
sendlog('outputs');
sendlog('listplaylists');
sendlog('pause');
