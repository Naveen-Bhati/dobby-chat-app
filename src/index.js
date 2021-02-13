const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");
const dotenv = require("dotenv").config();

const { generateMessage, generateLocationUrl } = require("./utils/messages");
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));
const port = process.env.PROD_PORT || process.env.DEV_PORT;

io.on("connection", (socket) => {
  socket.on("JoinRoom", (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);

    socket.emit("WelcomeMessage", generateMessage("Welcome Vanar"));
    socket.to(user.room).broadcast.emit("NewJoined", user.username);
    io.to(user.room).emit("RoomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });

  socket.on("MessageSent", (sendMessage) => {
    const user = getUser(socket.id);

    socket
      .to(user.room)
      .broadcast.emit(
        "MessageRecieved",
        generateMessage(user.username, sendMessage)
      );
  });

  socket.on("LocationSent", (lattitude, longitude) => {
    const user = getUser(socket.id);
    const locationUrl = `https://www.google.com/maps?q=${lattitude},${longitude}`;
    socket
      .to(user.room)
      .broadcast.emit(
        "LocationRecieved",
        generateLocationUrl(user.username, locationUrl)
      );
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("ByeMessage", user.username);
      io.to(user.room).emit("RoomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`server is running  on port ${port}`);
});
