/**
 * What each Algol local good is and does (ⓘ in the shop generator). Sources: Bíblias de
 * Biodiversidade (Motávia/Dezolis), Krupp manual, Bíblia Koliana, Kit de Arqueólogo (Piata),
 * Economia v3.0. Rules notes are suggestions for Starfinder 1e unless the item is canonical.
 */
export const LOCAL_DESC: Record<string, string> = {
  'Refeição simples (caldo de cave-shrimp e pão de fungo)':
    'Comida de dormitório e de caravana: caldo de camarão cultivado nos aquíferos com pão de fungo. Mata a fome, não impressiona ninguém.',
  'Refeição comum (ensopado de larva de Krupp)':
    'O prato mais típico de Motávia. A larva de Krupp é a principal proteína do planeta; o ensopado é gorduroso e sustenta um dia de trabalho.',
  'Boa refeição (carpa de Nirae grelhada)':
    'Peixe da cratera de Nirae, grelhado com espinho-sal. Prato de quem quer causar boa impressão ou comemorar um contrato.',
  'Conserva de mirror shrimp':
    'Camarão translúcido de Nirae em conserva. "Prato de mercado" que dura semanas fechado; motavianos adoram quando está bem fermentado.',
  'Farinha de dune-hopper':
    'Farinha proteica de gafanhoto das dunas. Base de pães e mingaus de viagem; leve e quase não estraga.',
  'Carne salgada de kelp-rat': 'Carne de roedor costeiro curada no sal. Barata, dura muito, gosto forte.',
  'Creme de larva de Krupp':
    'Gordura cremosa extraída da larva. Usada em cozinha, conservas e até como base de unguentos.',
  'Ovos de skarn-pod':
    'Ovos da ave criada em cavernas quentes. Relativamente raros; um luxo pequeno em vilas do deserto.',
  'Chá de espinho-sal':
    'Infusão do arbusto salino. Levemente amarga e salgada; repõe sais depois de um dia de calor. Oferecida como gesto de boas-vindas.',
  'Cerveja de fungo da Baixa':
    'Cerveja turva das tavernas de Piata. Fraca, barata e companheira de debates da Praça das Teses.',
  'Vinho de fungo de Listh-Moa':
    'Vinho caro de fungos "telepáticos". Dizem que quem bebe junto sonha a mesma coisa à noite; ninguém em Piata conseguiu provar ou desmentir.',
  'Destilado de resina (forte)':
    'Aguardente aromatizada com resina-vela. Queima a garganta; caravaneiros juram que espanta o frio do deserto à noite.',
  'Ração de viagem (3 dias)':
    'Farinha de inseto, carne seca e frutas desidratadas embaladas para três dias de estrada.',
  'Raiz-cisterna (água e comida)':
    'Tubérculo que armazena água. Uma raiz rende comida e um pouco de líquido em emergência. Protegida por leis locais em vários oásis: colher sem permissão dá problema.',
  'Esteira no dormitório comum': 'Um canto no chão de um salão compartilhado. Sem privacidade, mas com teto e água.',
  'Quarto simples': 'Quarto pequeno com cama e tranca. O padrão de quem viaja com contrato modesto.',
  'Quarto bom com banho': 'Quarto confortável com banho. Em Motávia, água corrente é luxo de verdade.',
  'Baia para Krupp com ração':
    'Lugar coberto para o Krupp passar a noite, com ração e água. Indispensável para caravanas.',
  'Cantil de quitina (2 L)':
    'Cantil leve feito de placa de Krupp moldada. Não amassa e mantém a água fresca por mais tempo.',
  'Odre de seda impermeável (10 L)':
    'Bolsa de seda de Sila-Weaver selada com resina. Leve para o volume que carrega; padrão em caravanas longas.',
  'Água filtrada':
    'Água tratada de poço ou de sistema antigo. Em lugares pequenos, o preço sobe muito na estação seca.',
  'Filtro de poeira para máscara':
    'Refil para máscaras de viagem. Evita tosse de areia e reduz o risco de inalar esporos em ruínas.',
  'Corda de junco-de-duna (15 m)': 'Corda grossa de gramínea das dunas. Barata e resistente, mas pesada.',
  'Corda de seda de Sila-Weaver (15 m)':
    'Corda feita da seda estrutural das tecelãs domesticadas. Muito mais leve e forte que junco; a preferida de quem desce em ruínas.',
  'Lona de tenda de seda': 'Lona de seda tratada para sombra e vento. Monta um abrigo para duas ou três pessoas.',
  'Lamparina de resina-vela':
    'Lamparina que queima a resina do arbusto do deserto. Luz amarela, cheiro doce, chama estável.',
  'Barra de resina-vela (combustível)':
    'Combustível sólido para lamparinas e pequenas fogueiras. Uma barra dura uma noite.',
  'Óleo de Krupp (lamparina e cozinha)':
    'Óleo extraído da larva de Krupp. Serve para lamparina, fritura e lubrificação de ferramentas.',
  'Cesto de junco reforçado': 'Cesto trançado para carga em Krupp. Simples, leve e fácil de consertar na estrada.',
  'Mapa de rota de caravana (copiado)':
    'Cópia de rota registrada na Guilda com poços, abrigos e trechos perigosos. Pode estar desatualizada.',
  'Bússola de rota com marcas da Guilda':
    'Bússola com as direções das rotas principais gravadas pela Guilda. Útil quando a tempestade apaga as marcas.',
  'Placa de quitina de Krupp (bruta)':
    'Placa de carapaça de Krupp ainda sem trabalho. Matéria-prima de armaduras, telhas e recipientes.',
  'Telha de quitina': 'Telha leve e resistente ao sol. Cobre metade dos telhados de Motávia.',
  'Rolo de seda estrutural': 'Seda de Sila-Weaver em fios grossos para construção, cordas e armaduras leves.',
  'Seda adesiva (manejo)': 'Seda pegajosa usada para prender, vedar e consertar. Se mal manuseada, gruda em tudo.',
  'Resina de Duh-Ant (cola/limpeza)':
    'Resina estrutural das formigas de colmeia manejada. Cola forte e solvente de limpeza; corrosiva se mal diluída.',
  'Ácido de Duh-Ant diluído':
    'Ácido de colmeia para limpeza pesada e gravação. Em contato com a pele, queima (dano ácido leve, a critério do mestre).',
  'Fibra de junco-de-duna': 'Fibra bruta para trançar cordas, cestos e reforçar tecidos.',
  'Sucata da Era das Maravilhas (lote)':
    'Caixa de peças antigas sem classificação. Quase tudo é inútil; às vezes há um componente que vale mais que o lote inteiro.',
  'Componente antigo sem identificação':
    'Peça tecnológica de função desconhecida. Um "artefato funcional opaco" em potencial: pode ser nada, pode ser algo que a Universidade pagaria caro para estudar.',
  'Placa de circuito de satélite caído':
    'Eletrônica recuperada de satélites que caíram após o colapso. Valiosa para técnicos e para Piata.',
  'Célula de energia recondicionada':
    'Bateria antiga recarregada por técnicos. Funciona como bateria comum, mas a carga real é incerta (o mestre pode rolar).',
  'Pasta de espinho-sal (conserva e assepsia)': 'Pasta salina usada para conservar carne e limpar ferimentos simples.',
  'Raiz-serpente (febres comuns)':
    'Raiz medicinal para febres comuns e dores. Remédio popular; não cura doenças sérias.',
  'Tônico contra febre de lodo (mud-leech)':
    'Tônico para a febre transmitida por sanguessugas de água parada. Ajuda no teste contra a doença (+2 sugerido).',
  'Enzimas de larva (digestivo)':
    'Enzimas extraídas da larva de Krupp. Ajudam a digerir alimentos pesados ou duvidosos (palmanianos agradecem).',
  'Unguento de penas (plumagem motaviana)':
    'Óleo para plumagem ressecada ou muda irregular. Item de cuidado pessoal básico de qualquer motaviano.',
  'Kit de primeiros socorros de caravana':
    'Bandagens, talas, pasta de espinho-sal e um sedativo leve. Permite Medicine para primeiros socorros sem penalidade.',
  'Aluguel de Krupp de carga':
    'Um Krupp treinado para carga por um dia. Caução registrada na Guilda; o animal tem de voltar inteiro.',
  'Aluguel de Krupp de montaria':
    'Um Krupp de montaria por um dia. Mais lento que um veículo, mas não quebra no meio do deserto.',
  'Krupp jovem (não treinado)':
    'Krupp jovem que ainda precisa de meses de treinamento. Preço de referência do gerador (sem tabela ratificada).',
  'Krupp adulto treinado para carga':
    'O "boi + cavalo" de Motávia: carrega peso de cavalo de guerra e é ativo produtivo. O compêndio da economia usa 2.000 cr como exemplo de financiamento.',
  'Sela e arreios para Krupp': 'Sela e cintas ajustadas à carapaça. Sem isso, a montaria escorrega na primeira duna.',
  'Ração de Krupp (semana)': 'Ração seca de junco e farelo para uma semana de viagem.',
  'Larva de Krupp para engorda':
    'Larva jovem para criação e produção de óleo, creme e farinha. Precisa de curral úmido.',
  'Sila-Weaver manejada (jovem)':
    'Aranha tecelã jovem domesticada. Produz seda com manejo calmo e alimentação regular.',
  'Consulta de veterinária de Krupp':
    'Visita de quem entende de Krupp: casco, carapaça, doenças de larva e patas feridas.',
  'Livro usado (tratado acadêmico)': 'Tratado de alguma Faculdade de Piata, com anotações de antigos donos na margem.',
  'Caderno de expedição de terceiros':
    'Diário de campo vendido por herdeiros ou credores. Às vezes traz mapas e observações valiosas.',
  'Dicionário Shen’Motav–Palmaniano':
    'Dicionário da língua motaviana geral. Ajuda a entender dialetos (Shaa’Vel, Lirr’Yenn…) e gírias.',
  'Cópia de inscrição da Era das Maravilhas':
    'Transcrição de uma inscrição antiga. Estudiosos compram para comparar com o que já foi decifrado.',
  'Mapa incompleto dos Subníveis':
    'Trecho mapeado dos túneis sob a Baixa. Incompleto por definição: ninguém tem o mapa inteiro.',
  'Mapa "verdadeiro" de um oásis perfeito':
    'Promete o caminho até um oásis onde sistemas antigos ainda funcionam. Quase sempre falso; quando é verdadeiro, o lugar costuma ser tabu por um motivo.',
  'Fragmento de ruína com selo antigo':
    'Pedaço de estrutura antiga com marca de instituição desconhecida. Interessa à Custódia Acadêmica.',
  'Cristal fosco que esquenta ao toque':
    'Cristal com energia residual, talvez um Lúmen degradado. Pode ser útil, perigoso ou só curioso. A Custódia gostaria de ver isto.',
  'Moeda antiga de Palma': 'Moeda do planeta destruído. Peça de colecionador e lembrança amarga de Palma.',
  'Certificação de documento (Selo de Integridade)':
    'Selo da Ordem Espe atestando que um documento não foi alterado. Exigido em contratos importantes.',
  'Consulta técnica do Ofício das Chancelas':
    'Uma hora com um técnico Espe para avaliar selos, moedas ou documentos suspeitos.',
  'Munição recarregada à mão':
    'Cartuchos remontados por artesão local. Mais barata, mas falha às vezes (sugestão: em 1 natural, a arma emperra).',
  'Pele de Varruk curtida': 'Couro grosso do boi de carga de Dezolis. Isolamento excelente contra o frio.',
  'Gordura de Sílth (lamparina)': 'Gordura do mamífero costeiro de Dezolis. Queima limpa e por muito tempo.',
  'Lã de Gorveth': 'Lã grossa da cabra de penhasco. Base das roupas em camadas dos dezolianos.',
  'Pão de Thrum': 'Pão de micélio cultivado nas cavernas. Nutritivo, base da dieta nos abrigos.',
  'Caldo quente do Salão do Fogo': 'O caldo servido a todos no Salão do Fogo. Recusar é recusar a confiança da vila.',
  'Ensopado de Grol com Khardroot': 'Carne do roedor de caverna com raiz-dura. Comida de inverno, pesada e quente.',
  'Véyl-run defumado': 'Peixe cego dos rios subterrâneos, defumado. A pesca mais segura e previsível de Dezolis.',
  'Sopa de Lumshr ("luz viva")': 'Sopa de camarão luminoso que brilha levemente na tigela.',
  'Leite espesso de Varruk': 'Leite gordo e quente, servido em canecas no abrigo.',
  'Chá de Warmbloom': 'Infusão da flor das fendas termais. Aroma forte; usado como tônico contra frio.',
  'Leito na Casa Quente':
    'Cama na enfermaria aquecida da vila. Para doentes, feridos e viajantes que chegaram congelados.',
  'Toca de hóspede no Anel de Moradia':
    'Quarto-toca conectado por túneis curtos às casas da vila. Quente e silencioso.',
  'Cogumelo-lanterna (Lumin)': 'Cogumelo bioluminescente: comida e luz. Símbolo de segurança nos túneis.',
  'Luz viva de Lumshr (pote)': 'Pote com camarões luminosos vivos. Ilumina fraco, sem fogo, por dias.',
  'Tônico de Pyrlin (frio e fadiga)':
    'Tônico de líquen-de-fogo. Ajuda contra frio e cansaço (+2 sugerido em Fortitude contra frio por algumas horas).',
  'Bagas de Auralis em conserva': 'Bagas doces e raras do arbusto-aurora. Comida de festival.',
  'Ferramenta de osso de Thássar':
    'Ferramenta de osso do mamute dezoliano. Resistente ao frio, não fica quebradiça como metal barato.',
  'Aluguel de trenó de Nívora': 'Trenó leve puxado por renas gigantes, com condutor, por um dia.',
  'Guia de nevasca':
    'Guia que conhece as rotas marcadas. Em Dezolis, viajar sozinho em nevasca é tabu — e geralmente fatal.',
  'Ampola Antiesporo':
    'Canônico (Kit de Arqueólogo). Antimicótico de campo: +4 em resistências contra doenças por 2 dias. O "antídoto de poeira viva" de Zema e das escavações.',
  'Ampola Tremor-Calm':
    'Canônico. Sedativo leve (1d4 não letal): se você estiver sob medo ou emoção que permita teste, pode refazer o teste com +1. Ferramenta de crise, não de diversão.',
  'Ampola Neutralizadora':
    'Canônico. Espuma alcalina: ação padrão, o alvo pode refazer o teste de Reflexos com +4 para encerrar corrode ou burning.',
  'Ampola Selante Resina-Vela':
    'Canônico. Micro-epóxi de uso único (ação completa): sela fissuras e dá +2 no próximo teste de Engineering de reparo/vedação.',
  'Ampola Fixadora de Amostras':
    'Canônico. "Congela" uma amostra biológica por semanas e dá +2 em Life Science para analisá-la.',
  'Ampola Corante de Trilhas (Dye-Lumen)':
    'Canônico. Corante luminescente para marcar rotas: ⚠ perigo, → saída, ◎ amostra coletada, ✗ não tocar.',
  'Cordão de Cristais Lúmen (3 m)':
    'Canônico. Cordão de cristais que dá luz fria e muda de cor (ação de movimento). Perto de energia antiga, brilha sozinho.',
  'Conjunto de Campo – Piata (Básico)':
    'Canônico. Bandoleira + uma de cada ampola + cordão Lúmen. O kit padrão do arqueólogo de Piata.',
  'Filtro de expedição Linha de Campo Piata':
    'Filtro robusto da linha que Piata faz para a Guilda: fácil de reparar e documentado. "Se veio de Piata, provavelmente funciona."',
  'Sensor ambiental portátil (Linha de Campo)':
    'Mede água, ar e solo (contaminação, esporos, energia residual). Tecnologia de Piata com carcaça simples.',
  'Monomate (sérum de cura Mk 1)':
    'O clássico de Phantasy Star. Funciona como sérum de cura Mk 1 do Starfinder: restaura 1d8 PV.',
  'Dimate (sérum de cura Mk 2)': 'Funciona como sérum de cura Mk 2: restaura 3d8 PV.',
  'Trimate (sérum de cura Mk 3)': 'Funciona como sérum de cura Mk 3: restaura 6d8 PV. Raro fora de Piata e Aiedo.',
  'Antídoto (antitoxina tier 1)': 'Funciona como o medicinal antitoxina: bônus contra venenos por algumas horas.',
  'Star Dew (restauração de grupo)':
    'Item lendário de cura em grupo. O efeito é decisão do mestre (sugestão: 2d8 PV para todos os aliados a 9 m).',
  'Sal ritual de Kor-Nareth': 'Sal do lago Nehra’tul. Oferenda obrigatória para iniciar qualquer troca com kolianos.',
  'Cristal de Kol-Tarim (pequeno)':
    'Cristal das minas kolianas, ligado a práticas de ressonância. Os kolianos desaprovam a "cobiça" de quem o compra.',
  'Máscara filtrante de Kol-Tarim':
    'Máscara de Kol-Tarim. Filtra poeira e, para os kolianos, protege o espírito. Funciona como máscara de viagem.',
  'Água de rito (lacrada)': 'Água usada nos ritos de purificação. Para os kolianos, profaná-la é ofensa grave.',
};
