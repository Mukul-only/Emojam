import EmojiTerrain from "./EmojiTerrain"; // Adjust the path as needed
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import slugify from "slugify";
import Ellipse from "../assets/Ellipse.svg?react";
import GamepadIcon from "../assets/gamepad.svg?react";
import DoorIcon from "../assets/door.svg?react";
import { motion } from "framer-motion";
import "../effects/pointerParticles"; // 👈 Import the web component here
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
function Home() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roomLoading, setRoomLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchActiveRooms();
    const interval = setInterval(fetchActiveRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveRooms = async () => {
    try {
      setRoomLoading(true);
      const response = await axios.get(`${API_URL}/rooms`);
      setActiveRooms(response.data.rooms || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setRoomLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) return setError("Username is required");
    if (!room.trim()) return setError("Room name is required");

    const cleanRoom = slugify(room.trim(), { lower: true, strict: true });
    sessionStorage.setItem("username", username.trim());
    sessionStorage.setItem("room", cleanRoom);
    navigate(`/game/${cleanRoom}`);
  };

  const joinRoom = (roomName) => {
    if (!username.trim()) return setError("Please enter a username first");
    sessionStorage.setItem("username", username.trim());
    sessionStorage.setItem("room", roomName);
    navigate(`/game/${roomName}`);
  };

  return (
    <div className="relative flex flex-col items-center h-screen overflow-hidden bg-primary_dark">
      {/* <pointer-particles /> */}
      {/* <Ellipse /> */}
      <EmojiTerrain />
      <div className="absolute top-0 z-10 flex flex-col items-center pt-20 -translate-x-1/2 left-1/2 ">
        <div className="px-6 py-10 bg-transparent rounded-xl w-[30em] overflow-hidden ">
          <div className="flex flex-col items-center justify-center mb-10 text-center">
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
            >
              <GamepadIcon className="w-12 h-12" />
            </motion.div>
            <motion.h1
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
              className="mt-4 text-4xl font-semibold tracking-wider text-white"
            >
              EMOJAM
            </motion.h1>
            <motion.p
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="font-light tracking-tight text-gray-400 text-md"
            >
              Guess words from emoji clues!
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeInOut" }}
            className="w-full max-w-md mx-auto"
          >
            <div className="mb-6 card">
              {error && (
                <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-lg">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input
                    type="text"
                    id="username"
                    autoFocus
                    className="w-full input"
                    placeholder="Enter your name"
                    autoComplete="off"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError("");
                    }}
                    required
                  />
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    id="room"
                    className="w-full input"
                    placeholder="Create or join a room"
                    autoComplete="off"
                    value={room}
                    onChange={(e) => {
                      setRoom(e.target.value);
                      if (error) setError("");
                    }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Join Room"}
                </button>
              </form>
            </div>

            <div className="overflow-y-auto card">
              <div className="w-full mb-4 border-t-[0.1rem] border-[#5B5B5B]" />
              <h2 className="py-2 mb-4 text-lg font-semibold text-center text-white rounded-lg bg-primary_dark border border-[#161C2A]">
                Active Rooms
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({activeRooms.length})
                </span>
              </h2>

              {roomLoading ? (
                <p className="text-center text-gray-500 rounded-lg bg-primary_dark border border-[#161C2A] py-4">
                  Loading rooms...
                </p>
              ) : activeRooms.length > 0 ? (
                <div className="space-y-2 overflow-y-auto max-h-64">
                  {activeRooms.map((room) => (
                    <div
                      key={room.name}
                      className="flex items-center justify-between px-4  py-3 rounded-lg cursor-pointer bg-[#181F2C] border border-[#181F2C] hover:border-[#394966]"
                      onClick={() => joinRoom(room.name)}
                    >
                      <div className="flex items-center gap-2">
                        <DoorIcon className="w-8 h-8" />
                        <div>
                          <h3 className="text-lg font-semibold text-white ">
                            {room.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {room.playerCount} player
                            {room.playerCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          room.status === "playing"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {room.status === "playing" ? "In-Game" : "Waiting"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 rounded-lg bg-primary_dark border border-[#161C2A] py-4">
                  No active rooms right now.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Home;
