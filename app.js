require('dotenv').config();
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const { Task } = require('./models/tasks');

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Server is up!');
});

io.on('connect', async (socket) => {
  const taskList = await Task.find({});
  socket.emit('incoming_task_list', JSON.stringify(taskList));

  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('create_task', async (newTaskJSON) => {
    try {
      var parsedTask = JSON.parse(newTaskJSON);
      const task = new Task({
        title: parsedTask.title,
        index: parsedTask.index,
      });
      io.emit('incoming_task', JSON.stringify(task));
      await task.save();
    } catch (e) {
      console.log(e.message);
    }
  });

  socket.on('toggle_task', async (id) => {
    const task = await Task.findById(id);
    task.status = !task.status;
    io.emit('incoming_toggle', JSON.stringify(task));
    await task.save();
  });
});

http.listen(port, () => {
  console.log(`listening on PORT: ${port}`);
});
