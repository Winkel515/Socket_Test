const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    required: true,
    type: String,
  },
  status: {
    type: Boolean,
    default: false,
  },
});

const Task = mongoose.model('Task', TaskSchema);

module.exports = { Task };
