import { useEffect, useMemo, useState } from 'react';
import { bankCurrentPot, getGameState, playTurn, startRound, type Direction } from './services/game';
import { ensureAnonymousSession } from './services/auth';
import { setSoundEnabled, sounds } from './services/sound';
import { copy, type Language } from './data/i18n';

type Screen = 'home' | 'game';

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
  const [timeLeft, setTimeLeft] = useState(3);


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

    setTimeLeft(3);
    const startedAt = performance.now();

    const ticker = window.setInterval(() => {
      const remaining = Math.max(0, 3 - (performance.now() - startedAt) / 1000);
      setTimeLeft(remaining);
    }, 50);

    const timer = window.setTimeout(() => {
      setTimeLeft(0);
      void play('timeout');
    }, 3000);

    return () => {
      window.clearInterval(ticker);
      window.clearTimeout(timer);
    };
  }, [screen, loading, turnKey, number]);

  const tension = useMemo(() => {
    if (streak >= 20) return 'tension-max';
    if (streak >= 10) return 'tension-high';
    if (streak >= 5) return 'tension-mid';
    return 'tension-low';
  }, [streak]);

  function contextualPhrase(
    result: 'correct' | 'wrong' | 'timeout',
    nextStreak: number
  ) {
    if (result === 'timeout') return pick(t.timeout);
    if (result !== 'correct') return pick(t.fail);
    return getStreakPhrase(language, nextStreak);
  }

  async function play(direction: Direction) {
    if (loading || screen !== 'game' || number === null) return;

    const oldNumber = number;
    setLoading(true);
    setError('');

    try {
      if (direction === 'timeout') sounds.timeout();
      else sounds.click();

      const result = await playTurn(direction);
      const next = result.next_number ?? oldNumber;
      const nextStreak = result.streak ?? 0;
      const resultType = result.result as 'correct' | 'wrong' | 'timeout';

      setPreviousNumber(oldNumber);
      setNumber(next);
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      setInGame(result.in_play ?? 0);
      setLoot(result.loot ?? loot);
      setMultiplier(result.multiplier ?? 1);
      setBankValue(result.bank_value ?? 0);
      setTurnKey((value) => value + 1);
      setPhrase(contextualPhrase(resultType, nextStreak));

      if (resultType === 'correct') {
        sounds.success(nextStreak);
      } else {
        sounds.fail();

        // Laisse le joueur voir le nombre qui l'a battu, sans casser la session.
        await new Promise((resolve) => window.setTimeout(resolve, 700));

        const fresh = await startRound();
        setNumber(fresh.current_number ?? next);
        setStreak(fresh.streak ?? 0);
        setInGame(fresh.in_play ?? 0);
        setLoot(fresh.loot ?? loot);
        setMultiplier(fresh.multiplier ?? 1);
        setBankValue(fresh.bank_value ?? 0);
        setTurnKey((value) => value + 1);
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

  async function startGame() {
    if (loading || number === null) return;

    setLoading(true);
    setError('');

    try {
      const state = await startRound();
      setNumber(state.current_number ?? number);
      setStreak(state.streak ?? 0);
      setBestStreak(state.best_streak ?? bestStreak);
      setInGame(state.in_play ?? 0);
      setLoot(state.loot ?? loot);
      setMultiplier(state.multiplier ?? 1);
      setBankValue(state.bank_value ?? 0);
      setPhrase(pick(t.intro));
      setPreviousNumber(null);
      setTurnKey((value) => value + 1);
      setScreen('game');
    } catch {
      setError(t.connection);
    } finally {
      setLoading(false);
    }
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

          <button className="play-cta" disabled={loading || number === null} onClick={() => void startGame()}>
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
        <div className={`timer-block ${timeLeft <= 2 ? 'timer-mid' : ''} ${timeLeft <= 1 ? 'timer-danger' : ''} ${timeLeft <= .5 ? 'timer-critical' : ''}`}>
          <div className="timer-readout" aria-live="off">
            <span>{language === 'fr' ? 'TEMPS RESTANT' : 'TIME LEFT'}</span>
            <strong>{Math.max(0, timeLeft).toFixed(1)}<small>s</small></strong>
          </div>
          <div key={`timer-${turnKey}`} className="timer-track" aria-label="3 seconds">
            <div className="timer-fill" />
          </div>
        </div>
      </div>

      <div className="streak">{t.streak} {streak}</div>
      {error && <p className="error">{error}</p>}

      <div className="buttons">
        <button className="lower" disabled={loading} onClick={() => void play('even')}>
          {t.lower}
        </button>
        <button className="higher" disabled={loading} onClick={() => void play('odd')}>
          {t.higher}
        </button>
      </div>

      <button className="bank" disabled={loading || bankValue <= 0} onClick={() => void bankMoney()}>
        <small>{t.bank}</small>
        <strong>+{bankValue}</strong>
      </button>
    </main>
  );
}
