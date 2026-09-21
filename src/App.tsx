import { useEffect, useState } from 'react';
import { bankCurrentPot, getGameState, playTurn } from './services/game';

const phrases = [
  'Tu joues avec le feu.',
  'La chance aime les inconscients.',
  'Encore debout ? Intéressant.',
  'Ça commence à sentir le braquage.',
  'Tu vas vraiment continuer ?',
];

type Direction = 'higher' | 'lower';

export default function App() {
  const [number, setNumber] = useState(0);
  const [streak, setStreak] = useState(0);
  const [inGame, setInGame] = useState(0);
  const [bank, setBank] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [phrase, setPhrase] = useState('Prêt à tenter ta chance ?');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const state = await getGameState();
        setNumber(state.current_number ?? 0);
        setStreak(state.streak ?? 0);
        setInGame(state.in_play ?? 0);
        setBank(state.loot ?? 0);
        setMultiplier(state.multiplier ?? 1);
      } catch (err) {
        setError('Connexion impossible. Vérifie Supabase.');
      }
    }

    load();
  }, []);

  async function play(direction: Direction) {
    if (loading) return;
    setLoading(true);
    setError('');

    try {
      const result = await playTurn(direction);
      setNumber(result.next_number);
      setStreak(result.streak ?? 0);
      setInGame(result.in_play ?? 0);
      setMultiplier(result.multiplier ?? 1);
      setPhrase(
        result.result === 'correct'
          ? phrases[Math.floor(Math.random() * phrases.length)]
          : 'Aïe. La chance vient de te gifler.'
      );
    } catch {
      setError('Impossible de jouer ce tour.');
    }

    setLoading(false);
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
    } catch {
      setError('Impossible de coffrer.');
    }

    setLoading(false);
  }

  return (
    <main className="game">
      <header>
        <span>EN JEU {inGame}</span>
        <span>COFFRÉ {bank}</span>
      </header>

      <p className="phrase">{phrase}</p>
      <div className="number">{number}</div>
      <div className="streak">Série : {streak} · x{multiplier}</div>

      {error && <p>{error}</p>}

      <div className="buttons">
        <button disabled={loading} onClick={() => play('lower')}>PLUS BAS</button>
        <button disabled={loading} onClick={() => play('higher')}>PLUS HAUT</button>
      </div>

      <button className="bank" disabled={loading} onClick={bankMoney}>COFFRER</button>
    </main>
  );
}
