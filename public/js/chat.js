const socket = io();
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const locationButton = document.getElementById("locationButton");
// const messageSentToOther = document.getElementById("messageSentToOther");
// const messageSentToMe = document.getElementById("messageSentToMe");
const navbarDiv = document.getElementById("navbarDiv");
// const messageTemplateMe = document.getElementById("message-template-me")
//   .innerHTML;
// const messageTemplateOther = document.getElementById("message-template-other")
//   .innerHTML;
const usersListDiv = document.getElementById("usersListDiv");
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;
const navbarTemplate = document.getElementById("navbar-template").innerHTML;
// const locationTemplateMe = document.getElementById("location-template-me")
//   .innerHTML;
// const locationTemplateOther = document.getElementById("location-template-other")
//   .innerHTML;
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const joinTemplate = document.getElementById("join-template").innerHTML;
const leftTemplate = document.getElementById("left-template").innerHTML;
const messages = document.getElementById("messages");

//extracting username and room name from url

var urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");
const room = urlParams.get("room");

socket.on("WelcomeMessage", (welcomeMessage) => {});

socket.on("NewJoined", (joinedUser) => {
  const html = Mustache.render(joinTemplate, {
    username: joinedUser,
    pos: "float:left;clear: both",
    message: joinedUser + "joined lobby",
    createdAt: moment(joinedUser.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  socket.emit("MessageSent", messageInput.value);

  const html = Mustache.render(messageTemplate, {
    username: "You",
    pos: "float:right;clear: both",
    message: messageInput.value,
    createdAt: moment(messageInput.value.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
  messageInput.value = "";
});

socket.on("RoomData", ({ room, users, username }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
    username,
  });
  usersListDiv.innerHTML = html;
});

socket.on("MessageRecieved", (messageRecieved) => {
  const html = Mustache.render(messageTemplate, {
    username: messageRecieved.username,
    pos: "float:left;clear:both",
    message: messageRecieved.text,
    createdAt: moment(messageRecieved.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Your Browser does not support this feature..You Looser");
  } else {
    return navigator.geolocation.getCurrentPosition((position) => {
      socket.emit(
        "LocationSent",
        position.coords.latitude,
        position.coords.longitude
      );
      const html = Mustache.render(locationTemplate, {
        username: "You",
        pos: "float:right;clear:both",
        location: `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
        createdAt: moment(
          `https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`
            .createdAt
        ).format("h:mm a"),
      });
      messages.insertAdjacentHTML("beforeend", html);
    });
  }
});

socket.on("LocationRecieved", (locationUrl) => {
  const html = Mustache.render(locationTemplate, {
    username: locationUrl.username,
    pos: "float:left;clear:both",
    location: locationUrl.url,
    createdAt: moment(locationUrl.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.on("ByeMessage", (leftUser) => {
  const html = Mustache.render(leftTemplate, {
    username: leftUser,
    pos: "float:left;clear: both",
    message: leftUser + "left the lobby",
    createdAt: moment(leftUser.createdAt).format("h:mm a"),
  });
  messages.insertAdjacentHTML("beforeend", html);
});

socket.emit("JoinRoom", { username, room }, (err) => {
  if (err) {
    alert(err);
    location.href = "/";
  } else {
    const html = Mustache.render(navbarTemplate, {
      username,
    });
    navbarDiv.innerHTML = html;
    // socket.emit("notification", username);
  }
});
