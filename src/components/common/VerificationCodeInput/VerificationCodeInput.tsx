import React from 'react';
import * as S from './VerificationCodeInput.styles';

interface VerificationCodeInputProps {
  autoFocus?: boolean;
  validChars?: string;
  length?: number;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const VerificationCodeInput: React.FC<VerificationCodeInputProps> = (props) => {
  return (
    <S.CodeInput
      classNames={{
        container: 'container',
        character: 'character',
        characterInactive: 'character--inactive',
        characterSelected: 'character--selected',
      }}
      placeholder={''}
      {...props}
    />
  );
};
