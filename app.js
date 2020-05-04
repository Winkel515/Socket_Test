var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
require('dotenv').config();

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Server is up!');
});

io.on('connect', (socket) => {
  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('flutter_emit', (message) => {
    console.log(message);
  });
});

http.listen(port, () => {
  console.log(`listening on http://localhost:${port}/`);
});
