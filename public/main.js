const socket = io();

let userName = "";
let userList = [];

const loginPage = document.querySelector("#loginPage");
const chatPage = document.querySelector("#chatPage");
const loginInput = document.querySelector("#loginNameInput");
const textInput = document.querySelector("#chatTextInput");

function renderUserList() {
  const ul = document.querySelector(".userList");
  ul.innerHTML = "";
  userList.forEach((name) => {
    ul.innerHTML += "<li>" + name + "</li>";
  });
}

function addMessage(type, user, msg) {
  const ul = document.querySelector(".chatList");
  switch (type) {
    case "status":
      ul.innerHTML += '<li class="m-status">' + msg + "</li>";
      break;
    case "msg":
      const senderName = user === userName ? "Você" : user;
      const messageClass = user === userName ? "m-txt-me" : "m-txt";
      ul.innerHTML += `<li class="${messageClass}"><span>${senderName}: </span>${msg}</li>`;
      break;
  }
  ul.scrollTop = ul.scrollHeight;
}

textInput.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    const txt = textInput.value.trim();
    textInput.value = "";
    if (txt !== "") {
      if (!userName) {
        alert("Por favor, faça login primeiro!");
        return;
      }

      socket.emit("send-msg", txt);
    }
  }
});

socket.on("user-ok", (list) => {
  loginPage.style.display = "none";
  chatPage.style.display = "flex";
  textInput.focus();
  addMessage("status", null, "Conectado!");
  userList = list;
  renderUserList();
});

socket.on("list-update", (data) => {
  if (data.joined) {
    addMessage("status", null, data.joined.userName + " entrou no chat.");
  }
  if (data.left) {
    addMessage("status", null, data.left.userName + " saiu do chat.");
  }
  userList = data.list;
  renderUserList();
});

socket.on("show-msg", (data) => {
  addMessage("msg", data.userName, data.txt);
});

socket.on("disconnect", () => {
  addMessage("status", null, "Você foi desconectado!");
  userList = [];
  renderUserList();
});

socket.on("reconnect_error", () => {
  addMessage("status", null, "Falha ao se reconectar!");
});

socket.on("reconnect", () => {
  addMessage("status", null, "Reconectado!");
  if (userName !== "") {
    socket.emit("join-request", { username: userName });
  }
});

loginInput.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    const name = loginInput.value.trim();
    if (name !== "") {
      userName = name;
      document.title = "Chat (" + userName + ")";
      socket.emit("join-request", { username: userName });
    }
  }
});
