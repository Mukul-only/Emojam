import { useState, useEffect, useRef } from "react";
import Countdown from "./Countdown";
import GraphemeSplitter from "grapheme-splitter";
import GameStartIcon from "../assets/gamestart.svg?react";
import PlayIcon from "../assets/play.svg?react";
import SendIcon from "../assets/send.svg?react";
import ResultIcon from "../assets/result.svg?react";

function GameArea({
  gameState,
  countdown,
  guessInput,
  setGuessInput,
  submitGuess,
  guessResult,
  roundResult,
  gameOver,
  players = [],
  username,
  onStartGame,
  ...rest
} = props) {
  const [sortedPlayers, setSortedPlayers] = useState([]);
  const [showWrongGuess, setShowWrongGuess] = useState(false); // NEW
  const inputRef = useRef(null);

  useEffect(() => {
    const sorted = [...players].sort((a, b) => b.score - a.score);
    setSortedPlayers(sorted);
  }, [players]);

  useEffect(() => {
    if (gameState.status === "playing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState.status]);

  const splitter = new GraphemeSplitter();
  const emojis = splitter.splitGraphemes(gameState.emojiClues || "");

  // ✅ Handle wrong guess feedback
  useEffect(() => {
    if (guessResult && guessResult.correct === false) {
      setShowWrongGuess(true);
      setGuessInput(""); // clear the input
      const timeout = setTimeout(() => {
        setShowWrongGuess(false); // hide wrong guess message
      }, 1500); // show for 1.5 seconds
      return () => clearTimeout(timeout);
    }
  }, [guessResult]);

  if (gameState.status === "waiting") {
    return (
      <div className="">
        <div className="flex items-center justify-center">
          <h2 className="tracking-wide text-white text-md">
            Waiting for players
          </h2>
          <div className="p-6 text-center text-white bg-transparent rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0s]"></span>
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        </div>
        <p className="mb-8 text-sm btn-d">
          {players.length} player{players.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={onStartGame}
          {...rest}
          className="flex items-center justify-center gap-2 px-8 py-2 mx-auto text-lg font-semibold text-white"
        >
          <GameStartIcon />
          Start Game
        </button>
        <div className="mt-6 line" />
        <div className="pt-6 mt-2">
          <h3 className="mb-6 font-bold text-md btn-d">How to Play</h3>
          <ul className="pl-5 space-y-2 text-sm text-center text-gray-400 list-none">
            <li>
              Each round you'll see emoji clues representing a word or phrase
            </li>
            <li>Type your guess in the input field below the emojis</li>
            <li>Faster guesses earn more points!</li>
            <li>Play 5 rounds to determine the winner</li>
          </ul>
        </div>
      </div>
    );
  }

  if (gameState.status === "starting" && countdown?.type === "gameStart") {
    return (
      <div className="p-6 text-center bg-transparent rounded-lg ">
        <h2 className="mb-4 text-2xl font-bold text-white">
          Game Starting Soon!
        </h2>
        <div className="my-8 text-5xl font-bold text-green-400">
          {countdown.seconds}
        </div>
        <p className="text-gray-400">Get ready to guess!</p>
      </div>
    );
  }

  if (gameState.status === "playing") {
    return (
      <div className="p-6 bg-transparent rounded-lg ">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center text-xl font-bold text-white ">
            <PlayIcon />
            <h1>
              Round {gameState.currentRound}/{gameState.totalRounds}
              {gameState.theme && (
                <span
                  className="ml-3 text-sm font-semibold text-gray-200 btn-d"
                  {...rest}
                >
                  Theme: {gameState.theme}
                </span>
              )}
            </h1>
          </div>
          <Countdown
            seconds={countdown?.seconds}
            type={countdown?.type}
            data-glow
          />
        </div>

        <section
          role="region"
          aria-label="Emoji Clue"
          className="my-8 text-center"
        >
          <div className="p-8 border-2 border-dashed rounded-lg border-card_border ">
            <div className="tracking-widest text-7xl">
              {emojis.map((emoji, index) => (
                <span
                  key={index}
                  className="inline-block emoji-bounce"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </section>

        <form onSubmit={submitGuess} className="mt-6">
          <div className="flex">
            <input
              ref={inputRef}
              type="text"
              className={`input flex-grow ${
                guessResult?.correct ? "bg-green-50 border-green-500" : ""
              }`}
              placeholder="Type your guess here..."
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              disabled={guessResult?.correct}
            />
            <button
              type="submit"
              className="flex items-center justify-center w-12 h-12 ml-2 bg-white "
              disabled={guessResult?.correct}
              style={{ borderRadius: "100%" }}
            >
              <SendIcon className="w-6 h-6" />
            </button>
          </div>

          {guessResult?.correct && (
            <div className="p-2 mt-2 font-bold text-center text-green-400 rounded-xl correct-guess">
              Correct! You earned {guessResult.score} points
            </div>
          )}

          {showWrongGuess && !guessResult?.correct && (
            <div className="p-2 mt-2 font-bold text-center text-red-400 rounded-xl incorrect-guess">
              Wrong guess, try again!
            </div>
          )}
        </form>
      </div>
    );
  }

  if (gameState.status === "intermission" && roundResult) {
    return (
      <div className="p-6 bg-transparent rounded-lg ">
        <div className="py-4 border border-card_border rounded-xl">
          <div className="flex items-center justify-center gap-2 mb-2 text-2xl font-bold text-center text-white">
            <ResultIcon />
            <h1>Round {roundResult.round} Results</h1>
          </div>
          <div className="mb-3 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-2 text-3xl">{roundResult.emojiClues}</div>
              <div
                className="px-6 py-2 font-bold text-white text-md rounded-xl"
                {...rest}
              >
                {roundResult.answer}
              </div>
            </div>
            <div className="mt-4 text-gray-400">
              {roundResult.correctGuessers} player
              {roundResult.correctGuessers !== 1 ? "s" : ""} guessed correctly
            </div>
          </div>
        </div>

        <Leaderboard players={sortedPlayers} username={username} data-glow />
      </div>
    );
  }

  if (gameState.status === "finished" || gameOver) {
    const topScore = sortedPlayers[0]?.score;
    const topScorers = sortedPlayers.filter((p) => p.score === topScore);
    const isWinner = topScorers.some((p) => p.username === username);

    return (
      <div className="p-6 text-center bg-transparent rounded-lg ">
        <h2 className="mb-4 text-3xl font-bold text-white">Game Over!</h2>

        {topScorers.length === 1 ? (
          <div className="my-8">
            <div
              className="px-8 py-2 mx-auto mb-2 text-xl text-white w-fit rounded-xl"
              {...rest}
            >
              {isWinner
                ? "🎉 You win! 🎉"
                : `🏆 ${topScorers[0].username} wins! 🏆`}
            </div>
            <div className="my-4 text-5xl font-bold text-green-400">
              {topScore} points
            </div>
          </div>
        ) : (
          <div className="my-8">
            <div className="mb-2 text-xl">
              🤝 It's a tie between{" "}
              {topScorers.map((p) => p.username).join(", ")}!
            </div>
            <div className="my-4 text-5xl font-bold text-primary-600">
              {topScore} points each
            </div>
          </div>
        )}

        <Leaderboard players={sortedPlayers} username={username} />

        <button
          onClick={onStartGame}
          className="px-6 py-2 mt-8 font-bold text-white btn-start"
        >
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 text-center text-white bg-transparent rounded-lg">
      <div className="flex items-center justify-center space-x-2">
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0s]"></span>
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
}

function Leaderboard({ players, username, ...rest } = props) {
  return (
    <div
      className="p-2 mt-6 border rounded-xl border-card_border h-[10vw] overflow-y-auto"
      role="region"
      aria-label="Leaderboard"
    >
      <h3 className="mb-3 text-lg font-medium text-white">Leaderboard</h3>
      <div className="p-4 bg-[#0A0A0A] border border-[#2E2E2E] rounded-xl">
        <table className="w-full">
          <thead>
            <tr className="text-left text-white border-b border-dashed border-card_border">
              <th className="pb-2">Rank</th>
              <th className="pb-2">Player</th>
              <th className="pb-2 text-right">Score</th>
            </tr>
          </thead>
          <tbody className="text-gray-300 ">
            {players.map((player, index) => (
              <tr
                key={player.id}
                className={`border-b b last:border-0  ${
                  player.username === username ? "font-medium" : ""
                }`}
              >
                <td className="py-2 text-left">{index + 1}</td>
                <td className="py-2 text-left">
                  {player.username}
                  {player.username === username && (
                    <span className="ml-2 text-xs">(You)</span>
                  )}
                </td>
                <td className="py-2 text-right">{player.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GameArea;
