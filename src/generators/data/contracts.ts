/**
 * Guild job board (Guilda dos Caçadores v2: tipos de trabalho e níveis de acesso; Economia v3.0:
 * pagamento por Caçador — dia local 15–25, cinco dias 75–120, quinze dias ~200, trinta dias 400,
 * arriscado 600–900, alto risco 1.000–1.600; reference values, not ratified canon).
 */
const lines = (s: string) =>
  s
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

export const ACCESS: readonly (readonly [string, number])[] = [
  ['Público', 6],
  ['Restrito (exige reputação)', 3],
  ['Privado (negociado direto)', 2],
  ['Confidencial', 1],
];

export interface PayBand {
  label: string;
  days: [number, number];
  pay: [number, number];
}

export const PAY_BANDS: PayBand[] = [
  { label: 'Serviço local (1 dia)', days: [1, 1], pay: [15, 25] },
  { label: 'Curto (até 5 dias)', days: [2, 5], pay: [75, 120] },
  { label: 'Habitual (quinze dias)', days: [10, 15], pay: [180, 220] },
  { label: 'Longo (trinta dias)', days: [25, 30], pay: [400, 400] },
  { label: 'Arriscado (trinta dias)', days: [20, 30], pay: [600, 900] },
  { label: 'Alto risco', days: [20, 40], pay: [1000, 1600] },
];

export const KINDS: Record<string, string[]> = {
  Entrega: lines(`
    Entregar [cargo] em [place] antes de [deadline].
    Levar uma carta lacrada da Guilda para [person], em [place], sem abrir.
    Transportar [cargo] frágil de [place] até [place2].
    Buscar e trazer de volta [cargo] esquecido num depósito de [place].
  `),
  Escolta: lines(`
    Escoltar uma caravana de [n] Krupp de [place] até [place2].
    Proteger [person] durante uma visita a [place].
    Acompanhar uma equipe acadêmica até [site].
    Escoltar um prisioneiro da Guarda Cívica até [place2].
  `),
  Investigação: lines(`
    Descobrir quem está sabotando os poços de [place].
    Investigar desaparecimentos perto de [site].
    Encontrar a origem de créditos falsificados que circulam em [place].
    Descobrir por que os Krupp de [place] estão adoecendo.
    Apurar boatos de estátuas que antes eram pessoas perto de [place].
  `),
  Busca: lines(`
    Encontrar [person], visto pela última vez em [site].
    Localizar uma caravana atrasada há [n] dias na rota de [place].
    Achar o Krupp fugido de um criador de [place].
    Encontrar um caderno de expedição perdido em [site].
  `),
  'Serviço técnico': lines(`
    Consertar a bomba d’água de [place] antes da estação seca.
    Reativar um terminal antigo em [site] sem danificar o arquivo.
    Instalar filtros de poeira no posto de [place].
    Recuperar dados de um drone caído perto de [site].
  `),
  Recuperação: lines(`
    Recuperar [cargo] roubado por saqueadores em [site].
    Retirar peças de um satélite caído perto de [place] antes de outros grupos.
    Resgatar equipamento abandonado por uma expedição em [site].
    Recuperar uma relíquia vendida ilegalmente no Corredor dos Fragmentos.
  `),
  Proteção: lines(`
    Defender a lavoura de [place] de [creature] por [n] noites.
    Vigiar o depósito de [place] durante o festival.
    Proteger um oásis de [place] contra [creature].
    Guardar a entrada de [site] enquanto pesquisadores trabalham.
  `),
  Expedição: lines(`
    Mapear [site] e voltar com relatório.
    Acompanhar o levantamento de [site] por [n] dias.
    Coletar amostras de [creature] em [site] (vivas, se possível).
    Abrir rota segura entre [place] e [place2].
  `),
  Caça: lines(`
    Eliminar [creature] que ataca rotas perto de [place].
    Expulsar [creature] de [site] sem destruir o ninho (pedido da Universidade).
    Capturar [creature] vivo para estudo.
    Abater [creature] que matou dois Krupp em [place].
  `),
  Urgente: lines(`
    Levar remédios para [place]: surto de febre de lodo.
    Retirar moradores de [place] antes de uma tempestade de areia.
    Encontrar crianças perdidas em [site] antes da noite.
  `),
};

export const CARGO = lines(`
  caixas de quitina
  amostras biológicas lacradas
  instrumentos ópticos da Universidade
  rolos de seda de Sila-Weaver
  remédios dos Pavilhões Brancos
  peças de bomba d’água vindas de Aerodyn
  um cofre pequeno e muito pesado
  sementes de corredor verde
  documentos do Tribunal Superior
  um Krupp jovem de linhagem premiada
  mapas originais do Grande Arquivo
  conservas de mirror shrimp para um banquete
  um artefato embrulhado em seda e sal
  barris de óleo de Krupp
  cartas de crédito em grande valor
`);

export const SITES = lines(`
  ruínas climáticas ao norte
  um oásis perfeito evitado pelos locais
  um satélite caído nas dunas
  os Subníveis sob a Baixa
  uma instalação antiga semienterrada
  um cânion com colmeias nas paredes
  as margens da cratera de Nirae
  uma estação de bombeamento abandonada
  um corredor verde degradado
  as salinas do leste
  uma vila abandonada depois da seca
  um posto de caravana destruído
  uma caverna de aquífero
  uma torre de comunicação antiga
  uma zona de bloom do Seed
`);

export const DEADLINES = lines(`
  o fim da semana
  a próxima lua (não há lua; é piada de caravaneiro: "nunca")
  o festival da Praça das Teses
  a abertura do Tribunal
  o pôr do sol de amanhã
  a partida da próxima caravana
`);

export const COMPLICATIONS = lines(`
  O contratante esconde o verdadeiro conteúdo da carga.
  Outra equipe aceitou o mesmo contrato por engano.
  A rota indicada cruza território de Aranha-Leão.
  Há uma tempestade de areia prevista para o meio da viagem.
  O pagamento depende de um selo da Ordem Espe ainda não emitido.
  Um rival quer que o contrato fracasse.
  A Custódia Acadêmica vai querer ver o que for encontrado.
  O alvo não quer ser encontrado.
  O Krupp alugado é teimoso e odeia areia fofa.
  Testemunhas falam de estátuas no caminho.
  A Guarda Cívica suspeita do próprio contratante.
  Um dos contratados anteriores sumiu no mesmo lugar.
  O mapa fornecido está errado de propósito.
  Há uma cláusula de sigilo com multa pesada.
  Uma colmeia de Mirage Wasp se instalou na rota.
  Saqueadores conhecem o horário da caravana.
  O contratante é Kol'Zahl e teme ser descoberto.
  O lugar é tabu para os moradores próximos.
`);

export const CLAUSES = lines(`
  Adiantamento de 30% no registro.
  Pagamento por marcos: metade na ida, metade na entrega.
  Reembolso de despesas comprovadas (água, ração, Krupp).
  Prêmio de risco se houver combate registrado.
  Caução de 50 cr devolvida na conclusão.
  Sigilo obrigatório por um ano.
  Equipamento fornecido pelo contratante.
  Bônus por entrega antecipada.
  Jurisdição: Casa Regional da Guilda de Piata.
  Jurisdição: Aiedo.
`);
