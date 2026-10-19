import * as N from './data/names';
import { type Culture } from './data/names';
import { Markov, type Rng, capitalize } from './engine';

const models = new Map<string, Markov>();
const model = (key: string, corpus: readonly string[], order = 2) => {
  let m = models.get(key);
  if (!m) {
    m = new Markov(corpus, order);
    models.set(key, m);
  }
  return m;
};

function palman(rng: Rng): string {
  const given = rng.chance(0.55)
    ? rng.pick(N.PALMAN_GIVEN)
    : (model('pg', N.PALMAN_GIVEN).generate(rng, 3, 7) ?? rng.pick(N.PALMAN_GIVEN));
  const family = rng.chance(0.5)
    ? rng.pick(N.PALMAN_FAMILY)
    : (model('pf', N.PALMAN_FAMILY).generate(rng, 4, 8) ?? rng.pick(N.PALMAN_FAMILY));
  if (rng.chance(0.06)) return `${given} "${rng.pick(N.PALMAN_NICKNAMES)}" ${family}`;
  return `${given} ${family}`;
}

function motavian(rng: Rng): string {
  let core: string;
  if (rng.chance(0.45)) {
    core = model('mc', N.MOTAVIAN_CORPUS).generate(rng, 4, 8) ?? rng.pick(N.MOTAVIAN_CORPUS);
  } else {
    // Bíblia Koliana §15: prefixo (signo) + radical + sufixo (função/honra)
    core = capitalize(`${rng.pick(N.MOTAVIAN_PREFIX)}${rng.pick(N.MOTAVIAN_RADICAL)}`.toLowerCase());
  }
  const suffix = rng.weighted(N.MOTAVIAN_SUFFIX);
  const name = suffix.startsWith('-') ? `${core}${suffix}` : `${core}${suffix}`;
  return rng.chance(0.3) ? `${name} ${rng.pick(N.MOTAVIAN_LINE)}` : name;
}

function kolian(rng: Rng): string {
  // Kol'Zenn: exactly one glottal apostrophe; optional honor ending; caste title sometimes.
  let name = `${rng.pick(N.KOLIAN_SYLLABLE_A)}'${capitalize(rng.pick(N.KOLIAN_SYLLABLE_B))}`;
  if (rng.chance(0.35)) {
    const gen = model('kc', N.KOLIAN_CORPUS).generate(rng, 5, 10, (n) => (n.match(/'/g) ?? []).length !== 1);
    if (gen) name = gen;
  }
  if (rng.chance(0.3)) name = `${name}-${rng.pick(N.KOLIAN_HONOR)}`;
  return rng.chance(0.15) ? `${rng.pick(N.KOLIAN_TITLES)} ${name}` : name;
}

function dezorian(rng: Rng): string {
  const a = model('dz', N.DEZORIAN_CORPUS).generate(rng, 4, 8) ?? rng.pick(N.DEZORIAN_CORPUS);
  // Dezolianos usam o nome do abrigo/vila como segundo nome.
  const home = model('dz', N.DEZORIAN_CORPUS).generate(rng, 4, 8) ?? rng.pick(N.DEZORIAN_CORPUS);
  return rng.chance(0.6) ? `${a} de ${home}` : a;
}

function esper(rng: Rng): string {
  const given = rng.chance(0.4)
    ? rng.pick(N.ESPER_CORPUS)
    : (model('es', N.ESPER_CORPUS).generate(rng, 4, 8) ?? rng.pick(N.ESPER_CORPUS));
  const r = rng.next();
  if (r < 0.4) return `${given} ${rng.pick(N.PALMAN_FAMILY)}`;
  if (r < 0.7) return `${given} ${rng.pick(N.ESPER_EPITHETS)}`;
  return given;
}

function android(rng: Rng): string {
  const code = `${rng.pick(N.ANDROID_PREFIX)}-${rng.int(2, 999)}`;
  return rng.chance(0.6) ? `${rng.pick(N.ANDROID_GIVEN)} (${code})` : code;
}

const BY_CULTURE: Record<Culture, (rng: Rng) => string> = {
  palman: palman,
  motavian: motavian,
  kolian: kolian,
  dezorian: dezorian,
  esper: esper,
  android: android,
};

export function generateName(rng: Rng, culture: Culture): string {
  return BY_CULTURE[culture](rng);
}

/** Rough count of distinct names per culture (shown in the UI). */
export const NAME_SPACE: Record<Culture, string> = {
  palman: `${(N.PALMAN_GIVEN.length * N.PALMAN_FAMILY.length).toLocaleString()}+ combinations, plus generated ones`,
  motavian: `${(N.MOTAVIAN_PREFIX.length * N.MOTAVIAN_RADICAL.length * N.MOTAVIAN_SUFFIX.length).toLocaleString()}+ combinations, plus generated ones`,
  kolian: `${(N.KOLIAN_SYLLABLE_A.length * N.KOLIAN_SYLLABLE_B.length).toLocaleString()}+ combinations, plus generated ones`,
  dezorian: 'generated from the Ankhor corpus',
  esper: 'generated from the Lutz tradition corpus',
  android: 'designations + given names',
};
