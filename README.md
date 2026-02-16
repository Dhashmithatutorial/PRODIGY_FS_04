# 💬 Real-Time Chat Application (Task-04)

This project is developed as part of the internship task to build a real-time chat application using WebSocket technology.

It enables users to communicate instantly in chat rooms and through private messaging.

---

## 📖 Project Description

This is a full-stack real-time chat application built using Node.js, Express, and Socket.IO.

Users can:
- Create accounts (Register/Login)
- Join chat rooms
- Send and receive messages instantly
- Send private messages
- View online users
- Toggle dark mode
- View chat history (stored in JSON)

Multimedia sharing is excluded as per project scope.

---

## 🛠 Technologies Used

- Node.js
- Express.js
- Socket.IO (WebSocket)
- HTML5
- CSS3
- JavaScript
- JSON (for storing users & messages)

---

## ⚙️ How I Built This Project

1. Initialized Node project using:
   ```
   npm init -y
   ```

2. Installed required dependencies:
   ```
   npm install express socket.io
   ```

3. Created server using:
   - Express for backend
   - HTTP server
   - Socket.IO for real-time communication

4. Built frontend using:
   - index.html
   - style.css
   - script.js

5. Implemented features:
   - Authentication system (Register/Login)
   - Join room functionality
   - Real-time messaging using socket.emit()
   - Private messaging between users
   - Online user presence indicator
   - Dark mode UI
   - Message storage in JSON files

---

## ✅ Features Implemented

✔ User Registration  
✔ User Login  
✔ Join Chat Room  
✔ Real-Time Messaging  
✔ Private Messaging  
✔ Online Users List  
✔ Chat History  
✔ Dark Mode Toggle  
✔ Responsive UI  

---

## 🚀 How to Run the Project

1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   node server.js
   ```

3. Open browser:
   ```
   http://localhost:3000
   ```

---

## 📂 Project Structure

```
PRODIGY_FS_04/
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── server.js
├── users.json
├── messages.json
├── package.json
└── README.md
```

---

## 🎯 Conclusion

This project successfully demonstrates the implementation of a real-time chat application using WebSocket technology. 

All core requirements of Task-04 have been completed successfully, including private messaging and real-time room communication.

---

## 👩‍💻 Developed By

Dhashmitha  
Full Stack Intern