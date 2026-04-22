import React, { Suspense } from 'react';
import { Loading } from '@app/components/common/Loading';

// eslint-disable-next-line @typescript-eslint/ban-types
export const withLoading = <T extends object>(Component: React.ComponentType<T>): React.FC<T> => {
  return (props: T) => (
    <Suspense fallback={<Loading />}>
      <Component {...props} />
    </Suspense>
  );
};
