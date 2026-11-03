/**
 * NPC tables (pt-BR, campaign content). Sources: Guilda dos Caçadores, Piata (distritos, Baixa,
 * Universidade, Guarda/Custódia), Economia v3.0 (ocupações e rendas), Bíblias motaviana, koliana
 * e dezoliana, Themes Compilados de Algol. One entry per line.
 */
const lines = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

export type Race = 'Palmaniano' | 'Motaviano' | 'Koliano' | 'Dezoliano' | 'Esper' | 'Andróide';

/** Every race, in display order (also the keys of the portrait profiles). */
export const RACES: readonly Race[] = ['Palmaniano', 'Motaviano', 'Koliano', 'Dezoliano', 'Esper', 'Andróide'];

/** Who you meet where. */
export const RACE_WEIGHTS: Record<'motavia' | 'piata' | 'kolian' | 'dezolis', readonly (readonly [Race, number])[]> = {
  motavia: [
    ['Palmaniano', 46],
    ['Motaviano', 46],
    ['Esper', 2],
    ['Andróide', 2],
    ['Dezoliano', 2],
    ['Koliano', 2],
  ],
  piata: [
    ['Palmaniano', 50],
    ['Motaviano', 44],
    ['Esper', 2],
    ['Andróide', 2],
    ['Dezoliano', 2],
  ],
  kolian: [
    ['Koliano', 85],
    ['Motaviano', 12],
    ['Palmaniano', 3],
  ],
  dezolis: [
    ['Dezoliano', 75],
    ['Palmaniano', 20],
    ['Esper', 5],
  ],
};

