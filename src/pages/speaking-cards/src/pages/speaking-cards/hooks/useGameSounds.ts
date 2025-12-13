import { useCallback, useRef } from "react";

const useGameSounds = (enabled: boolean) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) => {
    if (!enabled) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log("Audio not supported");
    }
  }, [enabled, getAudioContext]);

  const playCardFlip = useCallback(() => {
    if (!enabled) return;
    playTone(800, 0.08, "sine", 0.2);
    setTimeout(() => playTone(1200, 0.1, "sine", 0.15), 50);
  }, [enabled, playTone]);

  const playButtonClick = useCallback(() => {
    if (!enabled) return;
    playTone(600, 0.05, "sine", 0.15);
  }, [enabled, playTone]);

  const playSuccess = useCallback(() => {
    if (!enabled) return;
    playTone(523, 0.15, "sine", 0.2); // C5
    setTimeout(() => playTone(659, 0.15, "sine", 0.2), 100); // E5
    setTimeout(() => playTone(784, 0.2, "sine", 0.25), 200); // G5
  }, [enabled, playTone]);

  const playNavigation = useCallback(() => {
    if (!enabled) return;
    playTone(440, 0.06, "triangle", 0.15);
  }, [enabled, playTone]);

  const playShuffle = useCallback(() => {
    if (!enabled) return;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => playTone(300 + Math.random() * 400, 0.05, "sine", 0.1), i * 40);
    }
  }, [enabled, playTone]);

  const playMicStart = useCallback(() => {
    if (!enabled) return;
    playTone(440, 0.1, "sine", 0.2);
    setTimeout(() => playTone(880, 0.15, "sine", 0.2), 80);
  }, [enabled, playTone]);

  const playMicStop = useCallback(() => {
    if (!enabled) return;
    playTone(880, 0.1, "sine", 0.2);
    setTimeout(() => playTone(440, 0.15, "sine", 0.2), 80);
  }, [enabled, playTone]);

  return {
    playCardFlip,
    playButtonClick,
    playSuccess,
    playNavigation,
    playShuffle,
    playMicStart,
    playMicStop,
  };
};

export default useGameSounds;
