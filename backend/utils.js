
const leadingZero = (num) => `0${num}`.slice(-2);

const formatTime = (date) =>
[date.getHours(), date.getMinutes(), date.getSeconds()]
.map(leadingZero)
.join(":");

const postChatMessage = (io, data, message) => {
  const timestamp = new Date();
  const messageObject = {
    time: timestamp,
    text: `[${formatTime(timestamp)}]: ${message}`,
    key: Math.random().toString(16).slice(2)
  }
  io.in(data.room).emit(
    "recieve_message",
    messageObject
  );
};

module.exports = postChatMessage;
