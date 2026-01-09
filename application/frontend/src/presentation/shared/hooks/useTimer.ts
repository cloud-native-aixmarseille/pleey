import { useEffect } from "react";

export function useTimer(
  timeLeft: number,
  setTimeLeft: (time: number) => void,
  isActive: boolean,
  hasAnswer: boolean,
  isPaused = false,
) {
  useEffect(() => {
    if (isActive && timeLeft > 0 && !hasAnswer && !isPaused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isActive, hasAnswer, isPaused, setTimeLeft]);
}
