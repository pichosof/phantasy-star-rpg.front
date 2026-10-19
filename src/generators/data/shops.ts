/**
 * Shops. Rules from Economia de Motávia v3.0: prices are Starfinder 1e base prices (credits);
 * the local price adds acquisition, transport and scarcity (no flat "+20% everywhere"); cities
 * with a matching vocation are cheaper for their specialty. Local goods come from the
 * biodiversity bibles (Krupp, Sila-Weaver, flora) — their prices are generator references,
 * not ratified canon (marked "ref.").
 */

export type ItemKind =
  | 'weapon'
  | 'armor'
  | 'armorUpgrade'
  | 'tech'
  | 'hybrid'
  | 'magic'
  | 'biotech'
  | 'cybernetic'
  | 'personalUpgrade'
  | 'other';

export interface StockRule {
  kind: ItemKind;
  /** AoN group (weapon proficiency, armor class or "other" category). */
  groups?: string[];
  weight: number;
}

export interface LocalGood {
  name: string;
  price: number;
  unit: string;
  tags: string[];
  note?: string;
}

export interface ShopType {
  key: string;
  label: string;
  names: string[];
  stock: StockRule[];
  /** Tags of local goods this shop sells. */
  local: string[];
  /** Number of official items and local goods. */
  size: [number, number];
  /** City vocations (text match) where this shop is cheaper / better stocked. */
  favoredBy: string[];
  /** Where it fits: Motávia (default), Dezolis, Kolian. */
  settings?: ('motavia' | 'dezolis' | 'kolian')[];
  flavor: string[];
}