export const PROFESSIONS: Record<string, string[]> = {
  Guilda: lines(`
    Caçador regular da Guilda
    Caçadora veterana em semi-aposentadoria
    Registradora de contratos
    Escrivão da Casa Regional
    Despachante do Pátio de Contratos
    Mediador de disputas contratuais
    Avaliador de recompensas
    Instrutor de recrutas
    Guarda de depósito da Guilda
    Atendente do quadro de trabalhos
    Auditor de cartas de crédito
    Batedor de rotas
    Rastreador de feras
    Caçador de recompensas registrado
    Agente de contratos confidenciais
    Cuidadora de Krupp da Guilda
    Enfermeiro da enfermaria da Guilda
    Cartógrafa da Guilda
    Armeiro da Guilda
    Recrutadora itinerante
    Contador de recompensas
    Guarda-costas contratado pela Guilda
    Caçador novato no primeiro contrato
    Taxidermista de feras abatidas
    Mensageira do Pátio de Contratos
  `),
  Universidade: lines(`
    Professor estabelecido de arqueologia
    Pesquisadora em início de carreira
    Técnico de laboratório
    Bolsista de pós-graduação
    Estudante de primeiro ano
    Arquivista do Grande Arquivo
    Restauradora de documentos
    Tradutor de inscrições antigas
    Assistente de campo de expedição
    Engenheira da Faculdade de Engenharia
    Guarda da Custódia Acadêmica
    Agente do Corpo de Contenção
    Bibliotecária de coleções especiais
    Cartógrafo acadêmico
    Linguista histórica
    Diretor de instituto
    Secretário de departamento
    Técnica do Instituto de Preservação e Contenção
    Professor célebre e polêmico
    Professora visitante de Aiedo
    Monitor de laboratório
    Zelador da Colina dos Institutos
    Estudante reprovado pela terceira vez
    Paleontóloga de bestas extintas
    Ilustrador científico
    Pesquisadora de biomas áridos
    Curador de acervo
  `),
  Comércio: lines(`
    Comerciante do Mercado da Baixa
    Vendedora de mapas
    Livreiro da Rua dos Livreiros
    Encadernador
    Negociante de fragmentos antigos
    Dona de hospedaria
    Taberneiro
    Cozinheira de barraca de rua
    Mercador de caravana
    Atacadista de quitina
    Vendedor de suprimentos de campo
    Armeiro licenciado
    Penhorista
    Comprador de sucata
    Importadora de peças de Aerodyn
    Cambista de cartas de crédito
    Dono de casa de chá
    Vendedora de lembranças
    Fornecedor de água e filtros
    Vendedor ambulante de água
    Mercadora de tecidos
    Revendedor de livros usados
    Leiloeira
    Transportador de encomendas
    Dono de bazar de peças
    Vendedora de especiarias
    Vendedor de passagens de caravana
    Lojista de roupas de viagem
    Doceira de raiz-cisterna
  `),
  Ofícios: lines(`
    Mecânico de sucata
    Ferreira de quitina
    Tecelã de seda de Sila-Weaver
    Curtidor de couro de lagarto
    Artesão de vidro
    Relojoeiro de mecanismos antigos
    Eletricista de bairro
    Técnica dos Aquedutos
    Mantenedor de bombas d’água
    Reparadora de drones
    Construtor de telhados de quitina
    Ourives
    Fabricante de lamparinas de resina-vela
    Cordoeiro de junco-de-duna
    Oleira
    Montador de filtros de poeira
    Alfaiate de roupas para motavianos
    Sapateira de calçados para garras
    Luveiro de luvas para cinco dedos com garras
    Pedreira de reconstrução
    Pintor de letreiros
    Carpinteiro de sucata
    Soprador de vidro
    Ceramista de cisternas
    Restauradora de mosaicos antigos
    Ferramenteiro
  `),
  Caravanas: lines(`
    Condutor de Krupp
    Criador de Krupp
    Chefe de caravana
    Vigia de caravana
    Médico de caravana
    Cozinheiro de caravana
    Carregador do Portão das Caravanas
    Guia do deserto
    Cartógrafa do deserto
    Ferrador de patas de Krupp
    Leiloeiro de animais de carga
    Domador de Sila-Weaver
    Apicultor de colmeia Duh-Ant
    Batedora de dunas
    Guarda de poço de parada
    Conferente de carga
    Remendeiro de arreios
    Intérprete de caravana
    Aprendiz de condutor de Krupp
    Ferreiro ambulante
  `),
  Submundo: lines(`
    Contrabandista de relíquias
    Guia de subnível
    Falsificador de documentos
    Apostador profissional
    Batedor de carteira
    Receptadora do mercado cinza
    Informante da Guarda Cívica
    Agiota
    Mergulhador de ruínas sem licença
    Vendedor de "curas milagrosas"
    Chefe de gangue de bairro
    Saqueador de satélites caídos
    Ex-cultista arrependido
    Contrabandista de água
    Guia clandestina de ruínas
    Vigarista de leilões
    Cobrador de dívidas
    Ladra de arquivos
    Vendedor de identidades
    Dono de casa de apostas em corridas de dune-hopper
  `),
  Fé: lines(`
    Sacerdote do Solarismo
    Pregadora itinerante
    Guardião de santuário de oásis
    Monge da Ordem do Véu
    Cartomante celeste de Duh'Rakka
    Acólito da Fé das Estruturas Vivas
    Peregrino de Kor-Nareth
    Curandeira tradicional
    Leitor de presságios
    Guardiã de cisterna sagrada
    Cantor de rituais de colheita
    Eremita do deserto
    Zeladora de memorial de caravanas
  `),
  'Ordem Espe': lines(`
    Escrivão do Ofício das Chancelas
    Forjador de selos
    Espe de campo
    Conservador de relíquias
    Teórico do Axioma
    Adepto da Convergência
    Representante da Casa Espe de Piata
  `),
  Governo: lines(`
    Oficial da Guarda Cívica
    Investigadora da Guarda Cívica
    Magistrado do Tribunal Superior
    Defensora de Piata
    Procurador da Carta
    Fiscal da Controladoria
    Representante de distrito
    Coletor de taxas
    Inspetor de caravanas
    Funcionária da administração civil
    Carteiro da administração civil
    Sentinela de muralha
    Escrivã do registro civil
    Avaliador de imóveis
    Inspetora sanitária de poços
  `),
  Saúde: lines(`
    Médica do Hospital Velho
    Enfermeiro dos Pavilhões Brancos
    Farmacêutica
    Cirurgião de campo aposentado
    Veterinária de Krupp
    Herborista de espinho-sal
    Biotecnóloga clínica
    Parteira
    Boticário
    Curandeira de plumas (muda e parasitas das penas)
    Massagista de caravaneiros
    Médico da Guilda
  `),
  Campo: lines(`
    Agricultor de corredor verde
    Coletora de raiz-cisterna
    Pescador de Nirae
    Cultivador de fungos subterrâneos
    Salineiro
    Caçador de glass-lizard
    Criadora de salt-snail
    Pastor de dune-hopper
    Guarda de oásis
    Poceiro
    Pastora de Krupp
    Vigia de corredor verde
    Reparador de canais de irrigação
    Coletora de resina-vela
    Cuidador de estufa antiga
    Caçadora de pragas de lavoura
  `),
  Dezolis: lines(`
    Guardião do Salão do Fogo
    Curtidor de pele de Thássar
    Condutor de trenó de Nívora
    Vigia de Posto de Neve
    Pescador de Véyl-run
    Cultivador de Thrum
    Cuidadora da Casa Quente
    Sacerdote dezoliano
    Guia de nevasca
    Observador do Véu
    Negociante do Mercado de Borda
  `),
  Kolianos: lines(`
    Enash (Guarda do Silêncio)
    Zahl'Tor (Guardião do Eco)
    Vorr'Tal (Voz Antiga)
    Valen'Duur (Povo da Porta)
    Kol'Zahl exilado
    Mineiro de cristais de Kol-Tarim
    Peregrino de sal
  `),
  Tecnologia: lines(`
    Técnico acadêmico
    Restaurador de máquinas da Era das Maravilhas
    Programadora de sistemas antigos
    Operador de comunicador de subespaço
    Mecânica de veículos
    Observador de satélites caídos
    Engenheiro de clima
    Técnica de iluminação pública
    Reparador de terminais antigos
    Operadora de bomba de aquífero
    Catalogador de peças da Era das Maravilhas
    Aprendiz de engenharia
    Técnica de comunicação da Guilda
  `),
};

export const PROFESSION_SECTORS_BY_SETTING: Record<'motavia' | 'piata' | 'kolian' | 'dezolis', string[]> = {
  motavia: [
    'Guilda',
    'Comércio',
    'Ofícios',
    'Caravanas',
    'Submundo',
    'Fé',
    'Governo',
    'Saúde',
    'Campo',
    'Tecnologia',
    'Ordem Espe',
  ],
  piata: [
    'Universidade',
    'Universidade',
    'Guilda',
    'Comércio',
    'Ofícios',
    'Submundo',
    'Governo',
    'Saúde',
    'Tecnologia',
    'Ordem Espe',
    'Caravanas',
  ],
  kolian: ['Kolianos', 'Kolianos', 'Fé', 'Campo', 'Ofícios'],
  dezolis: ['Dezolis', 'Dezolis', 'Comércio', 'Saúde', 'Fé'],
};

export type Sex = 'm' | 'f';

/** Race as written in the text, by sex (the race key itself stays masculine: it names the portrait profile). */
export const RACE_LABEL: Record<Race, Record<Sex, string>> = {
  Palmaniano: { m: 'Palmaniano', f: 'Palmaniana' },
  Motaviano: { m: 'Motaviano', f: 'Motaviana' },
  Koliano: { m: 'Koliano', f: 'Koliana' },
  Dezoliano: { m: 'Dezoliano', f: 'Dezoliana' },
  Esper: { m: 'Esper', f: 'Esper' },
  Andróide: { m: 'Andróide', f: 'Andróide' },
};

