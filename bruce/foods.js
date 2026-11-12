/* Bruce's foods: the numbers behind tjuzek.com/bruce/ (unlisted, noindex).
 *
 * This is the only file a routine change touches: a new package label, a new portion, a new
 * food, a new day type. Change it here, then bump `updated`. index.html does the rest.
 *
 * Derivations, assumptions and sources live in ~/claudecode/bruce-diet/README.md (not served).
 *
 * Fields per food (each food has kcalPerG OR kcalPerPiece):
 *   id            stable key, saved in the phone's log; never rename an id that has been used
 *   name          tile label
 *   kcalPerG      kcal per gram AS WEIGHED
 *   portion       weighed foods: standard portion in grams, what one tap on the tile logs
 *   unit          optional name for that portion, e.g. '½ can'
 *   kcalPerPiece  counted foods (treats): kcal per piece
 *   firstTap      counted foods: pieces the first tap of the day logs (tile and plan)
 *   nextTap       counted foods: pieces each later tap adds
 *   flex          true for weighed foods that are easy to adjust; the page turns the kcal left
 *                 today into grams of each of these
 *   short         optional short name for running text (the page is in Dutch, nl-BE)
 *   note          shown in the item's panel
 *
 * The log stores amounts and kcal at the time of logging, so changing a value here does not
 * rewrite past days.
 */
window.BRUCE = {
  updated: '2026-11-12',

  target: 750,     // kcal a day, treats included: the cap, never more
  bandWidth: 50,   // the day should land in the band from (target - 50) to target: 700 to 750
  aimBelow: 10,    // the day planner tops up with the fill food to this far under the cap: 740
  walkKcal: 20,    // kcal added per 15-minute walk (rough estimate, see the README)

  foods: [
    { id: 'kibble', flex: true, name: 'Brokjes', kcalPerG: 2.853, portion: 85,
      note: 'Etiket: 2853 kcal per kg.' },

    { id: 'wet', name: 'Blikvoer', short: 'hondenvoer', kcalPerG: 1.14, portion: 187.1, unit: '½ blik',
      note: 'Etiket: 1140 kcal per kg. Een volledig blik weegt 374,2 g.' },

    { id: 'meat', flex: true, name: 'Ovengebraden vlees', kcalPerG: 1.45, portion: 85,
      note: 'Ovengebraden hondenvlees. Etiket: 1450 kcal per kg.' },

    { id: 'chicken', flex: true, name: 'Kip, gekookt', kcalPerG: 1.2, portion: 100,
      note: 'Kipfilethaasjes van Costco, gekookt in water. Het etiket (100 kcal per 112 g) geldt voor ' +
            'RAUW gewicht; gekookte kip verliest ongeveer een kwart van haar gewicht, dus gekookt is het ' +
            'ongeveer 1,2 kcal per g. Weeg ze gekookt. 100 g gekookt is ongeveer 135 g rauw.' },

    { id: 'veg', name: 'Groentemix, zoutarm', short: 'groentemix', kcalPerG: 0.36, portion: 218.75, unit: '½ blik',
      note: 'Etiket: 45 kcal per portie, 3,5 porties per blik, dus ½ blik is ongeveer 79 kcal. ' +
            'De grammen gaan uit van 125 g per portie (niet nagekeken op het etiket).' },

    { id: 'beans', name: 'Boontjes, zoutarm', short: 'boontjes', kcalPerG: 0.12, portion: 218.75, unit: '½ blik',
      note: 'Groene boontjes. Etiket: 15 kcal per portie, 3,5 porties per blik, dus ½ blik is ongeveer 26 kcal. ' +
            'De grammen gaan uit van 125 g per portie (niet nagekeken op het etiket).' },

    { id: 'treat', name: 'Snoepjes', short: 'snoepjes', kcalPerPiece: 2, firstTap: 10, nextTap: 5,
      note: 'Trainingssnoepjes, 2 kcal per stuk. Een gewone dag is ongeveer 30 stuks (60 kcal), ' +
            'binnen de 750. De eerste keer drukken telt 10 stuks, daarna telkens 5 erbij.' },

    { id: 'corned', flex: true, name: 'Cornedbeef, zoutarm', kcalPerG: 130 / 56, portion: 28,
      note: 'Etiket: 130 kcal per 56 g. 28 g (65 kcal) = ongeveer 45 g ovengebraden vlees of 55 g kip. ' +
            'Zout, dus hou het bij ongeveer 28 g.' }
  ],

  // Given every day, whatever the day type. The ½ cans are not weighed.
  // Each item is { id, g } for weighed foods or { id, pc } for counted ones.
  everyDay: [ { id: 'wet', g: 187.1 }, { id: 'veg', g: 218.75 }, { id: 'beans', g: 218.75 },
              { id: 'treat', pc: 30 } ],

  // Day types. `items` are given in these amounts (adjustable on the page in steps of 5);
  // `fill` is then weighed out to bring the day to (target - aimBelow), i.e. 740 kcal.
  // Every-day items 378 kcal; corned beef day 65 + 58 + kibble ~84 g (741);
  // chicken day 72 + 58 + kibble ~81 g (739). Oven roast 40 g on both days.
  dayTypes: [
    { id: 'corned', name: 'Cornedbeefdag', short: 'cornedbeef', items: [ { id: 'corned', g: 28 }, { id: 'meat', g: 40 } ], fill: 'kibble' },
    { id: 'chicken', name: 'Kipdag', short: 'kip', items: [ { id: 'chicken', g: 60 }, { id: 'meat', g: 40 } ], fill: 'kibble' }
  ]
};
