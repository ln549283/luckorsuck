import { useEffect, useState } from 'react';
import { bankCurrentPot, getGameState, playTurn } from './services/game';
import { ensureAnonymousSession } from './services/auth';
import { phrases } from './data/phrases';

type Direction = 'higher' | 'lower';

function getStreakPhrase(streak: number) {
  const keys = Object.keys(phrases.streak).map(Number).sort((a, b) => b - a);
  const key = keys.find((value) => streak >= value);
  if (!key) return phrases.intro[Math.floor(Math.random() * phrases.intro.length)];
  const pool = phrases.streak[key as keyof typeof phrases.streak];
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function App() {
  const [number, setNumber] = useState(0);
  const [streak, setStreak] = useState(0);
  const [inGame, setInGame] = useState(0);
  const [bank, setBank] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [phrase, setPhrase] = useState(phrases.intro[0]);
  const [timeLeft, setTimeLeft] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        await ensureAnonymousSession();
        const state = await getGameState();
        setNumber(state.current_number ?? 0);
        setStreak(state.streak ?? 0);
        setInGame(state.in_play ?? 0);
        setBank(state.loot ?? 0);
        setMultiplier(state.multiplier ?? 1);
      } catch {
        setError('Connexion impossible.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading || number === 0) return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loading, number]);

  useEffect(() => {
    if (timeLeft === 0 && !loading) {
      play('timeout');
    }
  }, [timeLeft]);

  async function play(direction: Direction | 'timeout') {
    if (loading) return;
    setLoading(true);
    try {
      const result = await playTurn(direction);
      setNumber(result.next_number);
      setStreak(result.streak ?? 0);
      setInGame(result.in_play ?? 0);
      setMultiplier(result.multiplier ?? 1);
      setPhrase(direction === 'timeout'
        ? phrases.events.timeout
        : result.result === 'correct'
          ? getStreakPhrase(result.streak ?? 0)
          : phrases.events.fail);
      setTimeLeft(3);
    } catch {
      setError('Impossible de jouer.');
    } finally {
      setLoading(false);
    }
  }

  async function bankMoney() {
    if (loading) return;
    setLoading(true);
    try {
      const result = await bankCurrentPot();
      setBank(result.loot ?? bank);
      setInGame(0);
      setStreak(0);
      setMultiplier(1);
      setPhrase('Bien joué. Tu as sécurisé le butin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="game">
      <header>
        <span>EN JEU {inGame}</span>
        <span>COFFRÉ {bank}</span>
      </header>
      <p className="phrase">{phrase}</p>
      <div className="number">{number}</div>
      <div className="timer">{timeLeft}s</div>
      <div className="streak">Série {streak} · x{multiplier}</div>
      {error && <p>{error}</p>}
      <div className="buttons">
        <button disabled={loading} onClick={() => play('lower')}>PLUS BAS</button>
        <button disabled={loading} onClick={() => play('higher')}>PLUS HAUT</button>
      </div>
      <button className="bank" disabled={loading} onClick={bankMoney}>COFFRER</button>
    </main>
  );
}
