/**
 * Encounters. Starfinder 1e (Core Rulebook, ch. 11): XP by CR and difficulty = CR relative to the
 * party's average level (APL). Habitats from the Bíblia de Biodiversidade de Motávia and the
 * Bestiário de Motávia AW 2284; SEED creatures only in bloom/eldritch zones and installations.
 */

export const XP_BY_CR: Record<string, number> = {
  '1/8': 50,
  '1/6': 65,
  '1/4': 100,
  '1/3': 135,
  '1/2': 200,
  '1': 400,
  '2': 600,
  '3': 800,
  '4': 1200,
  '5': 1600,
  '6': 2400,
  '7': 3200,
  '8': 4800,
  '9': 6400,
  '10': 9600,
  '11': 12800,
  '12': 19200,
  '13': 25600,
  '14': 38400,
  '15': 51200,
  '16': 76800,
  '17': 102400,
  '18': 153600,
  '19': 204800,
  '20': 307200,
  '21': 409600,
  '22': 614400,
  '23': 819200,
  '24': 1228800,
  '25': 1638400,
};

export const crValue = (cr: string) => (cr.includes('/') ? 1 / Number(cr.split('/')[1]) : Number(cr));

/** XP of an encounter whose CR is `cr` (fractions allowed). */
export function xpForCr(cr: number): number {
  if (cr < 1) {
    const key = Object.keys(XP_BY_CR).find((k) => Math.abs(crValue(k) - cr) < 0.02);
    return key ? XP_BY_CR[key] : 200;
  }
  return XP_BY_CR[String(Math.min(25, Math.round(cr)))] ?? 0;
}

export const DIFFICULTY = [
  { key: 'easy', label: 'Easy', delta: -1 },
  { key: 'average', label: 'Average', delta: 0 },
  { key: 'challenging', label: 'Challenging', delta: 1 },
  { key: 'hard', label: 'Hard', delta: 2 },
  { key: 'epic', label: 'Epic', delta: 3 },
] as const;

export type Biome =
  | 'Dunas Vivas'
  | 'Planícies de Cascalho e Sal'
  | 'Corredores Verdes Degradados'
  | 'Oásis Perfeitos'
  | 'Cânions e Ruínas Climáticas'
  | 'Submundo de Aquíferos'
  | 'Zonas Bloom do Seed'
  | 'Instalação SEED'
  | 'Zonas Eldritch Corrompidas'
  | 'Rota de caravana';

/** Bestiary species (names as in the bestiary) per biome, with relative frequency. */
export const BIOME_CREATURES: Record<Biome, readonly (readonly [string, number])[]> = {
  'Dunas Vivas': [
    ['Aranha-Leão', 4],
    ['Sink-Beetle', 4],
    ['Dune-Hopper', 2],
    ['Skelgra Jackal-Bug', 1],
  ],
  'Planícies de Cascalho e Sal': [
    ['Zerrak Mantis', 4],
    ['Krupp-Beetle', 2],
    ['Sky-Hooker', 2],
    ['Skelgra Jackal-Bug', 2],
  ],
  'Corredores Verdes Degradados': [
    ['Mirage Wasp', 4],
    ['Night-Moth Swarm', 3],
    ['Sila-Weaver', 2],
    ['Duh-Ant', 2],
  ],
  'Oásis Perfeitos': [
    ['Mirage Wasp', 3],
    ['Sila-Weaver', 3],
    ['Aranha-Leão', 2],
    ['Sky-Hooker', 1],
  ],
  'Cânions e Ruínas Climáticas': [
    ['Skelgra Jackal-Bug', 4],
    ['Razor-Centipede', 3],
    ['Sky-Hooker', 3],
    ['Duh-Ant', 2],
    ['Stone-Roach', 2],
    ['Zerrak Mantis', 2],
  ],
  'Submundo de Aquíferos': [
    ['Razor-Centipede', 3],
    ['Stone-Roach', 2],
    ['Depcen', 1],
    ['Ismounos', 1],
  ],
  'Zonas Bloom do Seed': [
    ['Flatterplant', 3],
    ['Flyscreamer', 2],
    ['Toadstool', 3],
    ['Shrieker', 2],
    ['Monsterfly', 3],
    ['Forced Fly', 2],
    ['Blob', 2],
    ['Meta Slug', 1],
  ],
  'Instalação SEED': [
    ['Xanafalgue', 4],
    ['Igglanova', 2],
    ['Zoran Bult', 2],
    ['Gicefalgue', 2],
    ['Guilgenova', 1],
    ['Zoran Bult Exarca', 1],
    ['Blob', 2],
    ['Fract Ooze', 1],
    ['Ismounos', 1],
    ['Depcen', 1],
    ['Tech Plant', 1],
  ],
  'Zonas Eldritch Corrompidas': [
    ['Gicefalgue', 2],
    ['Shrieker', 2],
    ['Flyscreamer', 2],
    ['Helex', 1],
    ['Monsterfly', 2],
  ],
  'Rota de caravana': [
    ['Skelgra Jackal-Bug', 3],
    ['Sky-Hooker', 3],
    ['Aranha-Leão', 2],
    ['Sink-Beetle', 2],
    ['Zerrak Mantis', 1],
    ['Mirage Wasp', 1],
  ],
};