/** [masculine, feminine]. */
export const AGES: readonly (readonly [string, string])[] = [
  ['jovem, ainda aprendendo o ofício', 'jovem, ainda aprendendo o ofício'],
  ['recém-adulto, cheio de energia', 'recém-adulta, cheia de energia'],
  ['adulto, firme na profissão', 'adulta, firme na profissão'],
  ['no auge da carreira', 'no auge da carreira'],
  ['na meia-idade, cansado mas competente', 'na meia-idade, cansada mas competente'],
  ['maduro, com décadas de estrada', 'madura, com décadas de estrada'],
  ['idoso, respeitado pela memória que guarda', 'idosa, respeitada pela memória que guarda'],
  ['velho demais para o ofício e teimoso demais para parar', 'velha demais para o ofício e teimosa demais para parar'],
  ['de idade difícil de adivinhar', 'de idade difícil de adivinhar'],
  ['adolescente que mente a idade para conseguir trabalho', 'adolescente que mente a idade para conseguir trabalho'],
];

/** Motavianos amadurecem por volta dos 16 e podem passar dos 100 (Bíblia v1.2). */
export const MOTAVIAN_AGES: readonly (readonly [string, string])[] = [
  ['ancião de mais de cem anos, plumagem rala da muda', 'anciã de mais de cem anos, plumagem rala da muda'],
  [
    'recém-chegado à maturidade, com penas de muda ainda à mostra',
    'recém-chegada à maturidade, com penas de muda ainda à mostra',
  ],
];

export const ANDROID_AGES: readonly string[] = [
  'fabricado antes do colapso, ainda com peças originais',
  'montado há poucos anos com peças de várias épocas',
  'em serviço há mais tempo do que os próprios registros lembram',
  'reativado recentemente depois de décadas desligado',
];

/** Motavianos: marrom comum, azul rara, verde raríssima (Bíblia Motavianos v1.2). */
export const MOTAVIAN_PLUMAGE: readonly (readonly [string, number])[] = [
  ['plumagem marrom-areia com pontas ocre', 10],
  ['plumagem sépia densa', 10],
  ['plumagem castanho-escura com manchas claras no peito', 10],
  ['plumagem marrom-ocre, mais clara no pescoço', 10],
  ['plumagem cor de areia escura, quase dourada ao sol', 8],
  ['plumagem castanha desbotada pela muda', 8],
  ['plumagem marrom com faixas sépia na cauda', 8],
  ['rara plumagem azul-ardósia, que atrai olhares', 5],
  ['rara plumagem azul-profunda, de brilho frio', 4],
  ['rara plumagem azul-acinzentada', 4],
  ['raríssima plumagem verde-oliva', 1],
  ['raríssima plumagem verde-acinzentada', 1],
];

/** Appearance by race (any sex). Motavian plumage colour comes from MOTAVIAN_PLUMAGE. */
export const APPEARANCE: Record<Race, string[]> = {
  Palmaniano: lines(`
    cabelos curtos e grisalhos nas têmporas
    trança longa presa com fita de seda
    pele bronzeada de estrada e olhos claros
    sardas e um sorriso fácil
    cicatriz fina atravessando a sobrancelha
    óculos remendados com arame
    tatuagem de rota de caravana no antebraço
    mãos manchadas de tinta
    roupas de linho claras e lenço contra poeira
    casaco de quitina gasto nos cotovelos
    cabeça raspada e brincos de cobre
    postura rígida de quem já foi da Guarda
    luvas de trabalho que nunca tira
    olhar cansado e roupas impecáveis
    cabelo azul tingido, moda estudantil
    anel de sinete de família antiga
    bengala de liga leve que talvez esconda algo
    capa com o brasão da Universidade
    botas de deserto quase novas demais
    cabelos cacheados presos num coque espetado com um lápis
    pele escura e olhar firme
    rugas de sol nos cantos dos olhos
    nariz quebrado mais de uma vez
    cabelo ruivo queimado de sol
    marcas de queimadura de solda nas mãos
    três argolas de cobre numa orelha só
    cabelo comprido e solto, sempre com areia
    corte curto recém-feito, de quem quer causar boa impressão
    lenço colorido amarrado na cabeça
    camisa de algodão bordada no estilo da Baixa
    óculos de proteção contra areia na testa
    avental de couro cheio de bolsos
    colar com um fragmento de vidro antigo
    manca levemente de uma perna
    braços fortes de carregador
    dedos finos de quem escreve o dia todo
    manto de viagem cor de areia
    olhos de cores diferentes
    laterais raspadas e uma trança no alto da cabeça
    roupas no corte de Aiedo, chamativas em Piata
    uniforme da Guarda Cívica mal abotoado
    rosto redondo e bochechas sempre vermelhas de sol
    alto e magro, curva-se para passar nas portas
    baixo e largo, firme como um poste
    pele marcada por uma antiga febre de poeira
    unhas pretas de graxa
  `),
  Motaviano: lines(`
    bico curto, marcado por uma lasca antiga
    bico longo e muito curvo
    bico com a ponta {gasta|polida|pintada de ocre}
    orelhas enormes com {um brinco de quitina|argolas de cobre|uma fita amarrada na base}
    orelhas altas, uma delas com um entalhe antigo
    orelhas que se abaixam quando desconfia
    orelhas sempre em pé, atentas a tudo
    garras pintadas de ocre
    garras aparadas rente para trabalho fino
    garras longas e bem cuidadas, motivo de vaidade
    cauda emplumada que trai cada emoção
    penas da cauda presas por um anel de cobre
    cauda curta por um acidente antigo
    gira a cabeça para trás sem virar o corpo
    manto de penas cheio e bem cuidado
    penas desalinhadas de quem dormiu na estrada
    olhos âmbar muito expressivos
    olhos escuros e atentos
    olhos claros, quase dourados
    porte baixo e robusto, mãos de trabalho
    mãos ágeis de cinco dedos, sempre ocupadas
    luvas cortadas sob medida para as garras
    colete com abertura bordada para a cauda
    penas do rosto ralas por uma queimadura antiga
    poeira de estrada presa no manto de penas
    uma única pena de cor diferente que nunca cai na muda
    tabardo azul e creme da Universidade sobre o manto de penas
    botas largas de couro, feitas para pés com garras
    lenço contra poeira enrolado sob o bico
    óculos de proteção encaixados entre as orelhas
    corpo compacto e pesado, passos firmes
    penas do peito {mais claras|com manchas escuras|em listras finas}
    cicatriz que abre uma falha nas penas do braço
    manto de penas curto, cortado para o calor
    avental de oficina com bolsos para as garras
    capa de viagem com capuz alargado para as orelhas
    pés com garras gastas de tanto andar
    porte largo, maior que a média dos motavianos
    anda sempre um pouco inclinado para frente
    penas eriçadas quando ri
  `),
  Koliano: lines(`
    marca de sal escuro na garganta (voto de silêncio)
    tatuagem Kora'Skir de espiral no antebraço
    plumagem acinzentada e cerimonial
    máscara filtrante de Kol-Tarim pendurada no pescoço
    olhar fixo que evita conversas longas
    túnica de pedra e sal com bordas ranhuradas
    linhas de teste tatuadas no antebraço (Kol-Tor)
    gestos lentos e precisos, quase rituais
    poeira de sal nas dobras da roupa
    contas de cristal de Kol-Tarim no pulso
  `),
  Dezoliano: lines(`
    pele pálida acinzentada e olhos muito claros
    casaco de pele de Varruk com gola dupla
    gorro de lã de Gorveth sempre na cabeça
    risada alta e contagiante
    mãos calejadas de trenó
    cheiro de fumaça do Salão do Fogo
    colar de dentes de Kharv
    roupas em camadas mesmo no calor de Motávia
    queimado de sol, nada acostumado ao calor
    bebe água o tempo todo e reclama do calor
  `),
  Esper: lines(`
    olhar distante, como quem ouve algo
    manto simples com bordado antigo de Lutz
    cabelos prateados precocemente
    pulseira de cristal que brilha levemente
    fala baixa e escolhe cada palavra
    mãos sempre frias
    parece saber o nome das pessoas antes de ouvi-lo
  `),
  Andróide: lines(`
    carcaça polida com reparos visíveis
    voz sintetizada calma demais
    olhos ópticos que mudam de cor ao pensar
    placa de identificação riscada à mão
    roupas sobre a carcaça para parecer mais pessoa
    movimento perfeito, sem um passo fora do lugar
    uma das mãos substituída por peça de outro modelo
    zumbido baixo quando processa algo difícil
  `),
};

