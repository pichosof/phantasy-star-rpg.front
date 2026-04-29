/**
 * Demo API mock layer.
 *
 * Installs `axios-mock-adapter` over the shared `http` instance and registers
 * read-only handlers for every endpoint the player UI calls.
 *
 * Mutating endpoints (POST/PATCH/DELETE) are intentionally NOT mocked — the
 * read-only demo never reaches them because GM mode is forced off in
 * `useGMMode`. If a stray write attempt happens it 405s, which surfaces as a
 * notification to the user.
 */
import type { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {
  demoCities,
  demoDungeons,
  demoLibraryDocs,
  demoLores,
  demoMapMarkers,
  demoMonsters,
  demoNpcs,
  demoPlayers,
  demoQuests,
  demoSessions,
  demoTagLinks,
  demoTags,
  demoTimeline,
  demoWiki,
  demoWorlds,
  type DemoTagLinkType,
} from './fixtures/campaign';

/** Lookup tables — id → entity for each domain we link tags against. */
const ENTITY_INDEX: Record<DemoTagLinkType, Map<number, unknown>> = {
  beast: new Map(demoMonsters.map((m) => [m.id, m])),
  npc: new Map(demoNpcs.map((n) => [n.id, n])),
  city: new Map(demoCities.map((c) => [c.id, c])),
  dungeon: new Map(demoDungeons.map((d) => [d.id, d])),
  world: new Map(demoWorlds.map((w) => [w.id, w])),
  player: new Map(demoPlayers.map((p) => [p.id, p])),
  lore: new Map(demoLores.map((l) => [l.id, l])),
  quest: new Map(demoQuests.map((q) => [q.id, q])),
};

/**
 * Resolves the full TagEntities response for a given tag id, by walking the
 * link list and pulling the matching entity objects out of ENTITY_INDEX.
 */
function resolveTagEntities(tagId: number) {
  const tag = demoTags.find((t) => t.id === tagId) ?? null;
  const links = demoTagLinks.filter((l) => l.tagId === tagId);
  const pick = (type: DemoTagLinkType) =>
    links
      .filter((l) => l.type === type)
      .map((l) => ENTITY_INDEX[type].get(l.entityId))
      .filter(Boolean);
  return {
    tag,
    beasts: pick('beast'),
    npcs: pick('npc'),
    cities: pick('city'),
    dungeons: pick('dungeon'),
    worlds: pick('world'),
    players: pick('player'),
    lores: pick('lore'),
    quests: pick('quest'),
  };
}

/** Resolves the tag list attached to a given (type, entityId) pair. */
function resolveEntityTags(type: DemoTagLinkType, entityId: number) {
  const tagIds = new Set(demoTagLinks.filter((l) => l.type === type && l.entityId === entityId).map((l) => l.tagId));
  return demoTags.filter((t) => tagIds.has(t.id));
}

/**
 * Returns the public-base-aware URL of an asset under `public/demo-files/`.
 * In a non-root deploy (e.g. GitHub Pages under /picho-rpg-front/) we need
 * to prefix with `import.meta.env.BASE_URL` to hit the right path.
 */
function publicUrl(relative: string): string {
  const base = import.meta.env.BASE_URL ?? '/';
  return `${base.replace(/\/$/, '')}/${relative.replace(/^\/+/, '')}`;
}

export function installDemoMocks(axiosInstance: AxiosInstance): void {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 120 });

  // ── Auth ────────────────────────────────────────────────────────────────
  // GM unlock is hidden from the UI but if it ever fires we reject — the
  // demo cannot grant GM access.
  mock.onPost('/api/auth/login').reply(403, { error: 'GM mode disabled in demo' });

  // ── Worlds / Cities / Dungeons ──────────────────────────────────────────
  mock.onGet('/api/worlds').reply(200, demoWorlds);
  mock.onGet('/api/cities').reply(200, demoCities);
  mock.onGet('/api/dungeons').reply(200, demoDungeons);

  // ── NPCs / Bestiary ─────────────────────────────────────────────────────
  mock.onGet('/api/npcs').reply(200, demoNpcs);
  mock.onGet('/api/bestiary').reply(200, demoMonsters);

  // ── Players ─────────────────────────────────────────────────────────────
  mock.onGet('/api/players').reply(200, demoPlayers);
  mock.onGet(/\/api\/players\/\d+\/notes$/).reply(200, []);

  // ── Quests / Sessions / Timeline ────────────────────────────────────────
  mock.onGet('/api/quests').reply(200, demoQuests);
  mock.onGet(/\/api\/quests\/(\d+)\/cities$/).reply((config) => {
    const m = /\/api\/quests\/(\d+)\/cities$/.exec(config.url ?? '');
    const id = m ? Number(m[1]) : null;
    const quest = demoQuests.find((q) => q.id === id);
    if (!quest) return [404, { error: 'Not found' }];
    const cities = demoCities.filter((c) => quest.cityIds.includes(c.id));
    return [200, cities];
  });
  mock.onGet('/api/sessions').reply(200, demoSessions);
  mock.onGet('/api/timeline').reply(200, demoTimeline);

  // ── Lore / Wiki ─────────────────────────────────────────────────────────
  mock.onGet('/api/lores').reply(200, demoLores);
  mock.onGet('/api/wiki').reply(200, demoWiki);

  // ── Tags & cross-entity links ───────────────────────────────────────────
  mock.onGet('/api/tags').reply(200, demoTags);
  mock.onGet(/\/api\/tags\/(\d+)\/entities$/).reply((config) => {
    const m = /\/api\/tags\/(\d+)\/entities$/.exec(config.url ?? '');
    const id = m ? Number(m[1]) : null;
    if (id == null) return [400, { error: 'Bad request' }];
    return [200, resolveTagEntities(id)];
  });
  mock.onGet(/\/api\/entity-tags\/([^/]+)\/(\d+)$/).reply((config) => {
    const m = /\/api\/entity-tags\/([^/]+)\/(\d+)$/.exec(config.url ?? '');
    if (!m) return [400, { error: 'Bad request' }];
    const type = m[1] as DemoTagLinkType;
    const id = Number(m[2]);
    if (!(type in ENTITY_INDEX)) return [200, []];
    return [200, resolveEntityTags(type, id)];
  });

  // ── Library ─────────────────────────────────────────────────────────────
  // The demo library is unlocked: no x-library-key required.
  mock.onGet('/api/library/settings').reply(200, { hasPlayerKey: false });
  mock.onGet('/api/library/documents').reply(200, demoLibraryDocs);
  // The viewer fetches a blob URL via /api/library/documents/:id/download.
  // We rewrite to point at the static demo asset under /demo-files/<filename>.
  mock.onGet(/\/api\/library\/documents\/(\d+)\/download$/).reply(async (config) => {
    const m = /\/api\/library\/documents\/(\d+)\/download$/.exec(config.url ?? '');
    const id = m ? Number(m[1]) : null;
    const doc = demoLibraryDocs.find((d) => d.id === id);
    if (!doc) return [404, new Blob([], { type: 'application/octet-stream' })];
    try {
      const res = await fetch(publicUrl(doc.url));
      const buf = await res.arrayBuffer();
      return [
        200,
        new Blob([buf], { type: doc.mime }),
        {
          'Content-Type': doc.mime,
          'Content-Disposition': `attachment; filename="${doc.filename}"`,
        },
      ];
    } catch {
      return [500, new Blob([], { type: 'application/octet-stream' })];
    }
  });

  // ── GM-only domains: empty arrays so the player view stays consistent ──
  mock.onGet('/api/gm/notes').reply(200, []);
  mock.onGet('/api/gm/images').reply(200, []);
  mock.onGet('/api/gm/sheets').reply(200, []);
  mock.onGet(/\/api\/gm\/sheets\/\d+$/).reply(404, { error: 'Not found' });

  // ── Map markers ─────────────────────────────────────────────────────────
  mock.onGet(/\/api\/map[/-]markers$/).reply(200, demoMapMarkers);
  mock.onGet('/api/map-markers').reply(200, demoMapMarkers);

  // ── Catch-all fallback: anything else returns 200 with an empty body so a
  // missing mock doesn't crash the screen. We log to the console so the dev
  // notices and adds the proper handler.
  mock.onAny().reply((config) => {
    if (config.method?.toLowerCase() === 'get') {
      console.warn('[demo] Unmocked GET', config.url);
      return [200, []];
    }

    console.warn('[demo] Blocked write', config.method, config.url);
    return [405, { error: 'Read-only demo' }];
  });
}
