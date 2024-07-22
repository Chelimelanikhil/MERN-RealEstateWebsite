import { Server } from "socket.io";

const io = new Server({
  cors: {
    origin: "http://localhost:5173",
  },
});

let onlineUser = [];

const addUser = (userId, socketId) => {
  const userExists = onlineUser.find((user) => user.userId === userId);
  if (!userExists) {
    onlineUser.push({ userId, socketId });
    console.log(`User added: ${userId}, ${socketId}`);
  } else {
    console.log(`User already exists: ${userId}`);
  }
};

const removeUser = (socketId) => {
  onlineUser = onlineUser.filter((user) => user.socketId !== socketId);
  console.log(`User removed with socketId: ${socketId}`);
};

const getUser = (userId) => {
  const user = onlineUser.find((user) => user.userId === userId);
  if (!user) {
    console.log(`No user found for userId: ${userId}`);
  }
  return user;
};

io.on("connection", (socket) => {
  console.log(`User connected with socketId: ${socket.id}`);

  socket.on("newUser", (userId) => {
    addUser(userId, socket.id);
  });

  socket.on("sendMessage", ({ receiverId, data }) => {
    console.log(`Sending message to receiverId: ${receiverId}`);
    const receiver = getUser(receiverId);
    if (!receiver) {
      console.log(`Receiver not found for id: ${receiverId}`);
      return;
    }
    io.to(receiver.socketId).emit("getMessage", data);
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

io.listen("4000");
