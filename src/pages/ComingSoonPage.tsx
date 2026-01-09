// src/pages/ComingSoonPage.tsx
import React from 'react';
import { Typography } from 'antd';
import { PageTitle } from '@app/components/common/PageTitle/PageTitle';

type Props = { title: string };

const ComingSoonPage: React.FC<Props> = ({ title }) => {
  return (
    <>
      <PageTitle>{title}</PageTitle>
      <Typography.Paragraph type="secondary">WIP. O backend já existe; a tela ainda não.</Typography.Paragraph>
    </>
  );
};

export default ComingSoonPage;