export const SHOP_TYPES: ShopType[] = [
  {
    key: 'weapons',
    label: 'Weaponsmith (licensed)',
    names: ['Armaria', 'Casa de Lâminas', 'Oficina de Armas', 'Forja Licenciada'],
    // Firearms and ammo exist but are scarce and expensive: legal shops carry mostly blades.
    stock: [
      { kind: 'weapon', groups: ['BasicMelee'], weight: 5 },
      { kind: 'weapon', groups: ['AdvMelee'], weight: 3 },
      { kind: 'weapon', groups: ['SmallArms'], weight: 1 },
      { kind: 'weapon', groups: ['Longarms'], weight: 1 },
      { kind: 'weapon', groups: ['Ammo'], weight: 1 },
    ],
    local: ['ammo'],
    size: [7, 1],
    favoredBy: ['Fraternidade do Metal', 'forja', 'industrial', 'militar', 'Caçadores'],
    flavor: [
      'Licença da Guarda Cívica pendurada na parede, renovada há pouco.',
      'Lâminas expostas; armas de fogo só atrás do balcão, com registro.',
      'O dono avisa: munição está em falta desde a última caravana.',
      'Exige registro de compra para qualquer arma de fogo.',
    ],
  },
  {
    key: 'grey',
    label: 'Grey market',
    names: [
      'Banca sem placa',
      'Fundos do Corredor',
      'Depósito dos Subníveis',
      'Contato do mercado cinza',
      'Porão sem nome',
    ],
    stock: [
      { kind: 'weapon', groups: ['SmallArms'], weight: 4 },
      { kind: 'weapon', groups: ['Longarms'], weight: 3 },
      { kind: 'weapon', groups: ['Ammo'], weight: 4 },
      { kind: 'weapon', groups: ['Grenade'], weight: 2 },
      { kind: 'weapon', groups: ['Sniper', 'Heavy'], weight: 1 },
      { kind: 'hybrid', weight: 2 },
      { kind: 'tech', groups: ['__rare__'], weight: 2 },
    ],
    local: ['ammo', 'relic'],
    size: [7, 3],
    favoredBy: [],
    flavor: [
      'Não faça a Custódia levantar da cadeira.',
      'Sem nota, sem registro, sem devolução.',
      'O vendedor só aparece se alguém de confiança apresentar você.',
      'Metade do estoque tem número de série raspado.',
      'Paga em moedas; carta de crédito deixa rastro.',
    ],
  },
  {
    key: 'armor',
    label: 'Armorer',
    names: ['Couraçaria', 'Oficina de Proteção', 'Casa das Placas', 'Alfaiataria Blindada'],
    stock: [
      { kind: 'armor', groups: ['Light'], weight: 5 },
      { kind: 'armor', groups: ['Heavy'], weight: 2 },
      { kind: 'armorUpgrade', weight: 3 },
    ],
    local: ['chitin', 'silk'],
    size: [7, 3],
    favoredBy: ['Fraternidade do Metal', 'industrial', 'militar', 'Caçadores'],
    flavor: [
      'Placas de quitina de Krupp secando ao sol no quintal.',
      'A dona tira as medidas com uma fita de seda de Sila-Weaver.',
      'Ajusta armaduras para plumagem motaviana sem custo extra.',
    ],
  },
  {
    key: 'outfitter',
    label: 'Field outfitter',
    names: ['Suprimentos de Campo', 'Armazém da Estrada', 'Tudo para Caravana', 'Provisões', 'Empório do Deserto'],
    stock: [
      { kind: 'tech', weight: 4 },
      { kind: 'other', groups: ['Personal Items'], weight: 5 },
      { kind: 'other', groups: ['Medicinals'], weight: 1 },
    ],
    local: ['travel', 'water', 'food', 'fuel', 'kit', 'mate'],
    size: [8, 6],
    favoredBy: ['caravana', 'Caçadores', 'comercial', 'logística', 'Agricultura'],
    flavor: [
      'Pilhas de cantis, lonas e cordas de junco-de-duna até o teto.',
      'O balconista pergunta o destino antes de sugerir qualquer coisa.',
      'Vende fiado para caçadores registrados na Guilda.',
    ],
  },
  {
    key: 'apothecary',
    label: 'Apothecary',
    names: ['Botica', 'Farmácia', 'Casa de Remédios', 'Ervanário'],
    stock: [
      { kind: 'other', groups: ['Medicinals'], weight: 6 },
      { kind: 'biotech', weight: 1 },
    ],
    local: ['medicine', 'herb', 'mate', 'kit'],
    size: [6, 6],
    favoredBy: ['cura', 'biofarmacêutico', 'Corpo Perfeito', 'Equilíbrio de Corpos', 'Medicina'],
    flavor: [
      'Potes rotulados com espinho-sal, raiz-serpente e óleo de larva.',
      'A farmacêutica pergunta por febres de lodo antes de vender qualquer coisa.',
      'Uma placa avisa: "Não vendemos curas para pedra".',
    ],
  },
  {
    key: 'tech',
    label: 'Tech workshop',
    names: ['Oficina Técnica', 'Reparos e Peças', 'Laboratório de Bairro', 'Sucata Fina', 'Ferro-Velho Técnico'],
    stock: [
      { kind: 'tech', weight: 5 },
      { kind: 'armorUpgrade', weight: 2 },
      { kind: 'weapon', groups: ['Ammo'], weight: 1 },
    ],
    local: ['scrap', 'parts', 'kit'],
    size: [8, 4],
    favoredBy: ['tecnológico', 'Tecno', 'engenharia', 'industrial', 'IA', 'neurotec'],
    flavor: [
      'Peças da Era das Maravilhas em caixas sem etiqueta.',
      'Aceita consertos por troca: uma peça rara vale mais que créditos.',
      'Um drone desmontado na bancada, ainda piscando.',
    ],
  },
  {
    key: 'biotech',
    label: 'Augmentation clinic',
    names: ['Clínica de Aprimoramento', 'Casa de Implantes', 'Bioclínica'],
    stock: [
      { kind: 'biotech', weight: 3 },
      { kind: 'cybernetic', weight: 3 },
      { kind: 'personalUpgrade', weight: 1 },
    ],
    local: ['medicine'],
    size: [5, 2],
    favoredBy: ['biofarmacêutico', 'Corpo Perfeito', 'cura', 'genética', 'neurotec', 'simbioides'],
    flavor: [
      'Exige exame no Hospital Velho antes de qualquer implante.',
      'Tem fila de espera de semanas para cirurgias maiores.',
      'Fala muito de "equilíbrio do corpo" e pouco de riscos.',
    ],
  },
  {
    key: 'fragments',
    label: 'Antiquities (grey market)',
    names: ['Banca de Fragmentos', 'Antiguidades', 'Achados da Era Antiga', 'Relíquias & Curiosidades'],
    stock: [
      { kind: 'hybrid', weight: 3 },
      { kind: 'tech', groups: ['__rare__'], weight: 2 },
    ],
    local: ['relic', 'map'],
    size: [4, 6],
    favoredBy: ['arqueologia', 'ruínas', 'Patrimônio', 'sepultamento', 'Ancestrais'],
    flavor: [
      'Procedência "privada". Não faça a Custódia levantar da cadeira.',
      'Metade é bugiganga; a outra metade ninguém sabe o que faz.',
      'O vendedor baixa o preço se você não perguntar de onde veio.',
      'Tem um cofre nos fundos para "peças mais sensíveis".',
    ],
  },
  {
    key: 'books',
    label: 'Bookseller & maps',
    names: ['Livraria', 'Sebo', 'Casa dos Mapas', 'Encadernadora'],
    stock: [{ kind: 'other', groups: ['Personal Items'], weight: 1 }],
    local: ['book', 'map'],
    size: [1, 8],
    favoredBy: ['Universidade', 'universitária', 'Conhecimento', 'Patrimônio', 'tradução'],
    flavor: [
      'Rua dos Livreiros: famosa por descobertas acidentais.',
      'Pilhas de cadernos de expedição comprados de herdeiros.',
      'O dono jura que um dos mapas leva a um oásis perfeito.',
    ],
  },
  {
    key: 'tavern',
    label: 'Tavern & inn',
    names: ['Taverna', 'Hospedaria', 'Casa de Pasto', 'Pousada', 'Bar'],
    stock: [],
    local: ['meal', 'drink', 'lodging'],
    size: [0, 10],
    favoredBy: ['comercial', 'turística', 'caravanas'],
    flavor: [
      'Uma parede tem mais de mil anos; a cerveja é de ontem.',
      'Debates da Praça das Teses continuam aqui até de madrugada.',
      'Caçadores trocam boatos de contrato no balcão.',
      'O dono não aceita brigas, só apostas.',
    ],
  },
  {
    key: 'stable',
    label: 'Krupp stable',
    names: ['Estábulo', 'Curral de Krupp', 'Pátio dos Animais', 'Criatório'],
    stock: [{ kind: 'other', groups: ['Transportation'], weight: 1 }],
    local: ['krupp', 'mount', 'animal'],
    size: [1, 7],
    favoredBy: ['caravana', 'Agricultura', 'Caçadores', 'logística'],
    flavor: [
      'O criador apresenta cada Krupp pelo nome e temperamento.',
      'Aluga Krupp por dia, com caução registrada na Guilda.',
      'Cheiro forte de larva e feno de junco.',
    ],
  },
  {
    key: 'espe',
    label: 'Espe house',
    names: ['Casa Espe', 'Ofício das Chancelas', 'Sala de Selos'],
    stock: [
      { kind: 'magic', weight: 3 },
      { kind: 'hybrid', weight: 3 },
    ],
    local: ['seal'],
    size: [5, 2],
    favoredBy: ['Espe', 'mágica', 'Arcana', 'eco-magos'],
    flavor: [
      'Atendimento por hora marcada; tudo é registrado em três vias.',
      'Recusa vender qualquer coisa sem saber o propósito.',
    ],
  },
  {
    key: 'dezolis-market',
    label: 'Border market (Dezolis)',
    names: ['Mercado de Borda', 'Barraca do Salão', 'Troca do Abrigo'],
    stock: [
      { kind: 'tech', weight: 2 },
      { kind: 'other', groups: ['Personal Items'], weight: 2 },
    ],
    local: ['dezolis'],
    size: [3, 8],
    favoredBy: [],
    settings: ['dezolis'],
    flavor: [
      'Comece a troca com gratidão e um gesto simbólico.',
      'Aceite o chá quente primeiro; recusar é recusar confiança.',
      'Peles, gordura e fungos luminosos por metal e remédios palmanianos.',
    ],
  },
  {
    key: 'kolian-exchange',
    label: 'Ritual exchange (Kor-Valen)',
    names: ['Troca Ritual', 'Sala de Oferendas', 'Balcão Selado'],
    stock: [{ kind: 'other', groups: ['Personal Items'], weight: 1 }],
    local: ['kolian'],
    size: [1, 6],
    favoredBy: [],
    settings: ['kolian'],
    flavor: [
      'Negociar sem oferenda simbólica (sal, água, tempo) é profanação.',
      'Tudo é negociado em gestos; palavras demais encerram a troca.',
    ],
  },
];

