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
 *   tapPieces     counted foods: pieces that one tap on the tile logs
 *   flex          true for weighed foods that are easy to adjust; the page turns the kcal left
 *                 today into grams of each of these
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
    { id: 'kibble', flex: true, name: 'Kibble', kcalPerG: 2.853, portion: 85,
      note: 'Label: 2853 kcal per kg.' },

    { id: 'wet', name: 'Canned dog food', kcalPerG: 1.14, portion: 187.1, unit: '½ can',
      note: 'Label: 1140 kcal per kg. A whole can is 374.2 g.' },

    { id: 'meat', flex: true, name: 'Oven-roasted dog meat', kcalPerG: 1.45, portion: 85,
      note: 'Label: 1450 kcal per kg.' },

    { id: 'chicken', flex: true, name: 'Chicken, boiled', kcalPerG: 1.2, portion: 100,
      note: 'Costco tenderloins, boiled in water. The label (100 kcal per 112 g) is for RAW weight; ' +
            'boiled chicken loses about a quarter of its weight, so cooked is about 1.2 kcal per g. ' +
            'Weigh it cooked. 100 g cooked is about 135 g raw.' },

    { id: 'veg', name: 'Mixed veg, low sodium', kcalPerG: 0.36, portion: 218.75, unit: '½ can',
      note: 'Label: 45 kcal per serving, 3.5 servings per can, so ½ can is about 79 kcal. ' +
            'Grams assume 125 g per serving (not checked on the label).' },

    { id: 'beans', name: 'Green beans, low sodium', kcalPerG: 0.12, portion: 218.75, unit: '½ can',
      note: 'Label: 15 kcal per serving, 3.5 servings per can, so ½ can is about 26 kcal. ' +
            'Grams assume 125 g per serving (not checked on the label).' },

    { id: 'treat', name: 'Treats', kcalPerPiece: 2, tapPieces: 10,
      note: 'Training treats, 2 kcal per piece. A normal day is about 30 pieces (60 kcal), ' +
            'inside the 750. One tap on the tile logs a handful of 10.' },

    { id: 'corned', flex: true, name: 'Corned beef, low sodium', kcalPerG: 130 / 56, portion: 28,
      note: 'Label: 130 kcal per 56 g. 28 g (65 kcal) = about 45 g dog meat or 55 g chicken. ' +
            'Salty, so keep it to about 28 g.' }
  ],

  // Given every day, whatever the day type. The ½ cans are not weighed.
  // Each item is { id, g } for weighed foods or { id, pc } for counted ones.
  everyDay: [ { id: 'wet', g: 187.1 }, { id: 'veg', g: 218.75 }, { id: 'beans', g: 218.75 },
              { id: 'treat', pc: 30 } ],

  // Day types. `items` are given in these amounts (adjustable on the page in steps of 5);
  // `fill` is then weighed out to bring the day to (target - aimBelow), i.e. 740 kcal.
  // Every-day items 378 kcal; corned beef day 65 + 58 + kibble ~84 g; chicken day 120 + kibble ~85 g.
  dayTypes: [
    { id: 'corned', name: 'Corned beef day', items: [ { id: 'corned', g: 28 }, { id: 'meat', g: 40 } ], fill: 'kibble' },
    { id: 'chicken', name: 'Chicken day', items: [ { id: 'chicken', g: 100 } ], fill: 'kibble' }
  ]
};
