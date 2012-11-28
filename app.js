 // Serveur.js
var server  = require('http').createServer(handler);
var fs      = require('fs');

var consumer_key = 'xx';
var consumer_secret = 'xx';
var access_token_key = 'xx-xx';
var access_token_secret = 'xx';

var io      = require('socket.io').listen(server);
io.set('log level', 1);
//console.log('Socket open');

var twitter = require('ntwitter');

var twit = new twitter({
  consumer_key: consumer_key,
  consumer_secret: consumer_secret,
  access_token_key: access_token_key,
  access_token_secret: access_token_secret
});



function handler (req, res) {

  fs.readFile(__dirname + '/public/index.html', 'utf-8', function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }
    res.writeHead(200);
    res.write(data);
    res.end();

  });



  // tweet history   res.end();
  setTimeout( function() {
    twit.search('phptour OR afup OR phptournantes', {}, function(err, datas) {
      tab = datas.results;
      tab.reverse();
      //sleep(10000);
      tab.forEach(function (data) {
        if (data.text)
        {
          // check tweet !
          if (!data.retweeted)
          {
            io.sockets.emit('tweet', {
              text:       data.text,
              user_name:  data.from_user_name,
              user_image: data.profile_image_url_https
            });
            //console.log(data.text);
          }
        }
      });
    });
  }, 2000);

}

server.listen(8080);
console.log('Server running at http://127.0.0.1:8080/');

twit.stream('statuses/filter', {track: ['phptour', 'afup', 'phptournantes'] }, function(stream) {
  stream.on('data', function (data) {
    // var tweet_content = Array();
    if (data.text)
    {
      // check tweet !
      if (!data.retweeted)
      {
        io.sockets.emit('tweet', {
          text:       data.text,
          user_name:  data.user.screen_name,
          user_image: data.user.profile_image_url_https
        });
      }
    }
  });
  stream.on('end', function (response) {
    console.log('end ????');
    // Handle a disconnection
  });
  stream.on('destroy', function (response) {
    // Handle a 'silent' disconnection from Twitter, no end/error event fired
  });
  // Disconnect stream after five seconds
  //setTimeout(stream.destroy, 5000);
});
