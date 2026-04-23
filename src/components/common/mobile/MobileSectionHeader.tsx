import React from 'react';
import * as S from './mobile.styles';

export interface MobileSectionHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  aside?: React.ReactNode;
}

export const MobileSectionHeader: React.FC<MobileSectionHeaderProps> = ({ title, description, aside }) => {
  return (
    <S.MobileSectionHeaderRoot>
      <S.MobileSectionCopy>
        <S.MobileSectionTitle>{title}</S.MobileSectionTitle>
        {description && <S.MobileSectionDescription>{description}</S.MobileSectionDescription>}
      </S.MobileSectionCopy>
      {aside && <S.MobileSectionAside>{aside}</S.MobileSectionAside>}
    </S.MobileSectionHeaderRoot>
  );
};
