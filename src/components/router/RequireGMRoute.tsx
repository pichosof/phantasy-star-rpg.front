import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { ROUTES } from '@app/constants/routes';
import { useGMMode } from '@app/hooks/useGMMode';

interface RequireGMRouteProps {
  children: React.ReactElement;
}

const RequireGMRoute: React.FC<RequireGMRouteProps> = ({ children }) => {
  const isGM = useGMMode();
  const location = useLocation();

  if (!isGM) {
    return <Navigate replace state={{ from: location }} to={ROUTES.FORBIDDEN} />;
  }

  return children;
};

export default RequireGMRoute;
