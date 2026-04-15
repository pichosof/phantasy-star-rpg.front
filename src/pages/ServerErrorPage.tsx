import React from 'react';
import { Error } from '@app/components/Error/Error';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import serverError from '@app/assets/images/server-error.svg';

const ServerErrorPage: React.FC = () => {
  return (
    <>
      <PageTitle>Server Error</PageTitle>
      <Error img={serverError} msg="Internal server error. Please try again later." />
    </>
  );
};

export default ServerErrorPage;
