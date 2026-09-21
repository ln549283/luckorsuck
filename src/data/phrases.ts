export const phrases = {
  intro: [
    'Prêt à tenter ta chance ?',
    'Trois secondes. Pas une de plus.'
  ],
  streak: {
    3: [
      'Ok... ça passe.',
      'Tu commences à y croire ?'
    ],
    5: [
      'On commence à te regarder bizarrement.',
      'La chance commence à prendre ton parti.'
    ],
    10: [
      'Personne ne comprend encore ce qui se passe.',
      'Tu joues ou tu as piraté le hasard ?'
    ],
    15: [
      'Là, même toi tu devrais coffrer.',
      'La banque commence à transpirer.'
    ],
    20: [
      'PUTAIN. Il va vraiment continuer.',
      'Ok. Là ça devient ridicule.'
    ]
  },
  events: {
    impossible: 'Sur 14 563 210 parties, personne n\'avait vu ça.',
    timeout: 'TROP LENT. Le chrono t\'a mangé.',
    fail: 'La chance vient de te gifler.'
  }
} as const;
