require('dotenv').config();
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const { Task } = require('./models/tasks');

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Server is up!');
});

io.on('connect', (socket) => {
  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('create_task', async (title) => {
    console.log(title);
    const task = new Task({ title });
    await task.save();
    console.log(JSON.stringify(task));
    socket.emit('incoming_task', JSON.stringify(task));
  });
});

http.listen(port, () => {
  console.log(`listening on PORT: ${port}`);
});
