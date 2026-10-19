/**
 * Name corpora per culture of Algol (AW 2284). Sources: campaign NPCs (Aiedo/Piata compendium),
 * Phantasy Star canon, Bíblia Koliana (Shen'Motav lexicon and name system), Bíblia Dezoliana
 * (Ankhor) and biodiversity bibles. The Markov model only learns the style; generated names
 * are new, and real NPC names are never reproduced.
 */
const w = (s: string) => s.trim().split(/\s+/);

// ── Palmanianos (Motávia urban, Piata/Aiedo; soft, two-syllable, PS-style) ──
export const PALMAN_GIVEN = w(`
Alys Chaz Rune Hahn Rika Kyra Seth Holt Edran Elena Mira Arven Lena Tessa Deren Mila Saya Cael Ilya Liria
Oren Lira Tovin Eren Nina Mara Darven Rolf Nei Amy Hugh Anna Kain Shir Josh Lutz Noah Lassic Alis Odin Myau
Aden Alen Arlo Asha Bren Brea Cassel Corin Dalia Davin Elia Emra Faren Galen Hela Iven Jessa Joren Kael Kalen
Lenna Loran Maren Neris Nolan Orin Pell Raen Rhea Selin Talia Teo Vela Yara Zane Ansel Bria Calen Daro Ebba
Fenna Garen Hollis Irel Jory Kessa Lio Maeve Nell Ori Pria Quen Rosa Sabe Tamsin Ula Vance Wyn Yel Zora Abel
Adra Aira Alder Amon Anya Aren Ari Arn Ashe Aurel Bastin Bel Bera Cade Cala Cerys Ciran Corra Dain Darra Del
Desa Dorian Edda Edlin Eiran Elric Elsa Emrys Enna Erin Esk Evan Faye Feris Finn Gaela Gil Glen Greta Hadrin
Hale Hana Haris Hesk Ines Iona Isa Ivo Jael Jana Jem Kade Kara Keir Kesta Kira Lark Leda Leon Lian Lorne Lune
Lysa Mael Mako Marn Matt Meri Milo Mora Nael Nara Nessa Nico Nira Noa Odra Olen Ona Orla Pava Penn Petra Quin
Rael Ravi Ren Riel Rios Roan Ronan Ruta Sabel Sael Sena Sera Sorin Stav Sula Taj Tavi Teral Thea Toma Tyra
Ulric Una Val Vara Vero Vian Wenn Willa Yana Yorin Zale Zeva Zia Liam Cora Ivar Nyla Sten Tilda Bram Edra
`);

export const PALMAN_FAMILY = w(`
Varel Varen Maret Navel Tal Senel Garel Velas Voss Holt Marr Mahlay Veyl Nesh Sol Kesh Brangwin Ashley Walsh
Tierney Landale Adran Arvel Bastel Corran Dravel Ellan Faral Garret Halden Iverson Jarrel Kaston Larkin Marlow
Nevan Orrin Pallis Quarrel Redan Saren Tarrow Ulden Vantis Wexley Yarrow Zander Abrel Brannick Calder Daskin
Elwood Fennick Gavran Hollen Irwen Jessop Kellan Lorian Maddox Norrel Oswin Prentis Ravel Sallow Tennant Udell
Varden Wren Ystel Aldane Bellam Carrow Darrel Esten Farrow Grell Harwin Ingram Joss Kerrin Lannis Merrow Nolden
Ostrel Penhal Quill Rowan Stellan Thane Ursel Valen Werth Yarlow Amsel Brecken Cassel Dunmore Elsor Fallow
Gerrin Hask Ivers Jarvin Kesten Lowell Morrel Naish Orvin Pell Rask Sorrel Tavish Vane Weller Ambry Benning
Corvin Delmar Everard Fairn Garrow Hennick Isel Kavan Lisle Mantle Nesbit Orrell Parrin Revel Stroud Torven
Ullan Vessel Wardell Aster Blythe Carden Drax Elden Fenn Galt Harrow Irving Keld Lorne Marsh Nash Oakes Prior
Ravenn Seld Tarn Varr Wick Asher Bram Colm Dane Ewan Fallon Gage Hollis Isley Jarrett Kade Lund Mercer Niall
`);

