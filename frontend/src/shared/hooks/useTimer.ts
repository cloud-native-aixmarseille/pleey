import { useEffect } from 'react';

export function useTimer(
  timeLeft: number,
  setTimeLeft: (time: number) => void,
  isActive: boolean,
  hasAnswer: boolean
) {
  useEffect(() => {
    if (isActive && timeLeft > 0 && !hasAnswer) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isActive, hasAnswer, setTimeLeft]);
}
