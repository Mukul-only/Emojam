import TimerIcon from "../assets/timer.svg?react";
function Countdown({ seconds, type, ...rest } = props) {
  if (seconds === undefined || seconds === null) {
    return null;
  }

  const isWarning = seconds <= 5;

  return (
    <div
      className={`flex items-center justify-center  gap-2 px-6 py-1 rounded-full font-semibold text-sm ${
        type === "round"
          ? "bg-[#303030] border border-[#3C3C3C] text-white"
          : "bg-[#303030] border border-[#3C3C3C] text-white"
      } ${isWarning ? "timer-warning" : ""}`}
    >
      <TimerIcon className="w-4 h-4 " />
      {seconds}s
    </div>
  );
}

export default Countdown;
