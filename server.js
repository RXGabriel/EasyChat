const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000);

app.use(express.static(path.join(__dirname, "public")));

let connectedUsers = [];

io.on("connection", (socket) => {
  console.log("Conexão com o servidor iniciada!");

  socket.on("join-request", (userData) => {
    const { username } = userData;
    socket.userName = username;
    connectedUsers.push(username);
    console.log(connectedUsers);
    socket.emit("user-ok", connectedUsers);
    socket.broadcast.emit("list-update", {
      joined: { userName: username },
      list: connectedUsers,
    });
  });

  socket.on("disconnect", () => {
    connectedUsers = connectedUsers.filter((u) => u !== socket.userName);
    console.log(connectedUsers);
    socket.broadcast.emit("list-update", {
      left: { userName: socket.userName },
      list: connectedUsers,
    });
  });

  socket.on("send-msg", (txt) => {
    const msgData = {
      userName: socket.userName,
      txt: txt,
    };
    io.emit("show-msg", msgData);
  });
});
