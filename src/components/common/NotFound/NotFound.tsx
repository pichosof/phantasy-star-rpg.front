import React from 'react';
import { Image } from 'antd';
import notFoundImg from '@app/assets/images/nothing-found.webp';
import * as S from './NotFound.styles';

export const NotFound: React.FC = () => {
  return (
    <S.NotFoundWrapper>
      <S.ImgWrapper>
        <Image src={notFoundImg} alt="Not found" preview={false} />
      </S.ImgWrapper>
      <S.Text>{"Sorry, there's nothing found"}</S.Text>
    </S.NotFoundWrapper>
  );
};
