var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const port = 80;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connect', (socket) => {
  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(port, () => {
  console.log(`listening on http://localhost:${port}/`);
});