/** Appearance only one sex has (Motavianas: plumas longas da cabeça; Bíblia v1.2 §dimorfismo). */
export const APPEARANCE_BY_SEX: Partial<Record<Race, Record<Sex, string[]>>> = {
  Palmaniano: {
    m: lines(`
      barba bem aparada e voz grave
      bigode enorme e muito bem cuidado
      barba por fazer de três dias
    `),
    f: lines(`
      cabelo preso em duas tranças de viagem
      brincos longos de vidro colorido
    `),
  },
  Motaviano: {
    m: lines(`
      pequenas plumas ornamentais na nuca
      bico pronunciado, marcado de cicatrizes
      silhueta angulosa e cauda estreita
    `),
    f: lines(`
      plumas longas da nuca presas em feixes laterais
      cascata de plumas com contas de vidro
      plumas presas para trás num arranjo de jornada
      plumas trançadas com fitas de seda de Sila-Weaver
      plumas da cabeça curtas, cortadas por praticidade
      plumas longas presas por uma presilha de cobre
      manto de penas cheio no pescoço e nos ombros
    `),
  },
};

export const TRAITS = lines(`
  meticuloso, anota tudo
  falante, conta histórias sem parar
  desconfiado de forasteiros
  generoso até demais com estranhos
  pragmático: "quanto custa e quanto rende?"
  orgulhoso do próprio bairro
  irônico, sempre com uma piada seca
  tímido até falar do seu assunto preferido
  apressado, vive atrasado
  calmo como água de oásis
  competitivo, transforma tudo em aposta
  devoto e supersticioso
  cético com qualquer coisa "mística"
  curioso, faz perguntas demais
  leal à Guilda acima de tudo
  rancoroso, nunca esquece uma dívida
  idealista, acredita que dá para salvar todos
  cínico depois de muitas perdas
  formal, segue o protocolo à risca
  improvisador nato
  medroso, mas honesto sobre isso
  impulsivo e corajoso
  ambicioso, quer subir a Escadaria
  nostálgico da "Piata de antigamente"
  bem-humorado no pior momento
  paranoico com o Corpo de Contenção
  vaidoso com a aparência
  protetor dos mais jovens
  direto, quase rude
  diplomático, nunca diz "não" de frente
  avarento, regateia tudo
  distraído com detalhes técnicos
  teimoso como um Krupp
  gentil com animais, áspero com pessoas
  obcecado por ruínas antigas
  sério e silencioso
  entusiasmado com qualquer novidade de Aerodyn
  fofoqueiro, sabe da vida de todo mundo
  disciplinado, rotina rígida
  sentimental, chora fácil
  vingativo em silêncio
  justo, mesmo quando custa caro
  orgulhoso da origem humilde
  esnobe com quem não estudou
  carismático, todos gostam dele
  solitário por escolha
  trabalhador incansável
  preguiçoso, mas brilhante
  ansioso, fala rápido quando nervoso
  sereno, parece já ter visto tudo
  hospitaleiro, insiste que você coma algo
  econômico com a água até em casa
  orgulhoso dos consertos que fez
  desconfia de qualquer coisa nova demais
  romântico incurável
  mandão, mesmo sem cargo nenhum
  covarde que se acha corajoso
  honesto até atrapalhar os negócios
  mentiroso por hábito, mesmo sem motivo
  paciente como quem espera tempestade passar
  rabugento de manhã, ótimo à noite
  generoso com crianças, duro com adultos
  colecionador compulsivo
  sabe-tudo, corrige todo mundo
  reservado sobre o passado
  festeiro, conhece todas as tavernas
  religioso discreto, reza antes de qualquer viagem
  prático: conserta antes de reclamar
  invejoso do sucesso alheio
  grato a quem o ajudou uma vez, para sempre
  orgulhoso de nunca ter saído da cidade
  inquieto, não para no mesmo lugar
  observador, fala pouco e vê tudo
  bajulador com quem tem poder
  rebelde com qualquer autoridade
  conciliador, separa brigas
  dramático, tudo vira tragédia
  sensato, a voz da razão do bairro
  obstinado com regras de segurança
  curioso por forasteiros e suas histórias
`);

