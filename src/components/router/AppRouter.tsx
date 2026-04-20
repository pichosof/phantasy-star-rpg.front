// src/components/router/AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@app/components/layouts/main/MainLayout/MainLayout';
import { withLoading } from '@app/hocs/withLoading.hoc';
import { ROUTES } from '@app/constants/routes';

const PlayersPage = React.lazy(() => import('@app/pages/PlayersPage'));
const BestiaryPage = React.lazy(() => import('@app/pages/BestiaryPage'));
const CitiesPage = React.lazy(() => import('@app/pages/CitiesPage'));
const QuestsPage = React.lazy(() => import('@app/pages/QuestsPage'));
const MapPage = React.lazy(() => import('@app/pages/MapPage'));
const ServerErrorPage = React.lazy(() => import('@app/pages/ServerErrorPage'));
const Error404Page = React.lazy(() => import('@app/pages/Error404Page'));
const LoresAdminPage = React.lazy(() => import('@app/pages/LoresAdminPage'));
const SessionsPage = React.lazy(() => import('@app/pages/SessionsPage'));
const TimelinePage = React.lazy(() => import('@app/pages/TimelinePage'));
const WikiPageComponent = React.lazy(() => import('@app/pages/WikiPage'));
const NPCsPageComponent = React.lazy(() => import('@app/pages/NPCsPage'));
const DiceRollerPageComponent = React.lazy(() => import('@app/pages/DiceRollerPage'));
const GmNotesPageComponent = React.lazy(() => import('@app/pages/gm/GmNotesPage'));
const GmImagesPageComponent = React.lazy(() => import('@app/pages/gm/GmImagesPage'));
const GmSheetsPageComponent = React.lazy(() => import('@app/pages/gm/GmSheetsPage'));
const LibraryPageComponent = React.lazy(() => import('@app/pages/LibraryPage'));
const DungeonsPageComponent = React.lazy(() => import('@app/pages/DungeonsPage'));
const TagsPageComponent = React.lazy(() => import('@app/pages/TagsPage'));
const Library = withLoading(LibraryPageComponent);
const Dungeons = withLoading(DungeonsPageComponent);
const Tags = withLoading(TagsPageComponent);

// Página genérica “em construção” (cria esse arquivo, mostro abaixo)
const ComingSoonPage = React.lazy(() => import('@app/pages/ComingSoonPage'));

const Map = withLoading(MapPage);
const Players = withLoading(PlayersPage);
const Cities = withLoading(CitiesPage);
const Quests = withLoading(QuestsPage);
const ServerError = withLoading(ServerErrorPage);
const Error404 = withLoading(Error404Page);
const ComingSoon = withLoading(ComingSoonPage);
const Bestiary = withLoading(BestiaryPage);
const Lores = withLoading(LoresAdminPage);
const Sessions = withLoading(SessionsPage);
const Timeline = withLoading(TimelinePage);
const Wiki = withLoading(WikiPageComponent);
const Npcs = withLoading(NPCsPageComponent);
const DiceRoller = withLoading(DiceRollerPageComponent);
const GmNotes = withLoading(GmNotesPageComponent);
const GmImages = withLoading(GmImagesPageComponent);
const GmSheets = withLoading(GmSheetsPageComponent);

export const AppRouter: React.FC = () => {
  const protectedLayout = <MainLayout />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={protectedLayout}>
          {/* Home simples: joga pra Players */}
          <Route index element={<Navigate to={ROUTES.PLAYERS} replace />} />

          <Route path={ROUTES.PLAYERS} element={<Players />} />
          <Route path={ROUTES.CITIES} element={<Cities />} />
          <Route path={ROUTES.QUESTS} element={<Quests />} />
          <Route path={ROUTES.WORLDS} element={<Map />} />
          <Route path={ROUTES.LORES} element={<Lores />} />

          {/* Backend já existe, UI ainda não: deixa WIP */}
          <Route path={ROUTES.NPCS} element={<Npcs />} />
          <Route path={ROUTES.MONSTERS} element={<Bestiary />} />
          <Route path={ROUTES.MAP_MARKERS} element={<ComingSoon title="Map Markers" />} />
          <Route path={ROUTES.SESSIONS} element={<Sessions />} />
          <Route path={ROUTES.TIMELINE} element={<Timeline />} />
          <Route path={ROUTES.WIKI} element={<Wiki />} />

          <Route path={ROUTES.LIBRARY} element={<Library />} />
          <Route path={ROUTES.DICE} element={<DiceRoller />} />
          <Route path={ROUTES.DUNGEONS} element={<Dungeons />} />
          <Route path={ROUTES.TAGS} element={<Tags />} />
          <Route path={ROUTES.GM_NOTES} element={<GmNotes />} />
          <Route path={ROUTES.GM_IMAGES} element={<GmImages />} />
          <Route path={ROUTES.GM_SHEETS} element={<GmSheets />} />

          <Route path={ROUTES.SERVER_ERROR} element={<ServerError />} />

          {/* 404 */}
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
