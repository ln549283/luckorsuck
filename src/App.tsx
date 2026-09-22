import { useEffect, useMemo, useState } from 'react';
import { bankCurrentPot, getGameState, playTurn, type Direction } from './services/game';
import { ensureAnonymousSession } from './services/auth';
import { setSoundEnabled, sounds } from './services/sound';
import { copy, type Language } from './data/i18n';

type Screen = 'home' | 'game' | 'over';

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function getStreakPhrase(language: Language, streak: number) {
  const pools = copy[language].streakPhrases;
  const keys = Object.keys(pools).map(Number).sort((a, b) => b - a);
  const key = keys.find((value) => streak >= value) ?? 0;
  return pick(pools[key as keyof typeof pools]);
}

export default function App() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('los-language') as Language) || 'fr');
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('los-sound') !== 'off');
  const [screen, setScreen] = useState<Screen>('home');

  const [number, setNumber] = useState<number | null>(null);
  const [previousNumber, setPreviousNumber] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [inGame, setInGame] = useState(0);
  const [loot, setLoot] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [bankValue, setBankValue] = useState(0);
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [turnKey, setTurnKey] = useState(0);

  const [lostPot, setLostPot] = useState(0);
  const [lostStreak, setLostStreak] = useState(0);

  const t = copy[language];

  useEffect(() => {
    setSoundEnabled(soundOn);
    localStorage.setItem('los-sound', soundOn ? 'on' : 'off');
  }, [soundOn]);

  useEffect(() => {
    localStorage.setItem('los-language', language);
    setPhrase((current) => current || pick(copy[language].intro));
  }, [language]);

  useEffect(() => {
    (async () => {
      try {
        await ensureAnonymousSession();
        const state = await getGameState();
        setNumber(state.current_number ?? 0);
        setStreak(state.streak ?? 0);
        setBestStreak(state.best_streak ?? 0);
        setInGame(state.in_play ?? 0);
        setLoot(state.loot ?? 0);
        setMultiplier(state.multiplier ?? 1);
        setBankValue(state.bank_value ?? 0);
        setPhrase(pick(copy[language].intro));
      } catch {
        setError(t.connection);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (screen !== 'game' || loading || number === null) return;
    const timer = window.setTimeout(() => {
      void play('timeout');
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [screen, loading, turnKey, number]);

  const tension = useMemo(() => {
    if (streak >= 20) return 'tension-max';
    if (streak >= 10) return 'tension-high';
    if (streak >= 5) return 'tension-mid';
    return 'tension-low';
  }, [streak]);

  function contextualPhrase(
    direction: Direction,
    previous: number,
    next: number,
    result: 'correct' | 'wrong' | 'timeout',
    nextStreak: number
  ) {
    if (result === 'timeout') return pick(t.timeout);

    const obvious = previous === 0 || previous === 100;
    if (obvious) return result === 'correct' ? pick(t.obviousWin) : pick(t.obviousFail);

    const brutal =
      (previous === 99 && direction === 'lower' && next === 100) ||
      (previous === 1 && direction === 'higher' && next === 0);

    if (brutal) return pick(t.brutal);
    if (result !== 'correct') return pick(t.fail);
    return getStreakPhrase(language, nextStreak);
  }

  async function play(direction: Direction) {
    if (loading || screen !== 'game' || number === null) return;

    const oldNumber = number;
    const oldPot = inGame;
    const oldStreak = streak;

    setLoading(true);
    setError('');

    try {
      if (direction === 'timeout') sounds.timeout();
      else sounds.click();

      const result = await playTurn(direction);
      const next = result.next_number ?? oldNumber;
      const nextStreak = result.streak ?? 0;

      setPreviousNumber(oldNumber);
      setNumber(next);
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      setInGame(result.in_play ?? 0);
      setLoot(result.loot ?? loot);
      setMultiplier(result.multiplier ?? 1);
      setBankValue(result.bank_value ?? 0);
      setTurnKey((value) => value + 1);

      const resultType = result.result as 'correct' | 'wrong' | 'timeout';
      setPhrase(contextualPhrase(direction, oldNumber, next, resultType, nextStreak));

      if (resultType !== 'correct') {
        sounds.fail();
        setLostPot(oldPot);
        setLostStreak(oldStreak);
        setScreen('over');
      } else {
        sounds.success(nextStreak);
      }
    } catch {
      setError(t.playError);
    } finally {
      setLoading(false);
    }
  }

  async function bankMoney() {
    if (loading || bankValue <= 0) return;
    setLoading(true);
    setError('');

    try {
      const result = await bankCurrentPot();
      sounds.bank();
      setLoot(result.loot ?? loot);
      setInGame(0);
      setStreak(0);
      setMultiplier(1);
      setBankValue(0);
      setPhrase(t.banked);
      setTurnKey((value) => value + 1);
    } catch {
      setError(t.playError);
    } finally {
      setLoading(false);
    }
  }

  async function shareFailure() {
    const text = language === 'fr'
      ? `J’ai fait une série de ${lostStreak} sur Luck or Suck, perdu ${lostPot} en jeu et sécurisé ${loot}. Tu fais mieux ?`
      : `I hit a ${lostStreak} streak on Luck or Suck, lost ${lostPot} on the line and banked ${loot}. Beat that.`;

    try {
      if (navigator.share) await navigator.share({ title: 'Luck or Suck', text });
      else {
        await navigator.clipboard?.writeText(text);
        setPhrase(t.copied);
      }
    } catch {
      // User cancelled sharing: nothing to report.
    }
  }

  function startGame() {
    if (number === null) return;
    setPhrase(pick(t.intro));
    setPreviousNumber(null);
    setLostPot(0);
    setLostStreak(0);
    setTurnKey((value) => value + 1);
    setScreen('game');
  }

  if (screen === 'home') {
    return (
      <main className="home-screen">
        <section className="home-card">
          <div className="brand-mark">63</div>
          <h1 className="logo"><span>LUCK</span><em>OR</em><span>SUCK</span></h1>
          <p className="tagline">{t.subtitle}</p>

          <div className="record">
            <span>{t.best}</span>
            <strong>{bestStreak}</strong>
          </div>

          {error && <p className="error">{error}</p>}

          <button className="play-cta" disabled={loading || number === null} onClick={startGame}>
            {loading ? '…' : t.play}
          </button>

          <div className="quick-settings">
            <button className="mini-button" onClick={() => setSoundOn((value) => !value)}>
              {soundOn ? '🔊' : '🔇'} {soundOn ? t.soundOn : t.soundOff}
            </button>
            <button className="mini-button" onClick={() => setLanguage((value) => value === 'fr' ? 'en' : 'fr')}>
              {language === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
            </button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === 'over') {
    return (
      <main className="game game-over">
        <section className="result">
          <p className="phrase failure">{phrase}</p>
          <div className="result-numbers">
            <span>{previousNumber}</span>
            <span className="arrow">→</span>
            <strong>{number}</strong>
          </div>
          <h1>{t.lost}</h1>
          <div className="loss-stats">
            <div><span>{t.streak}</span><strong>{lostStreak}</strong></div>
            <div><span>{t.loot}</span><strong>{loot}</strong></div>
          </div>
          <button className="play-cta" onClick={startGame}>{t.replay}</button>
          <button className="secondary-action" onClick={shareFailure}>{t.share}</button>
          <button className="text-action" onClick={() => setScreen('home')}>LUCK OR SUCK</button>
        </section>
      </main>
    );
  }

  return (
    <main className={`game ${tension}`}>
      <header className="score-bar">
        <div>
          <span>{t.inPlay}</span>
          <strong>{inGame}</strong>
        </div>
        <div className="multiplier">×{multiplier}</div>
        <div>
          <span>{t.loot}</span>
          <strong>{loot}</strong>
        </div>
      </header>

      <p className="phrase">{phrase}</p>

      <div className="number-stage">
        <div key={turnKey} className="number pop">{number}</div>
        <div key={`timer-${turnKey}`} className="timer-track" aria-label="3 seconds">
          <div className="timer-fill" />
        </div>
      </div>

      <div className="streak">{t.streak} {streak}</div>
      {error && <p className="error">{error}</p>}

      <div className="buttons">
        <button className="lower" disabled={loading} onClick={() => void play('lower')}>
          <span>↓</span>{t.lower}
        </button>
        <button className="higher" disabled={loading} onClick={() => void play('higher')}>
          {t.higher}<span>↑</span>
        </button>
      </div>

      <button className="bank" disabled={loading || bankValue <= 0} onClick={() => void bankMoney()}>
        <small>{t.bank}</small>
        <strong>+{bankValue}</strong>
      </button>
    </main>
  );
}
