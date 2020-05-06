require('dotenv').config();
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const mongoose = require('mongoose');

const incoming_task = 'incoming_task';
const create_task = 'create_task';
const toggle_task = 'toggle_task';
const reorder_task = 'reorder_task';
const delete_task = 'delete_task';

const { Task } = require('./models/tasks');

const getOrderedTasks = async () => {
  const taskList = await Task.find({});
  taskList.sort((a, b) => (a.index > b.index ? 1 : -1));
  return taskList;
};

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
  const taskList = await getOrderedTasks();
  socket.emit('incoming_task_list', JSON.stringify(taskList));

  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on(create_task, async (newTaskJSON) => {
    try {
      var parsedTask = JSON.parse(newTaskJSON);
      const task = new Task({
        title: parsedTask.title,
        index: parsedTask.index,
      });
      io.emit(incoming_task, JSON.stringify(task));
      await task.save();
    } catch (e) {
      console.log(e.message);
    }
  });

  socket.on(toggle_task, async (id) => {
    const task = await Task.findById(id);
    task.status = !task.status;
    io.emit(incoming_toggle, JSON.stringify(task));
    await task.save();
  });

  socket.on(reorder_task, async (jsonTasks) => {
    socket.broadcast.emit('incoming_task_list', jsonTasks);
    const tasksList = JSON.parse(jsonTasks);
    tasksList.forEach(async (task, index) => {
      const foundTask = await Task.findById(task.id);
      foundTask.index = index;
      foundTask.save();
    });
  });

  socket.on(delete_task, async (id) => {
    const deletedTask = await Task.findByIdAndDelete(id);
    const tasks = await Task.find({ index: { $gt: deletedTask.index } });
    const taskPromises = tasks.map((task) => {
      task.index--;
      return task.save();
    });
    await Promise.all(taskPromises);
    socket.broadcast.emit(
      incoming_task,
      JSON.stringify(await getOrderedTasks())
    );
  });
});

http.listen(port, () => {
  console.log(`listening on PORT: ${port}`);
});
