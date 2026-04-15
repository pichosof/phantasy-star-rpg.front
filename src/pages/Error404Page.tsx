import React from 'react';
import { Error } from '@app/components/Error/Error';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';
import error404 from '@app/assets/images/error404.svg';

const Error404Page: React.FC = () => {
  return (
    <>
      <PageTitle>Not Found</PageTitle>
      <Error img={error404} msg="Sorry, the page you visited does not exist." />
    </>
  );
};

export default Error404Page;