const g = (name: string, price: number, unit: string, tags: string, note?: string): LocalGood => ({
  name,
  price,
  unit,
  tags: tags.split(' '),
  note,
});

/** Algol goods (Biodiversidade de Motávia/Dezolis, Bíblia Koliana, Economia v3.0). Prices: ref. */
export const LOCAL_GOODS: LocalGood[] = [
  // comida e bebida (Economia: refeição pobre 1, comum 3, boa 5)
  g('Refeição simples (caldo de cave-shrimp e pão de fungo)', 1, 'prato', 'meal food'),
  g('Refeição comum (ensopado de larva de Krupp)', 3, 'prato', 'meal'),
  g('Boa refeição (carpa de Nirae grelhada)', 5, 'prato', 'meal'),
  g('Conserva de mirror shrimp', 4, 'pote', 'meal food'),
  g('Farinha de dune-hopper', 2, 'saco (1 kg)', 'food travel'),
  g('Carne salgada de kelp-rat', 2, 'porção', 'food travel'),
  g('Creme de larva de Krupp', 3, 'pote', 'food'),
  g('Ovos de skarn-pod', 2, 'dúzia', 'food'),
  g('Chá de espinho-sal', 1, 'caneca', 'drink herb'),
  g('Cerveja de fungo da Baixa', 1, 'caneca', 'drink'),
  g('Vinho de fungo de Listh-Moa', 12, 'garrafa', 'drink', 'Diz-se que provoca sonhos compartilhados.'),
  g('Destilado de resina (forte)', 4, 'dose dupla', 'drink'),
  g('Ração de viagem (3 dias)', 6, 'pacote', 'food travel'),
  g('Raiz-cisterna (água e comida)', 8, 'unidade', 'water food', 'Protegida por leis locais em alguns oásis.'),
  // hospedagem (Economia: mínimo 1, quarto simples 3)
  g('Esteira no dormitório comum', 1, 'noite', 'lodging'),
  g('Quarto simples', 3, 'noite', 'lodging'),
  g('Quarto bom com banho', 8, 'noite', 'lodging'),
  g('Baia para Krupp com ração', 4, 'noite', 'lodging krupp'),
  // viagem e água
  g('Cantil de quitina (2 L)', 3, 'unidade', 'travel water'),
  g('Odre de seda impermeável (10 L)', 12, 'unidade', 'travel water'),
  g('Água filtrada', 1, '4 litros', 'water'),
  g('Filtro de poeira para máscara', 5, 'unidade', 'travel parts'),
  g('Corda de junco-de-duna (15 m)', 2, 'rolo', 'travel'),
  g('Corda de seda de Sila-Weaver (15 m)', 15, 'rolo', 'travel silk', 'Leve e muito resistente.'),
  g('Lona de tenda de seda', 30, 'unidade', 'travel silk'),
  g('Lamparina de resina-vela', 2, 'unidade', 'fuel travel'),
  g('Barra de resina-vela (combustível)', 1, 'barra', 'fuel'),
  g('Óleo de Krupp (lamparina e cozinha)', 2, 'frasco', 'fuel krupp'),
  g('Cesto de junco reforçado', 2, 'unidade', 'travel'),
  g('Mapa de rota de caravana (copiado)', 10, 'folha', 'map travel'),
  g('Bússola de rota com marcas da Guilda', 18, 'unidade', 'travel'),
  // materiais e ofícios
  g('Placa de quitina de Krupp (bruta)', 6, 'placa', 'chitin parts'),
  g('Telha de quitina', 1, 'unidade', 'chitin'),
  g('Rolo de seda estrutural', 25, 'rolo', 'silk'),
  g('Seda adesiva (manejo)', 18, 'carretel', 'silk'),
  g('Resina de Duh-Ant (cola/limpeza)', 7, 'pote', 'parts', 'Corrosiva se mal diluída.'),
  g('Ácido de Duh-Ant diluído', 9, 'frasco', 'parts'),
  g('Fibra de junco-de-duna', 1, 'feixe', 'parts'),
  g('Sucata da Era das Maravilhas (lote)', 15, 'caixa', 'scrap', 'Pode conter algo útil.'),
  g('Componente antigo sem identificação', 35, 'peça', 'scrap relic'),
  g('Placa de circuito de satélite caído', 60, 'peça', 'scrap relic'),
  g('Célula de energia recondicionada', 40, 'unidade', 'parts', 'Carga incerta.'),
  // remédios e ervas
  g('Pasta de espinho-sal (conserva e assepsia)', 2, 'pote', 'herb medicine'),
  g('Raiz-serpente (febres comuns)', 4, 'maço', 'herb medicine'),
  g('Tônico contra febre de lodo (mud-leech)', 9, 'frasco', 'medicine'),
  g('Enzimas de larva (digestivo)', 3, 'frasco', 'medicine krupp'),
  g('Unguento de penas (plumagem motaviana)', 5, 'pote', 'medicine', 'Para muda irregular e ressecamento.'),
  g('Kit de primeiros socorros de caravana', 15, 'kit', 'medicine travel'),
  // animais e montarias (Economia: Krupp sem tabela ratificada — referência do gerador)
  g('Aluguel de Krupp de carga', 12, 'dia', 'krupp mount', 'Caução registrada na Guilda.'),
  g('Aluguel de Krupp de montaria', 10, 'dia', 'krupp mount'),
  g('Krupp jovem (não treinado)', 900, 'animal', 'krupp animal', 'ref. — sem tabela ratificada'),
  g('Krupp adulto treinado para carga', 2000, 'animal', 'krupp animal', 'ref. — o exemplo do compêndio usa 2.000 cr'),
  g('Sela e arreios para Krupp', 45, 'conjunto', 'krupp mount'),
  g('Ração de Krupp (semana)', 6, 'saco', 'krupp'),
  g('Larva de Krupp para engorda', 80, 'animal', 'krupp animal'),
  g('Sila-Weaver manejada (jovem)', 400, 'animal', 'animal', 'ref.'),
  g('Consulta de veterinária de Krupp', 8, 'visita', 'krupp'),
  // livros, mapas e relíquias
  g('Livro usado (tratado acadêmico)', 6, 'volume', 'book'),
  g('Caderno de expedição de terceiros', 20, 'caderno', 'book map', 'Às vezes com anotações valiosas.'),
  g('Dicionário Shen’Motav–Palmaniano', 14, 'volume', 'book'),
  g('Cópia de inscrição da Era das Maravilhas', 25, 'folha', 'book relic'),
  g('Mapa incompleto dos Subníveis', 30, 'folha', 'map'),
  g('Mapa "verdadeiro" de um oásis perfeito', 120, 'folha', 'map relic', 'Provavelmente falso.'),
  g('Fragmento de ruína com selo antigo', 50, 'peça', 'relic'),
  g('Cristal fosco que esquenta ao toque', 90, 'peça', 'relic', 'A Custódia gostaria de ver isto.'),
  g('Moeda antiga de Palma', 40, 'moeda', 'relic'),
  // selos (Ordem Espe)
  g('Certificação de documento (Selo de Integridade)', 20, 'documento', 'seal'),
  g('Consulta técnica do Ofício das Chancelas', 35, 'hora', 'seal'),
  // munição local
  g('Munição recarregada à mão', 3, '10 projéteis', 'ammo', 'Funciona… quase sempre.'),
  // Dezolis
  g('Pele de Varruk curtida', 30, 'pele', 'dezolis'),
  g('Gordura de Sílth (lamparina)', 4, 'pote', 'dezolis fuel'),
  g('Lã de Gorveth', 12, 'novelo', 'dezolis'),
  g('Pão de Thrum', 1, 'pão', 'dezolis food meal'),
  g('Caldo quente do Salão do Fogo', 1, 'tigela', 'dezolis meal'),
  g('Ensopado de Grol com Khardroot', 3, 'prato', 'dezolis meal'),
  g('Véyl-run defumado', 4, 'prato', 'dezolis meal'),
  g('Sopa de Lumshr ("luz viva")', 3, 'tigela', 'dezolis meal'),
  g('Leite espesso de Varruk', 1, 'caneca', 'dezolis drink'),
  g('Chá de Warmbloom', 1, 'caneca', 'dezolis drink herb'),
  g('Leito na Casa Quente', 2, 'noite', 'dezolis lodging'),
  g('Toca de hóspede no Anel de Moradia', 4, 'noite', 'dezolis lodging'),
  g('Cogumelo-lanterna (Lumin)', 3, 'unidade', 'dezolis'),
  g('Luz viva de Lumshr (pote)', 6, 'pote', 'dezolis'),
  g('Tônico de Pyrlin (frio e fadiga)', 7, 'frasco', 'dezolis medicine'),
  g('Bagas de Auralis em conserva', 9, 'pote', 'dezolis food'),
  g('Ferramenta de osso de Thássar', 8, 'peça', 'dezolis'),
  g('Aluguel de trenó de Nívora', 15, 'dia', 'dezolis mount'),
  g('Guia de nevasca', 20, 'dia', 'dezolis'),
  // Kit de Arqueólogo (Piata) — wiki "Equipamentos e Itens", preços canônicos
  g(
    'Bandoleira de Ampolas (Padrão Piata)',
    20,
    'unidade',
    'kit travel',
    'Até 8 ampolas; sacar faz parte do movimento.',
  ),
  g('Ampola Antiesporo', 75, 'ampola', 'kit medicine', 'Medicinal tier 1: +4 contra doenças por 2 dias.'),
  g('Ampola Tremor-Calm', 75, 'ampola', 'kit medicine', 'Sedativo leve; novo teste contra medo com +1.'),
  g('Ampola Neutralizadora', 25, 'ampola', 'kit medicine parts', '+4 para encerrar corrode/burning.'),
  g('Ampola Selante Resina-Vela', 100, 'ampola', 'kit parts', '+2 no próximo Engineering de reparo/vedação.'),
  g('Ampola Fixadora de Amostras', 30, 'ampola', 'kit', '+2 em Life Science para aquela amostra.'),
  g('Ampola Corante de Trilhas (Dye-Lumen)', 25, 'ampola', 'kit travel map', 'Marca rotas: ⚠ → ◎ ✗'),
  g('Cordão de Cristais Lúmen (3 m)', 5, 'cordão', 'kit travel fuel', 'Luz fria que muda de cor.'),
  g('Conjunto de Campo – Piata (Básico)', 250, 'kit', 'kit travel', 'Bandoleira + 1 de cada ampola + cordão Lúmen.'),
  // Linha de Campo Piata (Tecnologia e relação com Aiedo) — preços: ref.
  g('Filtro de expedição Linha de Campo Piata', 60, 'unidade', 'kit parts travel', 'Robusto, reparo simples.'),
  g('Sensor ambiental portátil (Linha de Campo)', 150, 'unidade', 'kit parts', 'Água, ar e solo; documentação clara.'),
  // Consumíveis clássicos de Phantasy Star = séruns de cura do Starfinder (preço SF)
  g('Monomate (sérum de cura Mk 1)', 50, 'dose', 'mate medicine', 'Cura 1d8 PV.'),
  g('Dimate (sérum de cura Mk 2)', 450, 'dose', 'mate medicine', 'Cura 3d8 PV.'),
  g('Trimate (sérum de cura Mk 3)', 3000, 'dose', 'mate medicine', 'Cura 6d8 PV. Raro fora de Piata e Aiedo.'),
  g('Antídoto (antitoxina tier 1)', 75, 'dose', 'mate medicine', 'Como o medicinal antitoxin.'),
  g('Star Dew (restauração de grupo)', 900, 'frasco', 'mate medicine', 'ref. — raríssimo; o mestre define o efeito.'),
  // Kolianos
  g('Sal ritual de Kor-Nareth', 5, 'saquinho', 'kolian', 'Oferenda para iniciar qualquer troca.'),
  g('Cristal de Kol-Tarim (pequeno)', 70, 'peça', 'kolian'),
  g('Máscara filtrante de Kol-Tarim', 25, 'unidade', 'kolian travel'),
  g('Água de rito (lacrada)', 2, 'frasco', 'kolian'),
];