export const MOTIVATIONS = lines(`
  pagar uma dívida antiga com a Guilda
  juntar créditos para comprar o próprio Krupp
  ser aceito na Universidade
  provar uma teoria que todos ridicularizam
  encontrar um parente desaparecido no deserto
  proteger o bairro de uma gangue
  descobrir quem falsificou suas cartas de crédito
  limpar o nome da família
  sair de Piata e conhecer Aiedo
  recuperar uma relíquia vendida por engano
  manter um segredo enterrado nos Subníveis
  vingar um irmão morto por Skelgra
  conseguir um contrato restrito da Guilda
  abrir a própria loja
  curar uma doença que os médicos não entendem
  ganhar respeito no Pátio de Contratos
  decifrar uma inscrição da Era das Maravilhas
  esconder a origem koliana
  voltar para casa em Dezolis antes do inverno
  descobrir por que o oásis da família secou
  fugir de um contrato que não pode cumprir
  ser lembrado como herói
  conseguir uma bolsa para o filho
  provar que não é apenas "o assistente"
  proteger um animal raro da caça
  reconstruir uma vila destruída
  denunciar corrupção na Controladoria
  entender os sonhos estranhos que tem tido
  vender um mapa antes que alguém mais perceba o valor
  ser o primeiro a entrar numa instalação antiga
  manter a caravana viva até a próxima cidade
  recuperar o Krupp roubado
  quitar o aluguel no Bairro dos Estudantes
  aprender um ofício antes que seja tarde
  descobrir quem petrificou o vizinho
  garantir água para a família durante a seca
  casar com alguém que a família não aprova
  comprar a licença de caçador que perdeu
  terminar a tese antes que o orientador se aposente
  reabrir a oficina do pai
  encontrar a rota antiga que aparece num mapa de família
  ser promovido na Guarda Cívica
  pagar o tratamento de um amigo no Hospital Velho
  reencontrar o grupo de caravana que o abandonou
  convencer o bairro a consertar a cisterna
  provar que uma máquina antiga ainda funciona
  devolver algo que roubou há muitos anos
  ganhar a corrida anual de dune-hoppers
  ensinar a próxima geração antes de se aposentar
  descobrir o que há atrás de uma porta lacrada nos Subníveis
  livrar-se de um sócio desonesto sem escândalo
  conseguir um lugar fixo no Mercado da Baixa
  publicar um livro com as histórias do deserto
  achar um remédio para a muda difícil de um parente
  sair do mercado cinza de vez
  ver o mar de Nirae com os próprios olhos
  recuperar a honra perdida diante da Guilda
  juntar a família espalhada por três cidades
`);

export const QUIRKS = lines(`
  sempre oferece chá de espinho-sal
  conta créditos em voz alta
  coleciona fragmentos de vidro antigo
  cita ditados da Guilda o tempo todo
  fala com o próprio Krupp como se fosse gente
  usa palavras em Shen'Motav no meio das frases
  nunca senta de costas para a porta
  rabisca mapas em qualquer superfície
  cheira a resina-vela
  tem um tique de bater duas vezes no peito (gesto koliano)
  chama todo mundo de "colega"
  ri antes de terminar as próprias piadas
  carrega um amuleto de quitina "da sorte"
  só aceita pagamento em moedas, nunca carta
  corrige a pronúncia dos outros
  come mirror shrimp em conserva o dia inteiro
  repete "isso não é da minha conta" e se mete mesmo assim
  guarda tudo em potinhos rotulados
  assobia músicas da Baixa
  não suporta silêncio
  coleciona histórias de fantasmas dos Subníveis
  desconfia de qualquer coisa vinda de Aerodyn
  tem um drone velho que o segue
  usa um relógio que está sempre atrasado
  faz perguntas como se fosse prova de faculdade
  nunca diz o próprio nome inteiro
  acaricia as próprias plumas quando mente
  responde perguntas com outras perguntas
  insiste em pagar a próxima rodada
  conhece todos os atalhos do Distrito das Caravanas
  sacode a poeira das roupas a cada cinco minutos
  dá apelido a todas as ferramentas
  confere o céu antes de responder qualquer coisa
  fala sozinho enquanto trabalha
  sempre chega com um presente pequeno
  arruma objetos dos outros sem pedir
  conta a mesma história de caravana a todo mundo
  pede recibo de tudo, até de favores
  nunca bebe água na frente dos outros
  mastiga raiz-cisterna o tempo todo
  anota o nome de todo mundo que conhece
  tamborila os dedos na mesa quando pensa
  só confia em quem aperta a mão com firmeza
  termina toda negociação com um ditado
  troca de assunto quando mencionam a família
  leva sempre um guarda-sol, faça o tempo que fizer
  usa óculos que não precisa, para parecer estudado
  faz reverência exagerada a professores
  canta baixinho quando está com medo
  cumprimenta os Krupps antes das pessoas
  esconde moedas em lugares diferentes do corpo
  lembra o preço de tudo de dez anos atrás
  limpa as unhas com uma faquinha durante conversas
  faz contas no ar com o dedo
`);

