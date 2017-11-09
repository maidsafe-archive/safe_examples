const generateId = () => {
  const array = new Uint32Array(5);
  window.crypto.getRandomValues(array);
  return array.join('-');
};

class CommentModel {
  constructor(name, messages = [], version = 0, isEditable = false, id = generateId()) {
    this.id = id;
    this.name = name;
    this.messages = messages;
    this.version = version;
    this.isEditable = isEditable;
  }

  addMessage(newMsg) {
    this.messages.push(newMsg);
    this.version += 1;
  }
}

export default CommentModel;
