const { createServer } = require("http");
const { Server } = require("socket.io");


const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { authenticate } = require('./cognitoService');



const httpServer = createServer();
const io = new Server(httpServer, {
  // cors: "http://3.85.108.152:5173/",
  cors: "http://54.160.155.151:5173/",
});

const allUsers = {};
const allRooms = [];

io.on("connection", (socket) => {
  allUsers[socket.id] = {
    socket: socket,
    online: true,
  };

  socket.on("request_to_play", (data) => {
    const currentUser = allUsers[socket.id];
    currentUser.playerName = data.playerName;

    let opponentPlayer;

    for (const key in allUsers) {
      const user = allUsers[key];
      if (user.online && !user.playing && socket.id !== key) {
        opponentPlayer = user;
        break;
      }
    }

    if (opponentPlayer) {
      allRooms.push({
        player1: opponentPlayer,
        player2: currentUser,
      });

      currentUser.socket.emit("OpponentFound", {
        opponentName: opponentPlayer.playerName,
        playingAs: "circle",
      });

      opponentPlayer.socket.emit("OpponentFound", {
        opponentName: currentUser.playerName,
        playingAs: "cross",
      });

      currentUser.socket.on("playerMoveFromClient", (data) => {
        opponentPlayer.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });

      opponentPlayer.socket.on("playerMoveFromClient", (data) => {
        currentUser.socket.emit("playerMoveFromServer", {
          ...data,
        });
      });
    } else {
      currentUser.socket.emit("OpponentNotFound");
    }
  });

  socket.on("disconnect", function () {
    const currentUser = allUsers[socket.id];
    currentUser.online = false;
    currentUser.playing = false;

    for (let index = 0; index < allRooms.length; index++) {
      const { player1, player2 } = allRooms[index];

      if (player1.socket.id === socket.id) {
        player2.socket.emit("opponentLeftMatch");
        break;
      }

      if (player2.socket.id === socket.id) {
        player1.socket.emit("opponentLeftMatch");
        break;
      }
    }
  });
});


////////////////////////////////////////////////////////////////
const app = express();
app.use(bodyParser.json());
app.use(cors());

const protectedRoute = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // Token verification logic here
  next();
};

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await authenticate(username, password);
    res.json(response.AuthenticationResult);
  } catch (err) {
    res.status(401).json({ message: 'Authentication failed' });
  }
});

app.get('/protected', protectedRoute, (req, res) => {
  res.json({ message: 'This is a protected route' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

httpServer.listen(PORT);

// httpServer.listen(3000);
