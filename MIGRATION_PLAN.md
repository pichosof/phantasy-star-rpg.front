# Migration Plan - phantasy-star-rpg.front

Branch de trabalho: `update-version`

---

## Estado atual

| Pacote | Antes | Depois |
|--------|-------|--------|
| Bundler | CRA 4 + Craco | Vite 5.4 |
| React | 17.0.2 | 19.0.0 |
| react-dom | 17.0.2 | 19.0.0 |
| react-redux | 7.2 | 9.2 |
| @reduxjs/toolkit | 1.7 | 2.3 |
| styled-components | 5.3 | 6.1 |
| react-router-dom | 6.0 | 6.28 |
| axios | 0.24 | 1.7 |
| TypeScript | 4.1 | 5.8 |
| ESLint | 7.28 | 8.57 |
| Prettier | 2.3 | 3.8 |
| @typescript-eslint | 5.x | 7.18 |
| AntD | 4.22 | 6.3 |
| Node | 16.x | >=20.0.0 |

### Snapshot atual da branch

- PR1 a PR4.5 concluidos
- PR6 (PWA) concluido e integrado ao fluxo atual
- PR5.1 em andamento com shell mobile, iconografia semantica, guard de rotas
  GM e Fase 0 do kit mobile compartilhado ja concluida
- Tema Motavia/Dezolis revisado no shell para desktop, tablet e mobile
- Grande parte das paginas e componentes migrada para `*.styles.ts`, reduzindo
  `inline styles` e estilos misturados com JSX
- `antd-mobile` e `antd-mobile-icons` adotados como base do mobile
- Rotas GM protegidas com redirecionamento para `/403` quando nao houver GM key

### Entregas consolidadas desta rodada

- Header mobile refeito com `NavBar`, settings sheet, painel de GM e CTA de PWA
- Menu mobile refeito com abertura pela direita e ordem visual otimizada para
  uso com uma mao
- Acesso LAN por IP mantido para QA mobile na mesma rede
- `AppIcon` criado para mapear `@ant-design/icons` no desktop e
  `antd-mobile-icons` no mobile
- Fase 0 concluida em `src/components/common/mobile` com scaffold, sheets,
  action bar e wrappers compartilhados para componentes do `antd-mobile`
- `Lores (GM)` movido para `GM Area`
- Cleanup estrutural de estilos em dezenas de paginas e componentes com
  `styled-components`, `styleUtils`, `resetCss` e `GlobalStyle`

---

## Commits relevantes

| Hash | Descricao |
|------|-----------|
| `7373bb1` | PR1+PR2: CRA -> Vite 5, React 17 -> 19 |
| `3ac3ddd` | PR3: TypeScript 4 -> 5, ESLint 7 -> 8, Prettier 2 -> 3 |
| `f78e4c6` | PR4: Ant Design 4 -> 6 + @ant-design/icons 4 -> 6 |
| `006047c` | chore: finish antd 6 deprecated cleanup |
| `cccf74a` | chore: finish pr4.5 cleanup and tooling warnings |
| `45e9d02` | feat: enable lan mobile access and restore pwa install |

---

## Roadmap de PRs

### PR1 - CRA/Craco -> Vite 5

- Substituir `react-scripts` + `@craco/craco` por `vite` + `@vitejs/plugin-react`
- Levar o projeto para `index.html` na raiz e `import.meta.env`
- Remover service worker antigo e arquivos do CRA

### PR2 - React 17 -> 19

- Atualizar `react`, `react-dom`, `react-redux`, RTK, `styled-components`
- Migrar `ReactDOM.render` para `createRoot`
- Remover dependencias de runtime antigas do CRA

### PR3 - TypeScript 4 -> 5 + ESLint 7 -> 8

- Atualizar TypeScript, ESLint, Prettier e plugins associados
- Ajustar regras e tipagens que quebraram com as novas versoes

### PR4 - Ant Design 4 -> 6

- Atualizar `antd` e `@ant-design/icons`
- Migrar APIs principais de `Menu`, `Dropdown`, `Drawer`, `Modal`, `Tabs`,
  `Collapse`, `Select` e notificacoes
- Consolidar o sistema de tema sobre tokens e wrappers compartilhados

### PR4.5 - Cleanup de deprecated do AntD 6

- Eliminar leftovers do PR4 que ainda disparavam warnings de deprecated
- Trocar `destroyOnClose` por `destroyOnHidden`
- Trocar `bodyStyle`/`headerStyle` por `styles.body`/`styles.header`
- Trocar `notification.*({ message })` por `notification.*({ title })`
- Trocar `Drawer width` por `size` e `Modal visible` por `open`
- Normalizar `Card size="default"` para `medium` no wrapper compartilhado
- Remover `Select.Option`, `Menu.Item`, `Menu.SubMenu` e `Collapse` legados
- Validacao final com `yarn lint`, `yarn type-check` e `yarn build`
- Tooling:
  - remover `lessc --js` legado do build de temas
  - migrar `vite.config.ts` para `vite.config.mts`
  - eliminar warning da API CJS do Vite

### PR5 - Mobile-first com AntD Mobile

Premissas:

- Mobile virou requisito padrao do frontend
- Tudo que for criado ou alterado para `< 768px` deve considerar
  `antd-mobile` como camada principal de UX
- Desktop/tablet continuam com AntD, mas o visual e o comportamento precisam
  permanecer coerentes entre Motavia e Dezolis

### PR5.1 - Infra + Shell mobile (em andamento)

Entregue:

- Instalacao de `antd-mobile` e `antd-mobile-icons`
- Shell mobile compartilhado para header, menu, settings, PWA e GM mode
- Tema revisado no shell mobile para Motavia e Dezolis
- Ergonomia right-handed no mobile:
  - botao do menu no lado direito
  - abertura pela direita para a esquerda
  - ordem visual invertida no menu mobile
