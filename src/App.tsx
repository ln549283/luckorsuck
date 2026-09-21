import { useState } from 'react';

const phrases = [
  'Tu joues avec le feu.',
  'La chance aime les inconscients.',
  'Encore debout ? Intéressant.',
  'Ça commence à sentir le braquage.',
  'Tu vas vraiment continuer ?',
];

export default function App() {
  const [number, setNumber] = useState(42);
  const [streak, setStreak] = useState(0);
  const [inGame, setInGame] = useState(0);
  const [bank, setBank] = useState(0);
  const [phrase, setPhrase] = useState('Prêt à tenter ta chance ?');

  const play = (direction: 'higher' | 'lower') => {
    const next = Math.floor(Math.random() * 101);
    const win = direction === 'higher' ? next > number : next < number;

    setNumber(next);

    if (win) {
      setStreak((value) => value + 1);
      setInGame((value) => value + next);
      setPhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    } else {
      setStreak(0);
      setInGame(0);
      setPhrase('Aïe. La chance vient de te gifler.');
    }
  };

  const bankMoney = () => {
    setBank((value) => value + inGame);
    setInGame(0);
    setStreak(0);
    setPhrase('Bien joué. Tu as sécurisé le butin.');
  };

  return (
    <main className="game">
      <header>
        <span>EN JEU {inGame}</span>
        <span>COFFRÉ {bank}</span>
      </header>

      <p className="phrase">{phrase}</p>
      <div className="number">{number}</div>
      <div className="streak">Série : {streak}</div>

      <div className="buttons">
        <button onClick={() => play('lower')}>PLUS BAS</button>
        <button onClick={() => play('higher')}>PLUS HAUT</button>
      </div>

      <button className="bank" onClick={bankMoney}>COFFRER</button>
    </main>
  );
}
