import { useEffect, useState } from "react";

interface TimerProps {
  seconds: number;
  onEnd: () => void;
  resetKey?: number | string;
}

const Timer = ({ seconds, onEnd, resetKey }: TimerProps) => {
  const [time, setTime] = useState(seconds);

  useEffect(() => {
    setTime(seconds);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (time <= 0) {
      onEnd();
      return;
    }
    const t = setTimeout(() => setTime(time - 1), 1000);
    return () => clearTimeout(t);
  }, [time, onEnd]);

  return <div className="text-xl">⏱ {time}s</div>;
};

export default Timer;