/** Epithets used in Aiedo/Piata ("Mara Veyl, a Comandante"; "Velho Tovin"). */
export const PALMAN_NICKNAMES = w(`
Ferrugem Poeira Areia Chave Lanterna Mapa Agulha Faísca Corda Brasa Sal Krupp Cobre Vidro Pena Lâmina Eco
Fivela Graxa Selo Tinta Bússola Engrenagem Quitina Miragem Fôlego Duna Rato-de-Arquivo Trovão Sombra Pedra
`);

// ── Motavianos (Shen'Motav; prefix + radical + suffix, Bíblia Koliana §15) ──
export const MOTAVIAN_PREFIX = w(`
Ael Bar Zel Kor Mir Yen Dra Luth Or Thur Shen Vel Zhal Thar Khel Ash Neh Shir Naer Thul Rorr Venn Dran Skir
Olth Tael Hur Lith Yeth Nom Vur Sel Kren Dhar Koth Lahk Mern Zul Ern Tsor Bryn Hesh Yurr Rav Ren Ura Zyr Nuul
Gryz Drak Kesh Vor Tor Zenn Mor Sar Hal Kael Rhun Tav Var Yss Ess Ith Ush Oth Ar Ek Ul
`);
export const MOTAVIAN_RADICAL = w(`
a e i o u ra ri ro ru ka ke ki ko ze zo ma mi mo na ne ni no la le li lo ta te ti to va ve vi
ash esh ish osh ush ar er ir or ur al el il ol ul an en in on un ath eth ith oth yr yn yl
`);
export const MOTAVIAN_SUFFIX: readonly (readonly [string, number])[] = [
  ['', 6],
  ['an', 3],
  ['a', 3],
  ['-tor', 2],
  ['-sil', 2],
  ['-kesh', 2],
  ['-duul', 1],
  ['-ven', 2],
  ['-rath', 2],
  ['ek', 1],
  ['ul', 1],
  ['-zhal', 1],
];
/** Motavian clan/line names (second name; often a place or deed). */
export const MOTAVIAN_LINE = w(`
Velun-Dhar Ashun-Kren Naer-Mern Thul-Zenn Khel-Ash Olth-Vesh Skir-Nurr Mirrah-Koth Drann-Lahk Yetha-Ernah
Kora-Bryn Tael-Mern Lithra-Zul Nomar-Ash Shira-Kren Zenn-Lahk Hurrak-Mern Vurra-Dhar Thael-Koth Sel-Dur
`);
/** Hand-made Motavian names (training corpus for the Markov model). */
export const MOTAVIAN_CORPUS = w(`
Gryz Thurmir Aelora Drazel Yenka Koruth Shenra Velkan Zhalor Kheldra Ashuniel Nehrath Shirael Naeros Thulka
Rorrik Vennara Dranok Skirra Olthan Taelis Hurrak Lithra Yethal Nomrik Vurrash Selduur Krenath Dharok Kothra
Lahkira Mernos Zulrak Ernahel Tsoran Brynna Heshik Yurrath Raveth Renuk Urazel Zyrka Nuulos Drakesh Vorrin
Torzen Morrak Sarneth Halveth Kaelor Rhunak Tavira Varrok Ysseth Essira Ithrak Ushan Othvar Arkesh Ekron
Ulvara Zelmir Barrok Yenthul Luthan Orrik Ashkel Mirzhal Korvesh Draknar Shenthul Velrik Zhalven Neshka
`);

