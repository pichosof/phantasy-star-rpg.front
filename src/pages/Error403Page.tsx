import React from 'react';

import { Error } from '@app/components/Error/Error';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import error404 from '@app/assets/images/error404.svg';

const Error403Page: React.FC = () => {
  return (
    <>
      <PageTitle>Forbidden</PageTitle>
      <Error img={error404} msg="You need an active GM key to access this area." />
    </>
  );
};

export default Error403Page;
