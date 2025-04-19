import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Chat from "../components/Chat";
import PlayerList from "../components/PlayerList";
import GameArea from "../components/GameArea";
import { usePointerGlow } from "../hooks/usePointerGlow";
import ExitIcon from "../assets/exit.svg?react";
import PlayIcon from "../assets/play.svg?react";
import "../glow.css";
import EmojiTerrain from "./EmojiTerrain";
import SmileIcon from "../assets/smile.svg?react";
import HouseIcon from "../assets/house.svg?react";
import EyeOpenIcon from "../assets/eye_open.svg?react";
import EyeClosedIcon from "../assets/eye_closed.svg?react";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function Game() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef();

  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(roomId);
  const [username, setUsername] = useState("");
  const [players, setPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [gameState, setGameState] = useState({
    status: "waiting",
    currentRound: 0,
    totalRounds: 5,
    theme: null,
    emojiClues: [],
  });
  const [countdown, setCountdown] = useState(null);
  const [guessInput, setGuessInput] = useState("");
  const [guessResult, setGuessResult] = useState(null);
  const [roundResult, setRoundResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showTerrain, setShowTerrain] = useState(false);
  // Helper to add messages with unique ID
  const addMessage = useCallback((message) => {
    setMessages((prev) => [
      ...prev,
      { ...message, id: `${Date.now()}-${Math.random()}` },
    ]);
  }, []);

  // Game action handlers
  const startGame = useCallback(() => {
    socketRef.current?.emit("startGame");
  }, []);

  const submitGuess = useCallback(
    (e) => {
      e.preventDefault();
      if (guessInput.trim()) {
        socketRef.current.emit("submitGuess", guessInput.trim());
      }
    },
    [guessInput]
  );

  const sendMessage = useCallback((text) => {
    if (text.trim()) {
      socketRef.current.emit("sendMessage", text);
      setGuessInput("");
    }
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.disconnect();
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("room");
    navigate("/");
  }, [navigate]);

  // Lifecycle
  useEffect(() => {
    const storedUsername = sessionStorage.getItem("username");
    const storedRoom = sessionStorage.getItem("room");

    if (!storedUsername || !storedRoom) {
      navigate("/");
      return;
    }

    setUsername(storedUsername);
    setRoom(storedRoom);

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 3,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("joinRoom", { username: storedUsername, room: storedRoom });
    });

    socket.on("message", addMessage);
    socket.on("error", (error) =>
      addMessage({ user: "system", text: `Error: ${error.message}` })
    );
    socket.on("roomData", ({ room, players }) => {
      setRoom(room);
      setPlayers(players);
    });
    socket.on("gameState", setGameState);
    socket.on("countdown", ({ type, seconds }) => {
      setCountdown({ type, seconds });
    });

    socket.on("roundStart", ({ round, totalRounds, theme }) => {
      setRoundResult(null);
      setGuessResult(null);
      addMessage({
        user: "system",
        text: `Round ${round}/${totalRounds} - Theme: ${theme}`,
      });
    });

    socket.on("guessResult", (result) => {
      setGuessResult(result);
      if (result.correct) setGuessInput("");
    });

    socket.on("roundEnd", ({ answer }) => {
      setRoundResult({ answer });
      setGuessInput("");
      addMessage({
        user: "system",
        text: `Round ended! The answer was: ${answer}`,
      });
    });

    socket.on("gameOver", ({ winners }) => {
      setGameOver(true);
      const winnerMsg = winners.length
        ? `Winner: ${winners[0].username} with ${winners[0].score} points!`
        : "No winners this time!";
      addMessage({ user: "system", text: `Game over! ${winnerMsg}` });
    });

    socket.on("disconnect", () => {
      setConnected(false);
      addMessage({
        user: "system",
        text: "Disconnected from server. Trying to reconnect...",
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate, addMessage]);
  usePointerGlow();
  if (!connected) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mb-4 border-4 rounded-full animate-spin border-t-primary-500" />
          <p className="text-lg">Connecting to game server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-game_bg ">
      {showTerrain && <EmojiTerrain />}
      <button
        onClick={() => setShowTerrain(!showTerrain)}
        className="fixed z-50 flex items-center justify-center px-4 py-2 text-sm font-semibold transition duration-300 border rounded-full w-14 h-14 border-zinc-800 bg-zinc-900 top-4 right-4"
      >
        {showTerrain ? <EyeOpenIcon /> : <EyeClosedIcon />}
      </button>

      <div className="flex justify-center pt-4">
        <div className="h-full  w-[84rem] mx-auto">
          {/* Header */}
          <div className="glow-wrapper">
            <div
              className="flex flex-col items-center justify-between p-4 mb-4 rounded-lg game_card md:flex-row"
              data-glow
            >
              <div className="flex items-center gap-2 text-2xl font-bold text-white">
                <SmileIcon className="w-8 h-8" />
                <h1>EMOJAM</h1>
                <span
                  className="flex items-center justify-center gap-2 px-6 py-2 ml-2 text-sm font-semibold rounded-2xl "
                  data-glow
                >
                  <HouseIcon className="w-5 h-5" />
                  Room: {room}
                </span>
              </div>
              <div className="flex mt-4 space-x-4 md:mt-0">
                {gameState.status === "waiting" && (
                  <button
                    onClick={startGame}
                    className="flex items-center justify-center gap-2 text-white btn btn-start"
                  >
                    <PlayIcon className="w-6 h-6 " />
                    Start Game
                  </button>
                )}
                <button
                  onClick={leaveRoom}
                  className="flex items-center justify-center gap-2 text-white btn btn-leave"
                >
                  <ExitIcon className="w-6 h-6 " />
                  Leave Room
                </button>
              </div>
            </div>
          </div>

          {/* Game grid */}
          <div className="flex h-[calc(100vh-8.5rem)]  gap-4">
            {/* Main Game */}
            <div className="flex flex-col gap-4 basis-3/5 glow-wrapper">
              <div
                data-glow
                style={{
                  "--base": "240",
                  "--saturation": "100",
                  "--lightness": "70",
                  "--spread": "400",
                }}
                className="p-6 text-center rounded-lg shadow-md game_card"
              >
                <GameArea
                  gameState={gameState}
                  countdown={countdown}
                  guessInput={guessInput}
                  setGuessInput={setGuessInput}
                  submitGuess={submitGuess}
                  guessResult={guessResult}
                  roundResult={roundResult}
                  gameOver={gameOver}
                  players={players}
                  username={username}
                  onStartGame={startGame}
                  data-glow
                />
              </div>
              <div className="flex-1 overflow-hidden glow-wrapper">
                <div
                  style={{
                    "--base": "300",
                    "--saturation": "100",
                    "--lightness": "70",
                  }}
                  className="h-full rounded-lg game_card"
                  data-glow
                >
                  <PlayerList
                    players={players}
                    currentUser={username}
                    data-glow
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="h-full basis-2/5 glow-wrapper">
              <div
                style={{
                  "--base": "120",
                  "--saturation": "100",
                  "--lightness": "70",
                }}
                data-glow
                className="h-full rounded-lg game-card"
              >
                <Chat
                  messages={messages}
                  sendMessage={sendMessage}
                  username={username}
                  data-glow
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
