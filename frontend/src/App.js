import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");
const ROOM = "general";

function App() {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [token, setToken] = useState(localStorage.getItem("token"));

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // SOCKET LISTENER
  useEffect(() => {
    socket.emit("join_room", ROOM);

    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  // REGISTER / LOGIN
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = isLogin
        ? "http://localhost:5000/api/auth/login"
        : "http://localhost:5000/api/auth/register";

      const data = isLogin
        ? { email, password }
        : { username, email, password };

      const res = await axios.post(url, data);

      if (isLogin) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        alert("Login successful");
      } else {
        alert("Register successful");
        setIsLogin(true);
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Error");
    }
  };

  // SEND MESSAGE
  const sendMessage = () => {
    if (!message) return;

    const msgData = {
      room: ROOM,
      message: message,
      sender: "me",
    };

    socket.emit("send_message", msgData);

    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <div style={{ padding: "30px" }}>

      {!token ? (
        <div>
          <h1>{isLogin ? "Login" : "Register"}</h1>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                />
                <br /><br />
              </>
            )}

            <input
              placeholder="Email"
              type="email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <br /><br />

            <input
              placeholder="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <br /><br />

            <button type="submit">
              {isLogin ? "Login" : "Register"}
            </button>
          </form>

          <br />

          <button onClick={() => setIsLogin(!isLogin)}>
            Switch to {isLogin ? "Register" : "Login"}
          </button>
        </div>
      ) : (
        <div>
          <h2>💬 Chat Room</h2>

          <button onClick={logout}>Logout</button>

          <div style={{ marginTop: "20px" }}>
            {messages.map((msg, i) => (
              <p key={i}>
                <b>{msg.sender}:</b> {msg.message}
              </p>
            ))}
          </div>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type message..."
          />

          <button onClick={sendMessage}>Send</button>
        </div>
      )}

    </div>
  );
}

export default App;