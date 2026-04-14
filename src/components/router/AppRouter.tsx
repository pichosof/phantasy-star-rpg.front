// src/components/router/AppRouter.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@app/components/layouts/main/MainLayout/MainLayout';
import { withLoading } from '@app/hocs/withLoading.hoc';
import { ROUTES } from '@app/constants/routes';

const PlayersPage = React.lazy(() => import('@app/pages/PlayersPage'));
const CitiesPage = React.lazy(() => import('@app/pages/CitiesPage'));
const QuestsPage = React.lazy(() => import('@app/pages/QuestsPage'));
const MapPage = React.lazy(() => import('@app/pages/MapPage'));
const ServerErrorPage = React.lazy(() => import('@app/pages/ServerErrorPage'));
const Error404Page = React.lazy(() => import('@app/pages/Error404Page'));
const LoresAdminPage = React.lazy(() => import('@app/pages/LoresAdminPage'));
const SessionsPage = React.lazy(() => import('@app/pages/SessionsPage'));
const TimelinePage = React.lazy(() => import('@app/pages/TimelinePage'));
const WikiPageComponent = React.lazy(() => import('@app/pages/WikiPage'));

// Página genérica “em construção” (cria esse arquivo, mostro abaixo)
const ComingSoonPage = React.lazy(() => import('@app/pages/ComingSoonPage'));

const Map = withLoading(MapPage);
const Players = withLoading(PlayersPage);
const Cities = withLoading(CitiesPage);
const Quests = withLoading(QuestsPage);
const ServerError = withLoading(ServerErrorPage);
const Error404 = withLoading(Error404Page);
const ComingSoon = withLoading(ComingSoonPage);
const Lores = withLoading(LoresAdminPage);
const Sessions = withLoading(SessionsPage);
const Timeline = withLoading(TimelinePage);
const Wiki = withLoading(WikiPageComponent);

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
          <Route path={ROUTES.NPCS} element={<ComingSoon title="NPCs" />} />
          <Route path={ROUTES.MONSTERS} element={<ComingSoon title="Monsters" />} />
          <Route path={ROUTES.MAP_MARKERS} element={<ComingSoon title="Map Markers" />} />
          <Route path={ROUTES.SESSIONS} element={<Sessions />} />
          <Route path={ROUTES.TIMELINE} element={<Timeline />} />
          <Route path={ROUTES.WIKI} element={<Wiki />} />

          <Route path={ROUTES.SERVER_ERROR} element={<ServerError />} />

          {/* 404 */}
          <Route path="*" element={<Error404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