- `AppIcon` para mapear icones desktop/mobile com semantica unica
- Guard de rotas GM com wrapper + pagina `403`
- Fase 0 concluida com o kit compartilhado em `src/components/common/mobile`:
  - `MobilePageScaffold`
  - `MobileSectionHeader`
  - `MobileFilterSheet`
  - `MobileEntitySheet`
  - `MobileActionBar`
  - wrappers de `Card`, `List`, `Tabs`, `Popup`, `Dialog`, `Form`,
    `SearchBar`, `Selector` e `ActionSheet`
- Tokens e classes globais de suporte adicionados em `styleUtils` e
  `GlobalStyle`
- Inicio do cleanup estrutural de estilos em `*.styles.ts`
- Fase 1 concluida com `Players` como pagina piloto mobile-first:
  - lista mobile com busca e filtros em sheet
  - entity sheet com `Overview`, `Notes` e `GM`
  - criacao/edicao mobile de personagem
  - preview de PDF unificado com `react-pdf-viewer` em mobile, tablet e desktop

Ja adiantado dentro da mesma rodada:

- Remocao de varios `inline styles` em paginas e componentes de `src/pages`,
  `src/pages/gm` e `src/components/rpg`
- Substituicao de emojis de UI por iconografia semantica compartilhada
- Ajustes finos de shell, cores e drawers em Motavia/Dezolis

Fica para as proximas fatias:

- Conversao page-by-page dos fluxos restantes, com `Players` como primeira tela
- Hardening visual, touch e QA cross-device

### PR5.2 - Players (concluido)

- `Players` convertido para fluxo mobile-first usando o kit da Fase 0
- Wrappers compartilhados refinados a partir do uso real em:
  - `MobileEntitySheet`
  - `MobileSearchBar`
  - shell de popup/drawer mobile
- Viewer de PDF consolidado em componente compartilhado para todos os breakpoints

### PR5.3 - Cities (concluido)

- `Cities` convertido para fluxo mobile-first
- Entregue:
  - lista mobile com busca e filtros em sheet
  - cards mobile para modos `players` e `gm`
  - detalhe da cidade em `MobileEntitySheet`
  - tabs mobile de `Overview`, `Lores`, `Quests` e `GM`
  - criacao mobile de cidade
  - GM controls mobile com acesso ao editor completo quando necessario

### PR5.4 - Sessions (concluido)

- `Sessions` convertido para fluxo mobile-first
- Entregue:
  - diario mobile com busca e filtros em sheet
  - alternancia mobile entre `Diary` e `GM`
  - cards mobile de sessoes com cover tematico
  - detalhe da sessao em `MobileEntitySheet`
  - tabs mobile de `Overview` e `GM`
  - criacao mobile de sessao
  - edicao, visibilidade e exclusao em fluxo mobile GM
  - preservacao do fluxo desktop/tablet com grid, tabela e drawer
  - troca do acesso GM direto por `useGMMode()`
  - estilos extraidos para `SessionsPage.styles.ts`

### PR5.5 - Quests

- Quests

### PR5.6 - Demais CRUDs e paginas de campanha

- Timeline
- Lores
- Bestiary
- NPCs
- Dungeons
- Tags

### PR5.7 - Conteudo e GM area

- Wiki
- Library
- GmNotes
- GmImages

### PR5.8 - Fluxos complexos

- Map
- GmSheets
- GurpsSheetForm
- StarfinderSheetForm
- DiceRoller

### PR5.9 - Hardening

- QA cross-device
- Ajustes touch
- Revisao visual por tema
- Performance

### PR6 - Workbox v7 + PWA (`ef176c4`)

- `vite-plugin-pwa@^1.2.0` com Workbox 7
- `registerType: 'autoUpdate'`
- Manifest gerado no build
- Runtime caching para fontes, `/api/*` e assets remotos

---

## Decisoes de arquitetura

- **Ambientes**: apenas `.env.development` por enquanto. Outros ambientes
  continuam sendo configurados pelo time quando necessario.
- **PWA/Service Worker**: desativado intencionalmente ate o PR6.
- **`skipLibCheck: true`**: mantido durante a migracao para evitar ruido de
  tipagens de bibliotecas de terceiros.
- **yarn.lock**: mantido via Yarn Berry 3.1.1 com `node-modules` linker.
- **Rotas GM**: `LORES`, `GM_NOTES`, `GM_IMAGES` e `GM_SHEETS` exigem GM key
  ativa no cliente; sem ela o usuario e redirecionado para `/403`.
- **Shell mobile**: o fluxo de menu e acoes segue ergonomia right-handed, com
  entrada pelo lado direito e foco em navegacao por um unico dedo.
- **Estilos**: separar JSX e estilo continua sendo regra; novas telas e
  refactors devem priorizar `*.styles.ts`, `styled-components`, `styleUtils`,
  `resetCss` e `GlobalStyle`.

---

## Addendum - LAN / PWA

- Dev server liberado em `0.0.0.0` para acesso por IP na rede local
- Exemplo atual de teste: `http://192.168.10.198:3000`
- Botao de install restaurado na engrenagem
- O prompt nativo de instalacao continua dependendo de contexto seguro
  (`https` ou `localhost`), entao acesso por IP em `http` serve para uso e QA
  mobile, mas nao garante instalacao PWA
- `localhost` continua sendo o melhor fluxo para validar o prompt real de PWA
- O acesso por IP e o fluxo recomendado para QA manual no celular durante a PR5

---

## Comandos uteis

```bash
# Iniciar dev server
yarn start

# Type check sem emitir
yarn type-check

# Lint e fix
yarn lint

# Build
yarn build
```
