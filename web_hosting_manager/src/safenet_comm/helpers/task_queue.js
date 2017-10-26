export default class TaskQueue {
  constructor(callback) {
    this.callback = callback;
    this.queue = [];
    this.cancelled = false;
    this.index = 0;
  }

  add(task) {
    this.queue.push(task);
  }

  run() {
    const next = (err, status) => {
      if (!this.cancelled) {
        this.callback(err, status);
      } else {
        this.queue[this.index].cancelled = true;
      }
      if (status && !status.isCompleted) {
        return;
      }
      this.index += 1;
      if (this.queue.length === (this.index - 1)) {
        const taskStatus = {
          isFile: true,
          isCompleted: true,
          size: 0,
        };
        this.callback(null, taskStatus);
        return;
      }
      if (!this.cancelled && this.queue[this.index]) {
        this.queue[this.index].execute(next);
      }
    };

    if (this.queue[this.index]) {
      this.queue[this.index].execute(next);
    }
  }

  cancel() {
    this.cancelled = true;
  }
}
