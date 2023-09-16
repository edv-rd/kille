const timestamp = new Date();

const leadingZero = (num) => `0${num}`.slice(-2);

const formatTime = (date) =>
  [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(leadingZero)
    .join(":");

const postChatMessage = (io, data, message) => {
  io.in(data.room).emit(
    "recieve_message",
    `[${formatTime(timestamp)}]: ${message}`
  );
};

module.exports = postChatMessage;