export const SECRETS = lines(`
  deve dinheiro a um agiota do mercado cinza
  já vendeu peças retiradas de uma escavação protegida
  é informante da Guarda Cívica
  escondeu um artefato que brilha à noite
  tem um parente no culto e não sabe o que fazer
  falsificou a própria carta de recomendação
  viu algo nos Subníveis que ninguém acreditaria
  é Kol'Zahl e esconde o dom
  sabe onde fica uma instalação SEED abandonada
  abandonou um contrato e um colega morreu por isso
  trabalha para um professor rival em segredo
  tem febres desde que tocou um cristal estranho
  é procurado em Aiedo com outro nome
  sabotou a carga de um concorrente
  guarda o diário de um pesquisador desaparecido
  ouve "vozes da névoa" quando dorme
  recebeu dinheiro para atrasar uma caravana
  é casado em duas cidades
  conhece a senha de um depósito antigo da Universidade
  esconde um animal SEED que considera inofensivo
  pegou um mapa do Corredor dos Fragmentos que mostra Nirae diferente
  já foi Enash em Kol-Tor
  sabe quem está falsificando créditos
  perdeu a licença de caçador e trabalha mesmo assim
  tem uma dívida de honra com um dezoliano
  desvia um pouco de água da cisterna do bairro toda semana
  não sabe ler e esconde isso de todo mundo
  é filho ilegítimo de uma família importante do Alto de Piata
  vende informações sobre caravanas a saqueadores
  guarda no porão uma máquina da Era das Maravilhas que ainda liga
  matou uma pessoa em legítima defesa e nunca contou
  é o verdadeiro autor de uma tese famosa que outro assinou
  ajudou a esconder um fugitivo da Custódia
  está doente e não contou para a família
  fez um acordo com um contrabandista para quitar uma dívida
  sabe que o poço da vila vai secar em um ano
  foi expulso da Universidade por algo que não fez
  tem um irmão gêmeo que leva uma vida criminosa
  roubou a ideia do próprio mestre
  é espião de uma casa comercial de Aiedo
  esconde cartas de alguém que já morreu
  sabe onde está o Krupp roubado que todos procuram
  provocou o incêndio que destruiu a antiga loja do rival
  é muito mais rico do que aparenta
  esqueceu um parceiro nas ruínas e ele ainda está lá
  forja relíquias e as vende como autênticas
  ouviu uma conversa da Controladoria que não devia
  recebe cartas de alguém que assina só com um símbolo
`);

export const VOICE = lines(`
  fala devagar, pesando cada palavra
  voz rouca de poeira
  sotaque arrastado do deserto (Shaa'Vel)
  sotaque florido de corredor verde (Lirr'Yenn)
  frases curtas e duras (Dur'Kesh)
  palavras coladas, quase sibilando (Zenn'Ash)
  ri alto e interrompe
  sussurra como se alguém ouvisse
  usa termos técnicos demais
  formal, sempre "senhor" e "senhora"
  gesticula muito
  quase não fala; responde com gestos
  voz aguda que sobe quando se empolga
  fala alto, acostumado ao barulho das oficinas
  pausa longa antes de cada resposta
  fala rápido e engole o fim das palavras
  voz calorosa de contador de histórias
  tom de professor, mesmo quando ninguém perguntou
  fala em tom de fofoca, sempre confidencial
  pigarreia antes de cada frase importante
  voz monótona que esconde bom humor
  repete a última palavra do interlocutor
  mistura gírias da Baixa com palavras difíceis
`);

export const HOOKS = lines(`
  precisa de escolta até [place] e não pode pagar adiantado
  quer que alguém recupere [item] perdido nos Subníveis
  tem um contrato da Guilda que ninguém aceitou por medo
  ouviu boatos de [creature] perto de [place]
  está sendo seguido desde o Portão das Caravanas
  precisa entregar uma carta lacrada a [person] em [place]
  perdeu o Krupp e com ele a carga de um mês
  descobriu uma passagem nova sob o Mercado da Baixa
  quer contratar alguém para vigiar o próprio sócio
  pede ajuda para provar que um colega não roubou nada
  está vendendo um mapa que parece verdadeiro demais
  precisa de testemunhas para um contrato importante
  procura alguém que leia uma inscrição antiga
  oferece desconto em troca de um favor discreto
  está doente com algo que o Hospital Velho não reconhece
  teme que a caravana de amanhã seja atacada
  quer apresentar os personagens a [person]
  precisa tirar alguém de uma cela da Guarda Cívica
  encontrou [creature] ferido e não sabe o que fazer
  tem uma dívida que vence ao pôr do sol
  precisa de alguém para buscar [item] com [person] sem fazer perguntas
  quer saber por que a cisterna de [place] ficou com gosto de metal
  recebeu uma encomenda de [place] que não pediu
  quer que alguém acompanhe o filho na primeira viagem de caravana
  perdeu uma aposta e precisa de [item] até amanhã
  viu luzes numa ruína perto de [place] durante a noite
  precisa de ajuda para mudar a oficina de lugar antes do fiscal chegar
  foi acusado de vender [item] falsificado e jura inocência
  quer contratar guarda-costas para um leilão discreto
  está organizando uma expedição para [place] e faltam braços
  pede que alguém descubra o que [person] anda escondendo
  precisa que alguém espante [creature] da plantação
  oferece pagar em informação, não em créditos
  precisa recuperar o registro de uma dívida antes que o credor o use
  procura testemunhas de um acidente na Escadaria dos Mantenedores
  tem um mapa rasgado ao meio e sabe que [person] tem a outra metade
  quer vender um Krupp velho e esconder o defeito
  precisa de alguém de fora para entrar onde ninguém do bairro entra
`);

