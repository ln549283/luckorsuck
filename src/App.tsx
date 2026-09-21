import { useEffect, useState } from 'react';
import { bankCurrentPot, getGameState, playTurn } from './services/game';
import { ensureAnonymousSession } from './services/auth';
import { sounds } from './services/sound';
import { phrases } from './data/phrases';

type Direction = 'higher' | 'lower';

function getStreakPhrase(streak: number) {
  const keys = Object.keys(phrases.streak).map(Number).sort((a,b)=>b-a);
  const key = keys.find((v)=>streak >= v);
  if (!key) return phrases.intro[Math.floor(Math.random()*phrases.intro.length)];
  const pool = phrases.streak[key as keyof typeof phrases.streak];
  return pool[Math.floor(Math.random()*pool.length)];
}

export default function App() {
  const [number,setNumber]=useState(0);
  const [previousNumber,setPreviousNumber]=useState<number|null>(null);
  const [streak,setStreak]=useState(0);
  const [inGame,setInGame]=useState(0);
  const [bank,setBank]=useState(0);
  const [multiplier,setMultiplier]=useState(1);
  const [phrase,setPhrase]=useState(phrases.intro[0]);
  const [timeLeft,setTimeLeft]=useState(3);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [gameOver,setGameOver]=useState(false);
  const [changeKey,setChangeKey]=useState(0);

  useEffect(()=>{(async()=>{try{await ensureAnonymousSession();const s=await getGameState();setNumber(s.current_number??0);setStreak(s.streak??0);setInGame(s.in_play??0);setBank(s.loot??0);setMultiplier(s.multiplier??1);}catch{setError('Connexion impossible.')}finally{setLoading(false)}})()},[]);

  useEffect(()=>{if(loading||gameOver||number===0)return;const t=window.setInterval(()=>setTimeLeft(v=>{if(v<=1){sounds.timeout();play('timeout');return 3}return v-1}),1000);return()=>window.clearInterval(t)},[loading,gameOver,number]);

  async function play(direction:Direction|'timeout'){
    if(loading||gameOver)return;setLoading(true);
    try{if(direction!=='timeout')sounds.click();const r=await playTurn(direction);setPreviousNumber(number);setNumber(r.next_number);setChangeKey(v=>v+1);setStreak(r.streak??0);setInGame(r.in_play??0);setMultiplier(r.multiplier??1);
    if(r.result!=='correct'){sounds.fail();setPhrase(phrases.events.fail);setGameOver(true)}else{sounds.success();setPhrase(direction==='timeout'?phrases.events.timeout:getStreakPhrase(r.streak??0))};setTimeLeft(3)}catch{setError('Impossible de jouer.')}finally{setLoading(false)}}

  async function bankMoney(){if(loading||inGame===0)return;setLoading(true);try{sounds.bank();const r=await bankCurrentPot();setBank(r.loot??bank);setInGame(0);setStreak(0);setMultiplier(1);setPhrase('Bien joué. Tu as sécurisé le butin.')}finally{setLoading(false)}}

  async function shareFailure(){const text=`J'ai tenu ${streak} tours sur Luck or Suck et j'ai sécurisé ${bank}. Tu fais mieux ?`;if(navigator.share)await navigator.share({title:'Luck or Suck',text});else await navigator.clipboard?.writeText(text)}

  return <main className={`game ${gameOver?'game-over':''}`}>
    <header><span>EN JEU<br/><strong>{inGame}</strong></span><span>COFFRÉ<br/><strong>{bank}</strong></span></header>
    {!gameOver ? <><p className="phrase">{phrase}</p><div key={changeKey} className={`number pop ${timeLeft===1?'danger':''}`}>{number}</div><div className={`timer ${timeLeft===1?'danger':''}`}>{timeLeft}s</div><div className="streak">Série {streak} · x{multiplier}</div>{error&&<p>{error}</p>}<div className="buttons"><button disabled={loading} onClick={()=>play('lower')}>PLUS BAS</button><button disabled={loading} onClick={()=>play('higher')}>PLUS HAUT</button></div><button className="bank" disabled={loading||inGame===0} onClick={bankMoney}>💰 COFFRER {inGame}</button></> : <section className="result"><p className="phrase">{phrase}</p><div className="number">{previousNumber} → {number}</div><h1>PERDU.</h1><p>COFFRÉ : {bank}</p><button className="bank" onClick={()=>window.location.reload()}>REJOUER</button><button onClick={shareFailure}>PARTAGER MON ÉCHEC</button></section>}
  </main>
}
