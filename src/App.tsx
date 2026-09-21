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
  const [previousNumber, setPreviousNumber] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [inGame, setInGame] = useState(0);
  const [bank, setBank] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [phrase, setPhrase] = useState(phrases.intro[0]);
  const [timeLeft, setTimeLeft] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [changeKey, setChangeKey] = useState(0);

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
    if (loading || gameOver || number === 0) return;
    const timer = window.setInterval(() => {
      setTimeLeft((value) => {
        if (value <= 1) {
          play('timeout');
          return 3;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [loading, gameOver, number]);

  async function play(direction: Direction | 'timeout') {
    if (loading || gameOver) return;
    setLoading(true);
    try {
      const result = await playTurn(direction);
      setPreviousNumber(number);
      setNumber(result.next_number);
      setChangeKey((value) => value + 1);
      setStreak(result.streak ?? 0);
      setInGame(result.in_play ?? 0);
      setMultiplier(result.multiplier ?? 1);

      if (result.result !== 'correct') {
        setPhrase(phrases.events.fail);
        setGameOver(true);
      } else {
        setPhrase(direction === 'timeout' ? phrases.events.timeout : getStreakPhrase(result.streak ?? 0));
      }
      setTimeLeft(3);
    } catch {
      setError('Impossible de jouer.');
    } finally {
      setLoading(false);
    }
  }

  async function bankMoney() {
    if (loading || inGame === 0) return;
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

  function restart() {
    window.location.reload();
  }

  async function shareFailure() {
    const text = `J'ai tenu ${streak} tours sur Luck or Suck et j'ai sécurisé ${bank}. Tu fais mieux ?`;
    if (navigator.share) await navigator.share({ title: 'Luck or Suck', text });
    else await navigator.clipboard?.writeText(text);
  }

  return (
    <main className={`game ${gameOver ? 'game-over' : ''}`}>
      <header>
        <span>EN JEU<br/><strong>{inGame}</strong></span>
        <span>COFFRÉ<br/><strong>{bank}</strong></span>
      </header>

      {!gameOver ? <>
        <p className="phrase">{phrase}</p>
        <div key={changeKey} className={`number pop ${timeLeft === 1 ? 'danger' : ''}`}>{number}</div>
        <div className={`timer ${timeLeft === 1 ? 'danger' : ''}`}>{timeLeft}s</div>
        <div className="streak">Série {streak} · x{multiplier}</div>
        {error && <p>{error}</p>}
        <div className="buttons">
          <button disabled={loading} onClick={() => play('lower')}>PLUS BAS</button>
          <button disabled={loading} onClick={() => play('higher')}>PLUS HAUT</button>
        </div>
        <button className="bank" disabled={loading || inGame === 0} onClick={bankMoney}>💰 COFFRER {inGame}</button>
      </> : <section className="result">
        <p className="phrase">{phrase}</p>
        <div className="number">{previousNumber} → {number}</div>
        <h1>PERDU.</h1>
        <p>COFFRÉ : {bank}</p>
        <button className="bank" onClick={restart}>REJOUER</button>
        <button onClick={shareFailure}>PARTAGER MON ÉCHEC</button>
      </section>}
    </main>
  );
}
