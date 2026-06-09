import { useEffect, useState } from 'react';

/** Poll RTK Query every `intervalMs` while `isActive` is true. */
export function usePollWhileActive(
  isActive: boolean,
  intervalMs = 3000,
): number {
  const [pollInterval, setPollInterval] = useState(0);

  useEffect(() => {
    setPollInterval(isActive ? intervalMs : 0);
  }, [isActive, intervalMs]);

  return pollInterval;
}
