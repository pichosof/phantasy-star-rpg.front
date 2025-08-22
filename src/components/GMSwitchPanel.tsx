import React from 'react';
import { Card } from '@app/components/common/Card/Card';
import { Input } from '@app/components/common/inputs/Input/Input';
import { Button } from '@app/components/common/buttons/Button/Button';
import { initGMKeyFromStorage, setGMKey } from '../api/http.api';

const PANEL_STYLE: React.CSSProperties = { margin: '16px', padding: '12px' };

const KEY_STORAGE = 'gm_api_key';

const GMSwitchPanel: React.FC = () => {
  const [key, setKeyState] = React.useState('');
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    initGMKeyFromStorage();
    const stored = localStorage.getItem(KEY_STORAGE) || '';
    setKeyState(stored);
    setActive(!!stored);
  }, []);

  function apply() {
    const cleaned = key.trim();
    setGMKey(cleaned || undefined);
    setActive(!!cleaned);
  }
  function clearKey() {
    setKeyState('');
    setGMKey(undefined);
    setActive(false);
  }

  return (
    <Card style={PANEL_STYLE} title="GM Mode">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <Input placeholder="Cole a GM_API_KEY" value={key} onChange={(e: any) => setKeyState(e.target.value)} />
        <Button onClick={apply}>{active ? 'Atualizar' : 'Ativar'}</Button>
        {active && (
          <Button onClick={clearKey} danger={true}>
            Sair do modo GM
          </Button>
        )}
      </div>
    </Card>
  );
};

export default GMSwitchPanel;
