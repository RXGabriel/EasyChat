const socket = io();

let userName = "";
let userList = [];

let loginPage = document.querySelector("#loginPage");
let chatPage = document.querySelector("#chatPage");

let loginInput = document.querySelector("#loginNameInput");
let textInput = document.querySelector("#chatTextInput");

loginPage.style.display = "flex";
chatPage.style.display = "none";

function renderUserList() {
  let ul = document.querySelector(".userList");
  ul.innerHTML = "";

  userList.forEach((i) => {
    ul.innerHTML += "<li>" + i + "</li>";
  });
}

function addMessage(type, user, msg) {
  let ul = document.querySelector(".chatList");

  switch (type) {
    case "status":
      ul.innerHTML += '<li class="m-status">' + msg + "</li>";
      break;
    case "msg":
      if (userName == user) {
        ul.innerHTML +=
          '<li class="m-txt"><span class="me">' +
          user +
          ": </span>" +
          msg +
          "</li>";
      } else {
        ul.innerHTML +=
          '<li class="m-txt"><span>' + user + ": </span>" + msg + "</li>";
      }
      break;
  }
  ul.scrollTop = ul.scrollHeight;
}

loginInput.addEventListener("keyup", (event) => {
  if (event.keyCode === 13) {
    let name = loginInput.value.trim();

    if (name != "") {
      userName = name;
      document.title = "Chat(" + userName + ")";

      socket.emit("join-request", userName);
    }
  }
});

textInput.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    let txt = textInput.value.trim();
    textInput.value = "";

    if (txt != "") {
      if (!userName) {
        alert("Por favor, faça login primeiro!");
        return;
      }

      addMessage("msg", userName, txt);
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
    addMessage("status", null, data.joined.userName + " entrou no chat!");
  }

  if (data.left) {
    addMessage("status", null, data.left.userName + " saiu do chat!");
  }

  userList = data.list;
  renderUserList();
});

socket.on("show-msg", (data) => {
  addMessage("msg", data.user, data.message);
});

socket.on("disconnect", () => {
  addMessage("status", null, "Você foi desconectado do servidor!");
  userList = [];
  renderUserList();
});

socket.on("reconnect_error", () => {
  addMessage("status", null, "Tentando reconectar...");
});

socket.on("reconnect", () => {
  addMessage("status", null, "Reconectado!");
  if (userName !== "") {
    socket.emit("join-request", userName);
  }
});
