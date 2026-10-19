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
  `),
  Saúde: lines(`
    Médica do Hospital Velho
    Enfermeiro dos Pavilhões Brancos
    Farmacêutica
    Cirurgião de campo aposentado
    Veterinária de Krupp
    Herborista de espinho-sal
    Biotecnóloga clínica
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

export const AGES = lines(`
  jovem, ainda aprendendo o ofício
  na casa dos vinte, cheio de energia
  adulto, firme na profissão
  na meia-idade, cansado mas competente
  mais velho, com décadas de estrada
  idoso, respeitado pela memória que guarda
`);

/** Motavianos: plumagem marrom comum, azul rara, verde raríssima (Bíblia Motavianos v1.2). */
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
    barba bem aparada e voz grave
    postura rígida de quem já foi da Guarda
    luvas de trabalho que nunca tira
    olhar cansado e roupas impecáveis
    cabelo azul tingido, moda estudantil
    anel de sinete de família antiga
    bengala de liga leve que talvez esconda algo
    capa com o brasão da Universidade
    botas de deserto quase novas demais
  `),
  Motaviano: lines(`
    plumagem marrom-areia com pontas ocre
    plumagem sépia densa e orelhas sempre atentas
    plumagem marrom escura com manchas claras no peito
    plumagem castanha desbotada pela idade
    rara plumagem azul-ardósia que atrai olhares
    raríssima plumagem verde-oliva
    bico curto e marcado por uma lasca antiga
    orelhas enormes com um brinco de quitina
    plumas longas da nuca presas em feixes laterais
    plumas presas para trás num arranjo de jornada
    cascata de plumas com contas de vidro
    garras pintadas de ocre
    cauda emplumada que trai cada emoção
    gira a cabeça para trás sem virar o corpo
    manto de penas cheio e bem cuidado
    penas desalinhadas de quem dormiu na estrada
    olhos âmbar muito expressivos
    porte baixo e robusto, mãos de trabalho
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
  `),
  Esper: lines(`
    olhar distante, como quem ouve algo
    manto simples com bordado antigo de Lutz
    cabelos prateados precocemente
    pulseira de cristal que brilha levemente
    fala baixa e escolhe cada palavra
  `),
  Andróide: lines(`
    carcaça polida com reparos visíveis
    voz sintetizada calma demais
    olhos ópticos que mudam de cor ao pensar
    placa de identificação riscada à mão
    roupas sobre a carcaça para parecer mais pessoa
    movimento perfeito, sem um passo fora do lugar
  `),
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
`);

export const RELATION = lines(`
  conhece um dos personagens de um contrato antigo
  já cruzou com o grupo no Pátio de Contratos
  ouviu falar do grupo e não gostou
  é fã dos feitos do grupo
  quer algo do grupo e vai fingir amizade
  não sabe quem eles são, e prefere assim
`);
