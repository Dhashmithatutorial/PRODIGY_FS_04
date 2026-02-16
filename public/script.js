const socket = io();

/* ================= ELEMENTS ================= */

const authContainer = document.getElementById("auth-container");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const authActionBtn = document.getElementById("auth-action-btn");
const authMessage = document.getElementById("auth-message");
const authTitle = document.getElementById("auth-title");
const authToggleText = document.getElementById("auth-toggle-text");

const joinContainer = document.getElementById("join-container");
const joinTitle = document.getElementById("join-title");
const joinUsernameInput = document.getElementById("join-username");
const roomInput = document.getElementById("join-room");
const joinBtn = document.getElementById("join-btn");

const chatContainer = document.getElementById("chat-container");
const backBtn = document.getElementById("back-btn");
const form = document.getElementById("form");
const messageInput = document.getElementById("input");
const messages = document.getElementById("messages");
const usersList = document.getElementById("users");
const roomInfo = document.getElementById("room-info");

const themeToggle = document.getElementById("theme-toggle");
const usersToggle = document.getElementById("users-toggle");

/* ================= VARIABLES ================= */

let username = "";
let room = "";
let isLoginMode = true;
let typingTimeout;

/* ================= AUTH TOGGLE ================= */

function toggleAuthMode() {
    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        authTitle.textContent = "Login";
        authActionBtn.textContent = "Login";
        authToggleText.innerHTML =
            `Don't have an account? <span id="auth-toggle-link">Register</span>`;
    } else {
        authTitle.textContent = "Register";
        authActionBtn.textContent = "Register";
        authToggleText.innerHTML =
            `Already have an account? <span id="auth-toggle-link">Login</span>`;
    }

    document
        .getElementById("auth-toggle-link")
        .addEventListener("click", toggleAuthMode);
}

document
    .getElementById("auth-toggle-link")
    .addEventListener("click", toggleAuthMode);

/* ================= LOGIN / REGISTER ================= */

authActionBtn.addEventListener("click", () => {
    const usernameVal = authUsername.value.trim();
    const passwordVal = authPassword.value.trim();

    if (!usernameVal || !passwordVal) {
        authMessage.textContent = "Please fill all fields";
        return;
    }

    if (isLoginMode) {
        socket.emit("login",
            { username: usernameVal, password: passwordVal },
            (response) => {

                if (!response.success) {
                    authMessage.textContent = response.message;
                    return;
                }

                username = usernameVal;

                authContainer.style.display = "none";
                joinContainer.style.display = "block";

                joinTitle.textContent = "Join Chat Room";
            }
        );
    } else {
        socket.emit("register",
            { username: usernameVal, password: passwordVal },
            (response) => {

                if (!response.success) {
                    authMessage.textContent = response.message;
                    return;
                }

                authMessage.textContent =
                    "Registration successful. Please login.";

                isLoginMode = true;
                authTitle.textContent = "Login";
                authActionBtn.textContent = "Login";
                authToggleText.innerHTML =
                    `Don't have an account? <span id="auth-toggle-link">Register</span>`;

                document
                    .getElementById("auth-toggle-link")
                    .addEventListener("click", toggleAuthMode);
            }
        );
    }
});
/* ================= JOIN ROOM ================= */
joinBtn.addEventListener("click", () => {
    username = joinUsernameInput.value.trim();
    room = roomInput.value.trim();

    if (!username || !room) {
        alert("Please enter username and room");
        return;
    }

    socket.emit("joinRoom", { username, room });

    document.querySelector(".join-container").style.display = "none";
    document.querySelector(".chat-container").style.display = "flex";
});
/* ================= SEND MESSAGE ================= */

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!username || !room) {
        alert("You are not in a room");
        return;
    }
    const message = messageInput.value.trim();
    if (message ==="") return;
    socket.emit("chatMessage", {
        room:room,
        message:message,
        username:username
});
    messageInput.value = "";
});

/* ================= RECEIVE MESSAGE ================= */

socket.on("message", (data) => {

    const li = document.createElement("li");

    li.className =
        data.username === username
            ? "my-message"
            : "other-message";

    const displayName = data.username.split("@")[0];  // remove gmail

li.innerHTML = `
    <div class="message-wrapper">
        <div class="avatar">${displayName.charAt(0).toUpperCase()}</div>
        <div class="message-content">
            <div class="msg-header">
                <span class="msg-user">${displayName}</span>
                <span class="msg-time">${data.time}</span>
            </div>
            <div class="msg-text">${data.message}</div>
        </div>
    </div>
`;

    messages.appendChild(li);
    messages.scrollTop = messages.scrollHeight;
});

/* ================= HISTORY ================= */

socket.on("previousMessages", (oldMessages) => {
   
    messages.innerHTML = "";

    oldMessages.forEach((msg) => {
        const li = document.createElement("li");

        li.className =
            msg.username === username
                ? "my-message"
                : "other-message";

        const displayName = msg.username.split("@")[0];

li.innerHTML = `
    <div class="message-wrapper">
        <div class="avatar">${displayName.charAt(0).toUpperCase()}</div>
        <div class="message-content">
            <div class="msg-header">
                <span class="msg-user">${displayName}</span>
                <span class="msg-time">${msg.time || ""}</span>
            </div>
            <div class="msg-text">${msg.message}</div>
        </div>
    </div>
`;

        messages.appendChild(li);
    });

    messages.scrollTop = messages.scrollHeight;
});

/* ================= USERS LIST ================= */

socket.on("roomUsers", (users) => {
    usersList.innerHTML = "";

    users.forEach((user) => {

        const displayName = user.username.split("@")[0];

        const li = document.createElement("li");

        li.innerHTML = `
            <span class="online-dot"></span>
            <span class="user-name">${displayName}</span>
        `;

        // 👇 PRIVATE MESSAGE CLICK
        li.addEventListener("click", () => {

            if (user.username === username) return;

            socket.emit("joinPrivate", {
                username,
                targetUser: user.username
            });

            room = [username, user.username].sort().join("-");

            roomInfo.textContent = `Private Chat with ${displayName}`;

            messages.innerHTML = "";
        });

        usersList.appendChild(li);
    });

    roomInfo.textContent = `Room: ${room} • ${users.length} Online`;
});
/* ================= JOIN / LEAVE ================= */

socket.on("userJoined", (msg) => {
    const li = document.createElement("li");
    li.className = "system-message";
    li.textContent = msg;
    messages.appendChild(li);
});

socket.on("userLeft", (msg) => {
    const li = document.createElement("li");
    li.className = "system-message";
    li.textContent = msg;
    messages.appendChild(li);
});

/* ================= TYPING ================= */

input.addEventListener("input", () => {
    if (username && room) {
        socket.emit("typing", { username, room });
    }
});

socket.on("userTyping", (typingUser) => {
    const typingId = "typing-indicator";

    const existing = document.getElementById(typingId);
    if (existing) existing.remove();

    const li = document.createElement("li");
    li.id = typingId;
    li.className = "system-message";
    li.textContent = `${typingUser} is typing...`;

    messages.appendChild(li);

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
        const typingMsg = document.getElementById(typingId);
        if (typingMsg) typingMsg.remove();
    }, 1500);
});

/* ================= DARK MODE ================= */

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeToggle.textContent = "☀️";
        localStorage.setItem("theme", "dark");
    } else {
        themeToggle.textContent = "🌙";
        localStorage.setItem("theme", "light");
    }
});