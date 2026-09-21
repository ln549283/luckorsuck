import { useState } from 'react';

const phrases = [
  'Tu joues avec le feu.',
  'Encore debout ?',
  'La chance aime les inconscients.',
];

export default function App() {
  const [number, setNumber] = useState(42);
  const [streak, setStreak] = useState(0);
  const [phrase, setPhrase] = useState('Prêt à tenter ta chance ?');

  const play = (direction: 'higher' | 'lower') => {
    const next = Math.floor(Math.random() * 101);
    const win = direction === 'higher' ? next > number : next < number;

    setNumber(next);
    if (win) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    } else {
      setStreak(0);
      setPhrase('Aïe. Fallait choisir.');
    }
  };

  return (
    <main className="game">
      <header>
        <span>EN JEU {streak}</span>
        <span>COFFRÉ 0</span>
      </header>

      <p className="phrase">{phrase}</p>
      <div className="number">{number}</div>

      <div className="buttons">
        <button onClick={() => play('lower')}>PLUS BAS</button>
        <button onClick={() => play('higher')}>PLUS HAUT</button>
      </div>

      <button className="bank">COFFRER</button>
    </main>
  );
}
