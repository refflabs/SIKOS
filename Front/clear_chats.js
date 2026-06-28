import { io } from "socket.io-client";

const apiLoginUrl = "https://sikos-bpsw.vercel.app/api/login";
const socketUrl = "https://refflabs-sikos-chat.hf.space";

async function run() {
  console.log("Logging in as admin...");
  const loginRes = await fetch(apiLoginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      email: "sikospakrt@gmail.com",
      password: "AdminSikos@2026"
    })
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    console.error("Login failed:", loginData);
    process.exit(1);
  }

  const token = loginData.token;
  console.log("Logged in successfully! Token obtained:", token.substring(0, 10) + "...");

  console.log("Connecting to WebSocket server:", socketUrl);
  const socket = io(socketUrl, {
    transports: ["websocket"],
    auth: { token }
  });

  socket.on("connect", () => {
    console.log("Connected to Socket server! Emitting chat:delete_all...");
    socket.emit("chat:delete_all", {}, (ack) => {
      console.log("Server response to delete all:", ack);
      socket.disconnect();
      console.log("All chats cleared successfully!");
      process.exit(0);
    });
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
    process.exit(1);
  });

  setTimeout(() => {
    console.error("Timeout waiting for socket connection.");
    process.exit(1);
  }, 15000);
}

run().catch(console.error);