export const RELATION = lines(`
  conhece um dos personagens de um contrato antigo
  já cruzou com o grupo no Pátio de Contratos
  ouviu falar do grupo e não gostou
  é fã dos feitos do grupo
  quer algo do grupo e vai fingir amizade
  não sabe quem eles são, e prefere assim
  confunde o grupo com outros caçadores
  deve um favor a alguém que o grupo conhece
  tem um parente que trabalhou com um dos personagens
  acha que o grupo é da Custódia e fica nervoso
  viu o grupo chegar e já espalhou a notícia
  quer contratar o grupo, mas não tem como pagar
`);

/** What they have on them (gives the scene something to point at). Lines may use {a|b} variations. */
export const CARRIES = lines(`
  um caderno de capa de couro cheio de {esboços|anotações de rota|receitas|contas atrasadas}
  um cantil de {liga leve|couro de lagarto|cerâmica} {amassado|remendado|gravado com o nome de outra pessoa}
  uma faca de quitina com cabo enrolado em couro
  um molho de chaves que ninguém sabe o que abre
  uma carta de crédito dobrada demais
  um mapa {da Baixa|dos Subníveis|de uma rota de caravana|de uma cidade que não existe mais} desenhado à mão
  uma lamparina de resina-vela
  uma caixa de ferramentas {pequena e bem organizada|caótica|emprestada e nunca devolvida}
  um amuleto do Solarismo
  um frasco de chá de espinho-sal
  um caco de vidro antigo que brilha fraco
  uma lista de devedores
  um livro da Rua dos Livreiros que nunca devolveu
  uma bolsa de moedas costurada por dentro do casaco
  um apito de caravana
  um drone de bolso {desmontado|que só funciona de vez em quando|com uma luz piscando}
  um rolo de corda de junco-de-duna
  um certificado da Guilda dobrado em quatro
  um filtro de poeira sobressalente
  petiscos de mirror shrimp em conserva
  uma carta lacrada que não deveria abrir
  um dente de Aranha-Leão como pingente
  uma pistola antiga sem munição, só para impressionar
  um instrumento de cordas gasto
  um bloco de recibos carimbados
  um dune-hopper filhote numa gaiola
  sementes de corredor verde num saquinho
  um pedaço de quitina com uma inscrição riscada
  um pente de osso
  uma luneta de latão com a lente rachada
  um recibo de penhor de algo muito valioso
  um retrato pintado de alguém da família
  uma bússola que aponta sempre para o mesmo lugar errado
  um pacote embrulhado que não larga por nada
  um saco de {sal|raiz-cisterna seca|resina-vela|parafusos sortidos}
  um par de óculos de proteção com uma lente trocada
  uma fita de seda de Sila-Weaver amarrada no pulso
  um caderno de exercícios da Universidade com o nome de outra pessoa
  um vidrinho de {óleo para garras|tinta azul|remédio sem rótulo|areia de um lugar especial}
  uma escova pequena para tirar areia das roupas
  um bilhete de passagem de caravana para {amanhã|ontem|um destino riscado}
  um anel grande demais para os dedos de quem o usa
  uma chave de fenda com cabo de osso
  um pedaço de pão de raiz-cisterna embrulhado num lenço
  uma pedra lisa que esfrega quando está nervoso
  uma lista de compras longa demais
  uma insígnia de uma unidade da Guarda que já não existe
  um envelope com fios de pluma de alguém querido
  um copo de metal que leva para todo lado
  um baralho gasto de jogos da Baixa
  uma placa de circuito antiga usada como amuleto
  uma pequena balança de pesar fragmentos
  um par de luvas de couro {novinhas|remendadas nos dedos|de um tamanho errado}
  um contrato da Guilda ainda sem assinatura
  um mapa celeste das estrelas de Motávia
  uma caneca de barro com a marca de uma hospedaria
  um chocalho de criança no bolso
  uma lâmina de barbear e um espelhinho
  um caderninho com palavras em Shen'Motav e a tradução
  um pacote de cartas amarradas com barbante
  uma ferramenta que ninguém mais sabe para que serve
  um frasco com uma pena azul dentro
  uma ampulheta pequena de areia vermelha
  uma garrafa de licor de espinho-sal pela metade
  um apito de chamar Krupp
  uma tabuleta de cera com cálculos
`);

/** Lines may use {a|b} variations. */
export const FEARS = lines(`
  tempestades de areia
  a Custódia
  ficar sem água no meio do caminho
  os corredores fechados dos Subníveis
  Aranhas-Leão
  voltar a ser pobre
  ser esquecido
  dever dinheiro a quem não perdoa
  a altura da Escadaria
  máquinas antigas que ligam sozinhas
  que a família descubra o que fez
  o deserto à noite
  perder a licença
  multidões no Mercado da Baixa
  uma muda difícil das penas
  o silêncio total
  ser confundido com cultista
  o Corpo de Contenção
  falhar em público
  insetos, num mundo cheio de quitina
  ficar velho sem ensinar o ofício
  hospitais
  água parada
  bestas SEED
  ser tocado por desconhecidos
  {cobras|escorpiões|qualquer coisa que se mexa na areia}
  que o poço de casa seque
  perder a visão de tanto ler
  ser mandado de volta para {Aiedo|a vila natal|Dezolis}
  ficar preso numa ruína quando a luz acabar
  que descubram que não sabe ler
  um velho credor que voltou à cidade
  fogo
  o Corredor dos Fragmentos
  quem trabalha para a Controladoria
  a própria raiva
  cair no Mar de Nirae
  ser substituído por um andróide
  dormir sozinho no deserto
  o professor que o reprovou
  a mãe
  caravanas que chegam atrasadas
  que a Guilda descubra um erro antigo
  Sink-Beetles e a areia que afunda
  ficar sem créditos longe de casa
  lugares altos e abertos
  sonhar de novo com {a névoa|a porta lacrada|o rosto de alguém que morreu}
  cristais que brilham sozinhos
  ser chamado de covarde
  perder o Krupp
  doenças da poeira
  promessas feitas a kolianos
  o barulho de metal raspando no escuro
  envelhecer sem ter saído da cidade
`);

