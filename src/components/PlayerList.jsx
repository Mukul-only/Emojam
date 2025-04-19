import PeopleIcon from "../assets/people.svg?react";
function PlayerList({ players, currentUser, ...rest } = props) {
  // Sort players by score (descending)
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full  overflow-hidden p-4 ">
      <div className="flex items-center justify-center gap-2 mb-3 w-fit">
        <PeopleIcon className="w-6 h-6" />
        <h2 className="font-semibold text-gray-200 text-md">
          Players
          <span className="ml-2 text-sm font-normal text-gray-300">
            ({players.length})
          </span>
        </h2>
      </div>
      <div className="mb-3 line" />
      <div className="flex-1 space-y-2 overflow-auto">
        {players.length === 0 ? (
          <div className="py-4 text-center text-gray-500">No players yet</div>
        ) : (
          sortedPlayers.map((player) => (
            <div
              key={player.id}
              className={`flex items-center justify-between py-2 px-3 rounded-xl transition-colors  ${
                player.username === currentUser
                  ? "bg-blue-50 border border-blue-200"
                  : ""
              }`}
              {...rest}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 mr-3 font-semibold rounded-full bg-primary-100 text-primary-800">
                  {player.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-blue-50">
                    {player.username}
                    {player.username === currentUser && (
                      <span className="ml-1 text-xs text-gray-400">(You)</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 text-right">
                <p className="font-bold text-blue-50">{player.score}</p>
                <p className="text-xs text-gray-400">pts</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default PlayerList;
