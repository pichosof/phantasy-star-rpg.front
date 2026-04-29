/**
 * Picho-RPG demo campaign — "The Last Star of Algol".
 *
 * A small but coherent slice of a Phantasy Star–inspired campaign that
 * exercises every read-only screen of the app. Authoring rules:
 *
 *   - All ids are stable so cross-references work (cities ↔ quests, etc.).
 *   - Every entity has visible=true and discovered=true unless we want
 *     to demonstrate the "hidden" affordance — in which case it stays
 *     hidden, the visibility-filter would normally strip it server-side
 *     and we don't expose it via the mocks.
 *   - Dates are real ISO strings so any "createdAt" formatting renders nicely.
 *   - Image URLs that point to unsplash.com hot-link real pictures so the
 *     demo doesn't ship the binary blobs in the bundle.
 */

const NOW = '2026-04-25T18:00:00.000Z';

export const demoWorlds = [
  {
    id: 1,
    name: 'Algol',
    description: 'A trinary star system at the edge of the galaxy: Palma, Motavia and Dezolis.',
    imageUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80',
    imageAlt: 'Star system Algol',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoCities = [
  {
    id: 1,
    name: 'Camineet',
    region: 'Palma',
    description:
      'Capital of Palma. Walled streets, royal guards and the haunting weight of Lassic’s edicts. The campaign begins here — Alis sets out from her family home after Nero’s death.',
    coordinates: '0.32,0.42',
    visible: true,
    discovered: true,
    worldId: 1,
    imageUrl: 'https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=1200&q=80',
    imageAlt: 'Camineet — fortified capital',
    images: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    name: 'Paseo',
    region: 'Motavia',
    description:
      'A desert oasis ruled by tradesmen and machine-priests. The Hapsby workshops repair anything mechanical — for the right price.',
    coordinates: '0.55,0.55',
    visible: true,
    discovered: true,
    worldId: 1,
    imageUrl: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200&q=80',
    imageAlt: 'Paseo — desert oasis',
    images: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    name: 'Skure',
    region: 'Dezolis',
    description:
      'A reclusive mountain town frozen most of the year. Its people speak little of the ruined ice castles to the north.',
    coordinates: '0.72,0.30',
    visible: true,
    discovered: true,
    worldId: 1,
    imageUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200&q=80',
    imageAlt: 'Skure — frozen mountain town',
    images: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 4,
    name: 'Esper Mansion',
    region: 'Hidden',
    description:
      'A sanctum hidden between dimensions, home to the last surviving Espers. Reaching it requires the Roadpass and a guide.',
    coordinates: '0.45,0.18',
    visible: true,
    discovered: true,
    worldId: 1,
    imageUrl: 'https://images.unsplash.com/photo-1528913775512-624d24b27b96?w=1200&q=80',
    imageAlt: 'Esper Mansion',
    images: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoDungeons = [
  {
    id: 1,
    name: 'Medusa’s Tower',
    type: 'tower',
    description:
      'A four-floor tower outside Camineet where Medusa was sealed by ancient priests. Her gaze still petrifies the unprepared.',
    cityId: 1,
    visible: true,
    discovered: true,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
    imageAlt: 'Medusa’s Tower',
    images: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    name: 'Frozen Ruins',
    type: 'ruin',
    description:
      'Crumbling walls of a pre-Lassic citadel buried under perpetual snow north of Skure. Old esper writings line the walls.',
    cityId: 3,
    visible: true,
    discovered: true,
    imageUrl: 'https://images.unsplash.com/photo-1609081144055-a36b56f4f4d7?w=1200&q=80',
    imageAlt: 'Frozen Ruins',
    images: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    name: 'Air Castle',
    type: 'fortress',
    description: 'Lassic’s flying fortress — visible only to those who have read the Esper Code. The final dungeon.',
    cityId: null,
    visible: true,
    discovered: true,
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80',
    imageAlt: 'Air Castle',
    images: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoNpcs = [
  {
    id: 1,
    name: 'Alis Landale',
    role: 'Protagonist',
    location: 'Camineet',
    cityId: 1,
    description:
      'A young woman from a noble family in Camineet. After her brother Nero is murdered by Lassic’s agents she swears revenge and leaves home.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1520975661595-6453be3f7070?w=800&q=80',
    imageAlt: 'Alis Landale',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    name: 'Lutz',
    role: 'Esper sage',
    location: 'Esper Mansion',
    cityId: 4,
    description: 'The last apprentice of the Esper Mansion. Wields ancient magic but trusts strangers slowly.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80',
    imageAlt: 'Lutz, Esper sage',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    name: 'Odin',
    role: 'Frozen warrior',
    location: 'Skure',
    cityId: 3,
    description: 'A warrior turned to stone by Medusa years ago. The party finds him in the Frozen Ruins.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1542372147193-a7aca54189cd?w=800&q=80',
    imageAlt: 'Odin',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 4,
    name: 'Noah',
    role: 'Apprentice mage',
    location: 'Camineet',
    cityId: 1,
    description: 'A novice mage with an unusual affinity for ice. Helps Alis decipher esper artifacts.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80',
    imageAlt: 'Noah',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 5,
    name: 'Hapsby',
    role: 'Engineer-priest',
    location: 'Paseo',
    cityId: 2,
    description: 'Leader of the Hapsby workshop. Speaks in gear ratios and trades favours for spare parts.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1546961342-0d34cba65b86?w=800&q=80',
    imageAlt: 'Hapsby',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 6,
    name: 'Tajim',
    role: 'Apothecary',
    location: 'Camineet',
    cityId: 1,
    description: 'Locked in the Camineet dungeons by Lassic’s soldiers for selling banned remedies.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1542728143-d9b53b8f6d4f?w=800&q=80',
    imageAlt: 'Tajim',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 7,
    name: 'Nero',
    role: 'Fallen brother',
    location: 'Camineet',
    cityId: 1,
    description: 'Alis’s older brother. Murdered shortly before the campaign begins; the catalyst of her journey.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
    imageAlt: 'Nero',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoMonsters = [
  {
    id: 1,
    name: 'Sand Worm',
    description: 'Burrows under Motavia dunes. Surprises caravans by erupting from below.',
    discovered: true,
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1597007029837-39d09a3aab9c?w=800&q=80',
    imageAlt: 'Sand Worm',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    name: 'Frost Wyvern',
    description: 'Glides across the Skure peaks. Its breath freezes shields solid.',
    discovered: true,
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1577719098060-7894e7b1d8b8?w=800&q=80',
    imageAlt: 'Frost Wyvern',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    name: 'Wing Eye',
    description: 'A floating eye ringed in feathered wings. Locks gazes; one blink and you forget your own name.',
    discovered: true,
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1518384401463-d3876163c195?w=800&q=80',
    imageAlt: 'Wing Eye',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 4,
    name: 'Owl Bear',
    description: 'A surly hybrid haunting Palma’s western forests. Hates the sound of bells.',
    discovered: true,
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1455156218388-5e61b526818b?w=800&q=80',
    imageAlt: 'Owl Bear',
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 5,
    name: 'Robotcop',
    description:
      'A patrol unit retasked by Lassic’s engineers. Bullets ricochet off its plating; it answers questions in monotone.',
    discovered: true,
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80',
    imageAlt: 'Robotcop',
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoQuests = [
  {
    id: 1,
    title: 'The Lost Roadpass',
    status: 'active',
    description:
      'A merchant in Paseo lost the talisman that opens the path between worlds. Recover it before the next sandstorm.',
    reward: '300 mesetas + a ride from the Hapsby airship',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
    cityIds: [2],
  },
  {
    id: 2,
    title: 'Free Tajim',
    status: 'completed',
    description: 'Bribe a guard or sneak through the cellars to free the apothecary Tajim from the Camineet dungeons.',
    reward: 'Antidote recipe',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
    cityIds: [1],
  },
  {
    id: 3,
    title: 'Defeat Medusa',
    status: 'completed',
    description: 'Reach the top floor of Medusa’s Tower and end her reign of stone.',
    reward: 'Mirror Shield (artifact)',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
    cityIds: [1],
  },
  {
    id: 4,
    title: 'Find the Esper Mansion',
    status: 'active',
    description: 'Cross-reference esper writings between Skure ruins and Camineet archives to locate the Mansion.',
    reward: 'Lutz joins the party',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
    cityIds: [1, 3],
  },
  {
    id: 5,
    title: 'Save Algol from Lassic',
    status: 'active',
    description: 'The headline arc — bring down Lassic’s Air Castle and free the trinary system.',
    reward: 'A new dawn',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
    cityIds: [1, 2, 3, 4],
  },
];

export const demoSessions = [
  {
    id: 1,
    title: 'First steps in Camineet',
    description:
      'The party meets Alis the day after Nero’s funeral. A guard chases them through the bazaar and Tajim is arrested.',
    sessionDate: '2026-03-04T19:00:00.000Z',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    title: 'Crossing the desert to Paseo',
    description:
      'Sand Worms swallow the caravan at dusk. Hapsby trades a damaged airbike for a story Alis never wanted to tell.',
    sessionDate: '2026-03-11T19:00:00.000Z',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    title: 'Frozen north',
    description: 'Skure refuses outsiders until the party returns from the Frozen Ruins with proof of the Esper Code.',
    sessionDate: '2026-03-18T19:00:00.000Z',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 4,
    title: 'Battle at Medusa’s Tower',
    description: 'Three rounds of stone-eyed dread; Odin shatters back to flesh as the gorgon falls.',
    sessionDate: '2026-03-25T19:00:00.000Z',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoTimeline = [
  {
    id: 1,
    title: 'The Espers retreat',
    eventDate: '0024-04-12',
    description: 'After Lassic’s rise the Espers seal their Mansion outside ordinary space.',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    title: 'Lassic crowns himself',
    eventDate: '1984-06-01',
    description: 'King Lassic declares dark dominion over Algol. Religion of the new gods becomes mandatory.',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    title: 'Nero killed',
    eventDate: '2025-12-30',
    description: 'Lassic’s soldiers ambush Nero on the Camineet outer road.',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 4,
    title: 'Alis leaves home',
    eventDate: '2026-01-08',
    description: 'Alis sets out for Paseo with Nero’s sword and a single coin.',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 5,
    title: 'Medusa defeated',
    eventDate: '2026-03-25',
    description: 'The Mirror Shield is recovered. Odin returns from stone.',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 6,
    title: 'Roadpass recovered',
    eventDate: '2026-04-04',
    description: 'The Hapsby workshop is paid in full and the path to Esper Mansion opens.',
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoLores = [
  {
    id: 1,
    title: 'Foundation of Camineet',
    category: 'history',
    content:
      '## Foundation of Camineet\n\nFounded by the Landale family three centuries before Lassic’s rise. The original walls still stand around the inner district.\n\n- Built atop a pre-Esper temple complex.\n- The Landale crest features a single star and a feather.\n- Population doubled when Paseo refugees arrived after the desert wars.',
    pinned: true,
    visible: true,
    cityIds: [1],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    title: 'The Esper Code',
    category: 'magic',
    content:
      '## The Esper Code\n\nA branching grammar of glyphs that binds intent to motion. Two lines:\n\n1. **Inner Code** — used by espers themselves; impossible to teach without rebirth.\n2. **Outer Code** — fragments survive in Skure’s ruins and the Camineet archives. Reading both halves opens the way to the Mansion.',
    pinned: false,
    visible: true,
    cityIds: [3, 4],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    title: 'Skure isolationism',
    category: 'culture',
    content:
      '## Skure isolationism\n\nFor the past two generations Skure has refused trade with the southern cities. The town elders blame an old pact with the Frozen Wyverns of the high peaks.',
    pinned: false,
    visible: true,
    cityIds: [3],
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 4,
    title: 'Lassic’s prophecy',
    category: 'religion',
    content:
      '## Lassic’s prophecy\n\nA cipher recovered from the Air Castle predicts that *"the last star of Algol shall sing the king to dust"*. Whoever decodes it must speak it aloud at the end of the third moon.',
    pinned: false,
    visible: true,
    cityIds: [],
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoWiki = [
  {
    id: 1,
    title: 'About Algol',
    category: 'overview',
    content:
      '# About Algol\n\nAlgol is a trinary star system: Palma, Motavia and Dezolis. Each planet has its own dominant culture and language. Travel between them was lost when Lassic seized the Roadpass.\n\n## Quick facts\n\n- **Capital**: Camineet (Palma)\n- **Native faith**: The Three Sisters (replaced by Lassic’s pantheon)\n- **Lingua franca**: Camish, slowly being supplanted by the Hapsby cant',
    pinned: true,
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    title: 'Magic systems',
    category: 'rules',
    content:
      '# Magic systems\n\nThis campaign uses a **simplified GURPS** spell list with three schools.\n\n| School    | Source     | Cost              |\n| --------- | ---------- | ----------------- |\n| Esper     | Innate     | FP per spell      |\n| Tek       | Tools      | Mesetas per shot  |\n| Faith     | Devotion   | None, but slow    |',
    pinned: true,
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    title: 'Bestiary glossary',
    category: 'reference',
    content:
      '# Bestiary glossary\n\nNames you’ll hear at the table:\n\n- **Owl Bear** — “oldbear” in cant.\n- **Sand Worm** — “dust kraken” in Paseo slang.\n- **Frost Wyvern** — locals call them “sky lions.”',
    pinned: false,
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 4,
    title: 'Lassic — the dark king',
    category: 'antagonist',
    content:
      '# Lassic\n\n> "I have not silenced the Three Sisters. I have replaced them."\n\n## Profile\n\n- **Race**: Human (transformed)\n- **Seat**: Air Castle (Palma orbit)\n- **Powers**: Anti-Esper field, command of all Robotcops, prolonged life via Esper sacrifice.\n\nDefeating him is the campaign’s endgame.',
    pinned: false,
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoPlayers = [
  {
    id: 1,
    name: 'Alis (PC)',
    level: 6,
    background: 'Camineet noble. Sword-and-board. Has taken vows over Nero’s grave.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&q=80',
    imageAlt: 'Alis (PC)',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    name: 'Noah (PC)',
    level: 4,
    background: 'Apprentice mage. Curious to a fault. Travels with a small notebook of tek schematics.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1543132220-3ec99c6094dc?w=800&q=80',
    imageAlt: 'Noah (PC)',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    name: 'Odin (PC)',
    level: 7,
    background: 'Stone-stiff for years. Recovered from Medusa’s Tower. Grumbles in old Skuran.',
    visible: true,
    imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80',
    imageAlt: 'Odin (PC)',
    sheetUrl: null,
    sheetMime: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export const demoTags = [
  { id: 1, name: 'main-arc', color: '#dc4446', createdAt: NOW, updatedAt: NOW },
  { id: 2, name: 'side-quest', color: '#7d56f4', createdAt: NOW, updatedAt: NOW },
  { id: 3, name: 'palma', color: '#1677ff', createdAt: NOW, updatedAt: NOW },
  { id: 4, name: 'motavia', color: '#fa8c16', createdAt: NOW, updatedAt: NOW },
  { id: 5, name: 'dezolis', color: '#13c2c2', createdAt: NOW, updatedAt: NOW },
];

/**
 * Single source of truth for which tags are attached to which entities.
 * `mockApi.ts` derives both `/api/tags/:id/entities` and
 * `/api/entity-tags/:type/:id` from this list.
 */
export type DemoTagLinkType = 'beast' | 'npc' | 'city' | 'dungeon' | 'world' | 'player' | 'lore' | 'quest';

export const demoTagLinks: Array<{ tagId: number; type: DemoTagLinkType; entityId: number }> = [
  // main-arc (1) — heroes, the headline quests, the final dungeon and the hidden mansion
  { tagId: 1, type: 'npc', entityId: 1 }, // Alis
  { tagId: 1, type: 'npc', entityId: 2 }, // Lutz
  { tagId: 1, type: 'npc', entityId: 3 }, // Odin
  { tagId: 1, type: 'quest', entityId: 4 }, // Find the Esper Mansion
  { tagId: 1, type: 'quest', entityId: 5 }, // Save Algol from Lassic
  { tagId: 1, type: 'dungeon', entityId: 3 }, // Air Castle
  { tagId: 1, type: 'city', entityId: 4 }, // Esper Mansion
  { tagId: 1, type: 'lore', entityId: 4 }, // Lassic's prophecy

  // side-quest (2) — Camineet detours and a dungeon detour on Palma
  { tagId: 2, type: 'npc', entityId: 5 }, // Hapsby
  { tagId: 2, type: 'npc', entityId: 6 }, // Tajim
  { tagId: 2, type: 'quest', entityId: 1 }, // The Lost Roadpass
  { tagId: 2, type: 'quest', entityId: 2 }, // Free Tajim
  { tagId: 2, type: 'quest', entityId: 3 }, // Defeat Medusa
  { tagId: 2, type: 'dungeon', entityId: 1 }, // Medusa's Tower

  // palma (3) — everything anchored to Palma
  { tagId: 3, type: 'world', entityId: 1 }, // Algol (where Palma lives)
  { tagId: 3, type: 'city', entityId: 1 }, // Camineet
  { tagId: 3, type: 'dungeon', entityId: 1 }, // Medusa's Tower
  { tagId: 3, type: 'npc', entityId: 1 }, // Alis
  { tagId: 3, type: 'npc', entityId: 4 }, // Noah
  { tagId: 3, type: 'npc', entityId: 6 }, // Tajim
  { tagId: 3, type: 'npc', entityId: 7 }, // Nero
  { tagId: 3, type: 'beast', entityId: 4 }, // Owl Bear
  { tagId: 3, type: 'beast', entityId: 5 }, // Robotcop
  { tagId: 3, type: 'lore', entityId: 1 }, // Foundation of Camineet

  // motavia (4) — desert oasis world
  { tagId: 4, type: 'city', entityId: 2 }, // Paseo
  { tagId: 4, type: 'npc', entityId: 5 }, // Hapsby
  { tagId: 4, type: 'beast', entityId: 1 }, // Sand Worm
  { tagId: 4, type: 'beast', entityId: 3 }, // Wing Eye

  // dezolis (5) — frozen world
  { tagId: 5, type: 'city', entityId: 3 }, // Skure
  { tagId: 5, type: 'dungeon', entityId: 2 }, // Frozen Ruins
  { tagId: 5, type: 'npc', entityId: 3 }, // Odin
  { tagId: 5, type: 'beast', entityId: 2 }, // Frost Wyvern
  { tagId: 5, type: 'lore', entityId: 3 }, // Skure isolationism
  { tagId: 5, type: 'lore', entityId: 2 }, // The Esper Code
];

export const demoMapMarkers = [
  { id: 1, type: 'city' as const, refId: 1, x: 0.32, y: 0.42, name: 'Camineet' },
  { id: 2, type: 'city' as const, refId: 2, x: 0.55, y: 0.55, name: 'Paseo' },
  { id: 3, type: 'city' as const, refId: 3, x: 0.72, y: 0.3, name: 'Skure' },
  { id: 4, type: 'city' as const, refId: 4, x: 0.45, y: 0.18, name: 'Esper Mansion' },
  { id: 5, type: 'dungeon' as const, refId: 1, x: 0.34, y: 0.46, name: 'Medusa’s Tower' },
  { id: 6, type: 'dungeon' as const, refId: 2, x: 0.74, y: 0.27, name: 'Frozen Ruins' },
  { id: 7, type: 'dungeon' as const, refId: 3, x: 0.49, y: 0.14, name: 'Air Castle' },
];

export const demoLibraryDocs = [
  {
    id: 1,
    title: 'Picho-RPG — Player Quick Reference',
    description: 'A short PDF cheat-sheet you’d hand a new player at the table.',
    category: 'reference',
    filename: 'picho-quick-reference.pdf',
    originalName: 'picho-quick-reference.pdf',
    url: 'demo-files/picho-quick-reference.pdf',
    mime: 'application/pdf',
    size: 32 * 1024,
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    title: 'Algol Gazetteer',
    description: 'A short DOCX setting bible covering Palma, Motavia and Dezolis.',
    category: 'reference',
    filename: 'algol-gazetteer.docx',
    originalName: 'algol-gazetteer.docx',
    url: 'demo-files/algol-gazetteer.docx',
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 18 * 1024,
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    title: 'Loot tables',
    description: 'A CSV with monster drops and shop inventories.',
    category: 'reference',
    filename: 'loot-tables.csv',
    originalName: 'loot-tables.csv',
    url: 'demo-files/loot-tables.csv',
    mime: 'text/csv',
    size: 2 * 1024,
    visible: true,
    createdAt: NOW,
    updatedAt: NOW,
  },
];