/** What they heard and may pass on ([place], [creature], [person] and {a|b} are filled in). */
export const RUMORS = lines(`
  a Custódia lacrou mais uma sala do Grande Arquivo
  uma caravana chegou de [place] com metade dos Krupps
  alguém está comprando todos os mapas antigos de [place]
  viram [creature] mais perto da cidade do que nunca
  [person] voltou do deserto falando coisas sem sentido
  o preço da água vai subir de novo
  há um professor pagando bem por fragmentos de vidro antigo
  um depósito antigo foi aberto nos Subníveis e esvaziado na mesma noite
  a Guilda vai abrir contratos restritos para [place]
  [person] está devendo para gente perigosa
  um poço de [place] voltou a dar água depois de anos seco
  andam vendendo cartas de crédito falsas no Mercado da Baixa
  alguém viu luzes se mexendo nas ruínas perto de [place]
  um culto anda recrutando estudantes
  uma família do Alto de Piata vai leiloar a coleção inteira
  a Guarda Cívica prendeu a pessoa errada e sabe disso
  um Krupp branco nasceu em [place] e já tem gente querendo comprar
  um andróide anda perguntando por um nome que ninguém conhece
  o corredor verde perto de [place] está morrendo mais rápido
  [person] encontrou algo numa escavação e sumiu no dia seguinte
  {uma|a terceira} caravana de [place] {não chegou|chegou sem o condutor|chegou com a carga trocada}
  [person] foi visto {saindo da Controladoria de madrugada|discutindo com a Custódia|comprando passagem só de ida}
  tem gente cavando à noite {atrás do Hospital Velho|no Distrito dos Aquedutos|perto do Portão das Caravanas}
  um estudante achou um terminal da Era das Maravilhas que ainda responde
  a ponte de [place] não aguenta mais um ano
  ofereceram uma fortuna por {um ovo de Sky-Hooker|seda crua de Sila-Weaver|um mapa do Corredor dos Fragmentos}
  a Guilda está pagando dobrado por [creature]
  [person] e [person] romperam a sociedade e um vai se vingar
  uma tempestade grande vem de [place] nos próximos dias
  há uma porta nova nos Subníveis que não estava lá na semana passada
  o Hospital Velho está recebendo doentes de [place] com a mesma febre
  um falsificador famoso saiu da cela e voltou ao trabalho
  alguém pagou a dívida de toda uma rua da Baixa, sem dizer quem
  [person] está organizando uma expedição e não conta para onde
  os fiscais vão inspecionar todas as oficinas do bairro
  um Espe foi visto em [place], longe de qualquer Casa da Ordem
  um dune-hopper ganhou cinco corridas seguidas e dizem que é trapaça
  a Universidade vai fechar um departamento inteiro
  o poço de [place] está com gosto de metal
  os Krupps de [place] estão inquietos e ninguém sabe por quê
  uma criança dos Subníveis desenha máquinas que nunca viu
  [person] comprou uma casa no Alto de Piata do nada
  estão pagando para alguém não abrir uma caixa vinda de [place]
  um arquivista sumiu com uma chave do Grande Arquivo
  a seda de Sila-Weaver vai faltar este ano
  um bando de [creature] está seguindo as caravanas para [place]
  alguém está colando cartazes com um símbolo estranho pela cidade
  o antigo dono da loja da esquina voltou, e devia estar morto
  uma relíquia exposta na Universidade é falsa e só três pessoas sabem
  os aquedutos fazem um som diferente à noite
`);

/** How they are today. Lines may use {a|b} variations. */
export const MOODS = lines(`
  de bom humor: fechou um bom negócio
  de mau humor depois de perder uma aposta
  com pressa, tem hora marcada
  desconfiado: alguém perguntou por ele ontem
  sem dormir depois de um turno dobrado
  comemorando o aniversário de alguém da família
  de luto discreto
  tossindo poeira da última tempestade
  eufórico com uma notícia que ainda não pode contar
  nervoso com uma inspeção marcada
  entediado, puxa conversa com qualquer um
  com fome, e isso piora tudo
  aliviado depois de uma viagem difícil
  ansioso esperando uma carta
  distraído, pensando em outra coisa
  irritado com o barulho da obra ao lado
  generoso: hoje recebeu o pagamento
  machucado de um acidente que não quer explicar
  saudoso de casa
  animado para contar uma descoberta
  {de ressaca|com dor de cabeça|com sono} depois de uma festa na Baixa
  brigou com {o sócio|a família|o vizinho} e ainda está remoendo
  com medo: acabou de ver algo estranho
  apaixonado e distraído
  procurando um objeto que perdeu hoje cedo
  em dia de folga, e não quer falar de trabalho
  de ótimo humor sem motivo aparente
  preocupado com um parente doente
  irritado com a poeira que não sai das roupas
  orgulhoso: acabou de terminar um trabalho difícil
  com calor e sem paciência
  cheio de planos depois de uma ideia
  em silêncio, depois de uma notícia ruim
  desconfiado de todo mundo hoje
  devendo um favor e tentando evitar alguém
  em plena muda de penas e envergonhado da aparência
  cansado, mas sem querer parecer cansado
  radiante: recebeu uma carta de quem esperava
  curioso com a chegada do grupo
  contando os minutos para fechar a loja
`);
