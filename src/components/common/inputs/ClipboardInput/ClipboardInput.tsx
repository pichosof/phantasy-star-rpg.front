import React, { useCallback } from 'react';
import { Button, Tooltip } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import { SuffixInput } from '../SuffixInput/SuffixInput';
import { InputProps } from '../Input/Input';
import { notificationController } from '@app/controllers/notificationController';

interface ClipboardInputProps extends InputProps {
  valueToCopy?: string;
}

export const ClipboardInput: React.FC<ClipboardInputProps> = ({ valueToCopy, ...props }) => {
  const handleCopy = useCallback(
    () =>
      valueToCopy &&
      navigator.clipboard.writeText(valueToCopy).then(() => {
        notificationController.info({ title: 'Copied' });
      }),
    [valueToCopy],
  );

  return (
    <SuffixInput
      suffix={
        <Tooltip title="Copy">
          <Button size="small" disabled={!valueToCopy} type="text" icon={<CopyOutlined />} onClick={handleCopy} />
        </Tooltip>
      }
      {...props}
    />
  );
};
