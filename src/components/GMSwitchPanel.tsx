import React from 'react';
import { Card } from '@app/components/common/Card/Card';
import { Input } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { initGMKeyFromStorage, isGMAuthenticated, loginGM, logoutGM } from '../api/http.api';

const PANEL_STYLE: React.CSSProperties = { margin: '16px', padding: '12px' };

const GMSwitchPanel: React.FC = () => {
  const [key, setKeyState] = React.useState('');
  const [active, setActive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [retryAfter, setRetryAfter] = React.useState<number | null>(null);

  React.useEffect(() => {
    initGMKeyFromStorage();
    setActive(isGMAuthenticated());
  }, []);

  // Countdown timer for rate-limit lockout
  React.useEffect(() => {
    if (!retryAfter) return;
    const id = setInterval(() => {
      setRetryAfter((s) => {
        if (s === null || s <= 1) { clearInterval(id); return null; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [retryAfter]);

  async function apply() {
    const cleaned = key.trim();
    if (!cleaned) { clearKey(); return; }

    setLoading(true);
    setError(null);
    const result = await loginGM(cleaned);
    setLoading(false);

    if (result.success) {
      setActive(true);
      setKeyState('');
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
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void apply();
  }

  return (
    <Card style={PANEL_STYLE} title="GM Mode">
      {active ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ color: '#52c41a' }}>GM mode active</span>
          <Button onClick={clearKey} danger={true}>Exit GM mode</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Input
              placeholder="GM key"
              value={key}
              onChange={(e: any) => setKeyState(e.target.value)}
              onKeyDown={handleKeyDown}
              type="password"
              disabled={loading || !!retryAfter}
            />
            <Button
              onClick={apply}
              loading={loading}
              disabled={!!retryAfter}
            >
              Activate
            </Button>
          </div>
          {error && (
            <span style={{ color: '#ff4d4f', fontSize: 12 }}>
              {error}
              {retryAfter ? ` Retry in ${retryAfter}s.` : ''}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default GMSwitchPanel;
