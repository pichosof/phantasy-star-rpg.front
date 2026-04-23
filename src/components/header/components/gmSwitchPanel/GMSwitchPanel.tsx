import React from 'react';
import { Button as MobileButton, Input as MobileInput } from 'antd-mobile';
import { Input } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { initGMKeyFromStorage, isGMAuthenticated, loginGM, logoutGM } from '@app/api/http.api';
import * as S from './GMSwitchPanel.styles';

interface GMSwitchPanelProps {
  variant?: 'card' | 'sheet';
  onClose?: () => void;
}

const GMSwitchPanel: React.FC<GMSwitchPanelProps> = ({ variant = 'card', onClose }) => {
  const [key, setKeyState] = React.useState('');
  const [active, setActive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryAfter, setRetryAfter] = React.useState<number | null>(null);
  const isSheet = variant === 'sheet';

  React.useEffect(() => {
    initGMKeyFromStorage();
    setActive(isGMAuthenticated());
  }, []);

  React.useEffect(() => {
    if (!retryAfter) return;
    const id = setInterval(() => {
      setRetryAfter((seconds) => {
        if (seconds === null || seconds <= 1) {
          clearInterval(id);
          return null;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  async function apply() {
    const cleaned = key.trim();
    if (!cleaned) {
      setError('Enter your GM key.');
      return;
    }

    setLoading(true);
    setError(null);
    const result = await loginGM(cleaned);
    setLoading(false);

    if (result.success) {
      setActive(true);
      setKeyState('');
      onClose?.();
    } else {
      setActive(false);
      setError(result.error ?? 'Authentication failed.');
      if (result.retryAfterSeconds) setRetryAfter(result.retryAfterSeconds);
    }
  }

  function clearKey() {
    setKeyState('');
    setError(null);
    setRetryAfter(null);
    logoutGM();
    setActive(false);
    onClose?.();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void apply();
  }

  const content = active ? (
    isSheet ? (
      <S.SheetContent>
        <S.StatusBlock>
          <S.StatusLabel>GM mode active</S.StatusLabel>
          <S.StatusHint>Admin routes and protected controls are unlocked on this device.</S.StatusHint>
        </S.StatusBlock>
        <MobileButton block color="danger" fill="outline" onClick={clearKey}>
          Exit GM mode
        </MobileButton>
      </S.SheetContent>
    ) : (
      <S.DesktopActiveRow>
        <S.DesktopStatusLabel>GM mode active</S.DesktopStatusLabel>
        <Button onClick={clearKey} danger={true}>
          Exit GM mode
        </Button>
      </S.DesktopActiveRow>
    )
  ) : isSheet ? (
    <S.SheetContent>
      <MobileInput
        placeholder="GM key"
        value={key}
        onChange={setKeyState}
        onEnterPress={() => void apply()}
        type="password"
        clearable
        disabled={loading || !!retryAfter}
      />
      <MobileButton block color="primary" onClick={() => void apply()} loading={loading} disabled={!!retryAfter}>
        Activate GM mode
      </MobileButton>
      {error && (
        <S.ErrorText>
          {error}
          {retryAfter ? ` Retry in ${retryAfter}s.` : ''}
        </S.ErrorText>
      )}
      {!error && (
        <S.HelperText>Use your GM key to unlock admin actions, hidden content and GM-only routes.</S.HelperText>
      )}
    </S.SheetContent>
  ) : (
    <S.DesktopForm>
      <S.DesktopFormRow>
        <Input
          placeholder="GM key"
          value={key}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyState(e.target.value)}
          onKeyDown={handleKeyDown}
          type="password"
          disabled={loading || !!retryAfter}
        />
        <Button onClick={apply} loading={loading} disabled={!!retryAfter}>
          Activate
        </Button>
      </S.DesktopFormRow>
      {error && (
        <S.DesktopErrorText>
          {error}
          {retryAfter ? ` Retry in ${retryAfter}s.` : ''}
        </S.DesktopErrorText>
      )}
    </S.DesktopForm>
  );

  if (isSheet) {
    return content;
  }

  return <S.PanelCard title="GM Mode">{content}</S.PanelCard>;
};

export default GMSwitchPanel;
