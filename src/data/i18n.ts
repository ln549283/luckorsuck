export type Language = 'fr' | 'en';

export const copy = {
  fr: {
    subtitle: 'Teste ta chance. Ou fais-toi humilier.',
    play: 'JOUER',
    best: 'MEILLEURE SÉRIE DU JOUR',
    soundOn: 'SON ON',
    soundOff: 'SON OFF',
    inPlay: 'EN JEU',
    loot: 'BUTIN',
    streak: 'Série',
    lower: 'PAIR',
    higher: 'IMPAIR',
    bank: 'COFFRER',
    lost: 'PERDU.',
    replay: 'REJOUER',
    share: 'PARTAGER MON ÉCHEC',
    connection: 'Connexion impossible.',
    playError: 'Impossible de jouer.',
    banked: 'C’est coffré. Maintenant recommence à faire le malin.',
    copied: 'Copié. Va provoquer tes potes.',
    intro: [
      'Trois secondes. Pas une de plus.',
      'Pair ou impair. Trois secondes. Choisis.',
      'La chance est prête. Toi, moins sûr.'
    ],
    streakPhrases: {
      0: ['Allez. Fais pas semblant de réfléchir.', 'Ça commence maintenant.'],
      3: ['Mouais.', 'Tu commences à y croire ?', 'Ok. Ça passe.'],
      5: ['Là, ça devient intéressant.', 'Toujours vivant ?', 'Tu t’enflammes un peu.'],
      8: ['Toujours de la chance.', 'Tu vas vraiment continuer ?', 'Ça sent la mauvaise décision.'],
      10: ['Ok… là c’est suspect.', 'Tu triches ou quoi ?', 'Le hasard commence à avoir un problème avec toi.'],
      15: ['COFFRE. Sérieusement.', 'Même ton banquier commence à stresser.', 'Là tu joues avec l’argent du patron.'],
      20: ['Mais t’es encore là ?', 'Non mais attends…', 'Ça devient obscène.'],
      30: ['OH PUTAIN, IL VA PÉTER LA BANQUE !', 'J’arrête de parler. Continue.', 'Là, personne va te croire.']
    },
    fail: [
      'Évidemment.',
      'T’avais qu’à coffrer.',
      'Tout ça pour ça.',
      'La cupidité gagne encore.',
      'Tu savais.'
    ],
    timeout: [
      'TROP LENT.',
      'Fallait choisir.',
      'Tu comptais négocier avec le chrono ?'
    ],
    obviousWin: [
      'Fallait pas être Einstein.',
      'Même mon grille-pain aurait cliqué.',
      'Un choix audacieux. Enfin non.'
    ],
    obviousFail: [
      'C’était du 50/50. Et pourtant.',
      'Une chance sur deux. Raté.',
      'Le hasard vient de te prendre pour cible.'
    ],
    brutal: [
      'Sur 14 563 210 parties, j’avais jamais vu ça.',
      'Le hasard vient de te gifler.',
      'Même moi j’y croyais pas.'
    ]
  },
  en: {
    subtitle: 'Test your luck. Or get humbled.',
    play: 'PLAY',
    best: 'TODAY’S BEST STREAK',
    soundOn: 'SOUND ON',
    soundOff: 'SOUND OFF',
    inPlay: 'ON THE LINE',
    loot: 'LOOT',
    streak: 'Streak',
    lower: 'EVEN',
    higher: 'ODD',
    bank: 'BANK IT',
    lost: 'YOU LOST.',
    replay: 'AGAIN',
    share: 'SHARE MY FAILURE',
    connection: 'Connection failed.',
    playError: 'Could not play this turn.',
    banked: 'Banked. Now go make another bad decision.',
    copied: 'Copied. Go annoy your friends.',
    intro: [
      'Three seconds. Don’t waste them.',
      'Even or odd. Three seconds. Pick.',
      'Luck is ready. You? Debatable.'
    ],
    streakPhrases: {
      0: ['Go on. Pretend you’re thinking.', 'Here we go.'],
      3: ['Meh.', 'Starting to believe in yourself?', 'Okay. That worked.'],
      5: ['Now it gets interesting.', 'Still alive?', 'You’re getting cocky.'],
      8: ['Still luck.', 'You’re really going again?', 'This smells like a bad decision.'],
      10: ['Okay… that’s suspicious.', 'Are you cheating?', 'Luck has a problem with you now.'],
      15: ['BANK IT. Seriously.', 'Even your banker is sweating.', 'You’re playing with house money now.'],
      20: ['You’re STILL here?', 'Hold on…', 'This is getting obscene.'],
      30: ['HOLY SHIT, HE’S GONNA BREAK THE BANK!', 'I’m done talking. Keep going.', 'Nobody’s going to believe this.']
    },
    fail: [
      'Of course.',
      'Should’ve banked it.',
      'All that for this.',
      'Greed wins again.',
      'You knew.'
    ],
    timeout: [
      'TOO SLOW.',
      'You had one job.',
      'Were you negotiating with the timer?'
    ],
    obviousWin: [
      'Didn’t take Einstein.',
      'My toaster could’ve picked that.',
      'Bold choice. Actually, no.'
    ],
    obviousFail: [
      'It was 50/50. And yet.',
      'One chance in two. Missed.',
      'Luck just picked you as a target.'
    ],
    brutal: [
      'In 14,563,210 games, I’ve never seen that.',
      'Luck just slapped you.',
      'Even I didn’t believe that could happen.'
    ]
  }
} as const;