// ── Kolianos (Kol'Zenn; glottal apostrophes, castes as titles) ──
export const KOLIAN_SYLLABLE_A = w(
  `Zahl Vorr Kesh Tor Zenn Shen Nehr Kreel Tar Or Val Nar Skir Kor Shir Khel Duur Enash Rava Renu Mir Ash Thul Lahk`,
);
export const KOLIAN_SYLLABLE_B = w(
  `im an or ek ul eth ra ah en is os ar un esh ith ur ok al uk em ir oth akh uun eel orn ash ikk`,
);
/** Kolian honorific endings (function/honor), from the Motavian name system. */
export const KOLIAN_HONOR = w(`tor kesh sil duul ven rath zhal`);
export const KOLIAN_TITLES = w(`Vorr'Tal Zahl'Tor Enash Valen'Duur Kol'Zahl`);
export const KOLIAN_CORPUS = w(`
Zahl'Ren Kesh'Oran Tor'Esh Vorr'Ikan Shen'Ulra Nehr'Ath Kreel'Om Tar'Inuk Or'Vash Val'Enur Nar'Eth Skir'Ahl
Korr'Usa Shir'Oth Khel'Ira Duur'Ak Mir'Esh Ash'Tavr Thul'Een Lahk'Ira Zenn'Ora Rava'Tul
`);

// ── Dezolianos (Ankhor; hard consonants, acute accents, -ar/-ek/-ik/-uk endings) ──
export const DEZORIAN_CORPUS = w(`
Raja Ránek Vórin Hálvar Tóvek Sárna Brínna Kórvik Thássa Várruk Kríva Móldra Nívek Gorveth Sílva Túmbek Ríkka
Fénnel Skárn Túla Véyla Kélna Brúnka Órlith Sérrin Khárva Sáblek Néssa Grólik Pyrlin Sívra Aurál Khardek
Thrumma Lúmin Bríneck Slyra Dórrin Wármek Orólen Vídra Kráuth Lúmshra Nívfin Kórrin Véyrun Yórek Léxa Téssa
Sénnik Álun Cólvar Saffek Rímma Gápek Échra Trácek Múrra Knótvik Fíla Tésvar Ánkra Vérrik Dárva Mírek Sálvi
Rénka Sígvar Kérra Kétlin Vákra Tálvek Hórna Úlvik Ésta Ívrin Ódda Ásvar Bérrik Dúnna Éggar Fróa Grímvek
`);

// ── Espers (Lutz/Rune tradition; Palman-like with older forms) ──
export const ESPER_CORPUS = w(`
Rune Lutz Noah Wren Saffi Oriel Kade Ilsa Teodor Avriel Lumen Sorrel Mirel Caius Elian Seraph Ione Thessaly
Auren Nyx Calliope Evander Ilith Oren Vesper Lior Anwen Cassius Delphine Isidore Lysander Maelis Perrin Quinlan
Aelis Bryony Cyran Dariel Elowen Faelan Gwynn Halcyon Isolde Jareth Kestrel Lirael Merrin Nimue Osric Peregrine
Quill Rhiannon Solace Tamsin Ulric Valerian Wyndham Xanthe Ysolde Zephyr Aster Briar Cerise Dorian Ember Fable
`);

/** Esper epithets (Lutz tradition). */
export const ESPER_EPITHETS = w(`do-Eco da-Torre da-Biblioteca do-Véu de-Lutz da-Memória do-Silêncio da-Névoa`);

// ── Androids / AIs (designations + given names) ──
export const ANDROID_PREFIX = w(`WR DM MK RX SV NX KL TR AX VS LT GN`);
export const ANDROID_GIVEN = w(
  `Wren Demi Miki Pell Ixa Soro Tecca Vox Lumi Kesta Orbo Nilo Sentry Quill Mender Atlas Cog Bit Tally Ember`,
);

export type Culture = 'palman' | 'motavian' | 'kolian' | 'dezorian' | 'esper' | 'android';

export const CULTURE_LABEL: Record<Culture, string> = {
  palman: 'Palman',
  motavian: 'Motavian',
  kolian: 'Kolian',
  dezorian: 'Dezorian',
  esper: 'Esper',
  android: 'Android',
};
