import { useEffect, useState } from 'react';

const phrases = [
  'Tu joues avec le feu.',
  'La chance aime les inconscients.',
  'Encore debout ? Intéressant.',
  'Ça commence à sentir le braquage.',
  'Tu vas vraiment continuer ?',
];

type Direction = 'higher' | 'lower';

export default function App() {
  const [number, setNumber] = useState(42);
  const [streak, setStreak] = useState(0);
  const [inGame, setInGame] = useState(0);
  const [bank, setBank] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [phrase, setPhrase] = useState('Prêt à tenter ta chance ?');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: branchement RPC Supabase après validation des variables d'environnement.
  }, []);

  async function play(direction: Direction) {
    if (loading) return;
    setLoading(true);

    // Fallback local temporaire pendant la connexion RPC.
    const next = Math.floor(Math.random() * 101);
    const win = direction === 'higher' ? next > number : next < number;

    setNumber(next);

    if (win) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMultiplier(Math.min(25, 1 + Math.floor(newStreak / 3)));
      setInGame((value) => value + next * multiplier);
      setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    } else {
      setStreak(0);
      setMultiplier(1);
      setInGame(0);
      setPhrase('Aïe. La chance vient de te gifler.');
    }

    setLoading(false);
  }

  function bankMoney() {
    setBank((value) => value + inGame);
    setInGame(0);
    setStreak(0);
    setMultiplier(1);
    setPhrase('Bien joué. Tu as sécurisé le butin.');
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

      <div className="buttons">
        <button disabled={loading} onClick={() => play('lower')}>PLUS BAS</button>
        <button disabled={loading} onClick={() => play('higher')}>PLUS HAUT</button>
      </div>

      <button className="bank" onClick={bankMoney}>COFFRER</button>
    </main>
  );
}