/** Packs: species that show up in groups (bestiary notes: bands of 3–8, swarms, colonies). */
export const PACK_SPECIES = new Set([
  'Skelgra Jackal-Bug',
  'Duh-Ant',
  'Mirage Wasp',
  'Xanafalgue',
  'Monsterfly',
  'Blob',
  'Dune-Hopper',
  'Stone-Roach',
]);

const lines = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

export const TERRAIN: Record<Biome, string[]> = {
  'Dunas Vivas': lines(`
    Areia fofa: terreno difícil e risco de funil de Sink-Beetle.
    Crista de duna: quem estiver no alto tem visão longa, mas fica exposto.
    Vibração no solo denuncia passos pesados (Krupp).
  `),
  'Planícies de Cascalho e Sal': lines(`
    Cascalho solto: Acrobatics CD 12 para correr sem cair.
    Crosta de sal reflete o sol: ofuscamento ao meio-dia.
    Sem cobertura por centenas de metros.
  `),
  'Corredores Verdes Degradados': lines(`
    Vegetação densa: ocultação a 9 m.
    Canal de irrigação antigo, meio cheio de lodo (febre de lodo).
    Bombas antigas ainda funcionam e fazem barulho.
  `),
  'Oásis Perfeitos': lines(`
    Água limpa demais: um sistema antigo ainda regula o clima.
    Tabu local: os moradores não chegam perto.
    Névoa leve pela manhã cobre o chão.
  `),
  'Cânions e Ruínas Climáticas': lines(`
    Paredões com colmeias: barulho atrai atenção.
    Ruínas servem de cobertura e de emboscada.
    Passagem estreita: só dois lado a lado.
  `),
  'Submundo de Aquíferos': lines(`
    Escuro total fora da luz das lanternas.
    Rio subterrâneo com correnteza (Athletics CD 15).
    Glow-mussels apagados indicam água contaminada.
  `),
  'Zonas Bloom do Seed': lines(`
    Esporos no ar: Fortitude CD 12 ou enjoado por 1 rodada.
    Plantas que se movem quando ninguém olha.
    Chão de micélio que amortece passos (furtividade fácil, para ambos os lados).
  `),
  'Instalação SEED': lines(`
    Corredores com luz de emergência piscando.
    Tanques de cultivo, alguns ainda ocupados.
    Portas automáticas que fecham sozinhas.
  `),
  'Zonas Eldritch Corrompidas': lines(`
    Silêncio anormal: nenhum animal por perto.
    Estruturas que parecem vivas e "observam".
    Bússolas e rotas falham.
  `),
  'Rota de caravana': lines(`
    Caravana em fila: proteger os Krupp é parte do combate.
    Carga espalhada serve de cobertura.
    Poeira levantada pelo combate reduz a visão.
  `),
};

export const WEATHER = lines(`
  Céu amarelado e limpo, calor forte.
  Vento constante carregando areia fina.
  Tempestade de areia se aproximando (1d4 horas).
  Fim de tarde: sombras longas, temperatura caindo.
  Noite fria e sem lua; só as estrelas.
  Calor parado e silêncio.
`);

export const REASONS = lines(`
  caçando, estão famintos
  defendendo um ninho próximo
  foram expulsos do território por algo maior
  seguem o cheiro de uma carga de carne de Krupp
  atraídos por luz ou barulho do grupo
  feridos e acuados
  migrando e cruzando a rota por acaso
  protegendo uma carcaça recente
`);
