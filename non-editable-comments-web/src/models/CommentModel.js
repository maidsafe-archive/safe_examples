const generateId = () => {
  const array = new Uint32Array(5);
  window.crypto.getRandomValues(array);
  return array.join('-');
};

export default class CommentModel {
  constructor(name, message, date, id = generateId()) {
    this.name = name;
    this.date = date;
    this.message = message;
    this.id = id;
  }
}
