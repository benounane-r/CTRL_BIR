// Okulun uygulamasındaki "Kat Planı"ndan alınan DERSLİKLER.
// Laboratuvar, toplantı salonu, seminer odası ve oditoryum bilerek dahil edilmedi.
// Not: 9. kat ve üstü ile zemin kat görüntüde yoktu, eklenmedi.
const PAIRS = [
  // 1. kat
  ['B1-14', 'Harezmi Dersliği'],
  // 2. kat - Tesla
  ['B2-07', 'Tesla 01'], ['B2-08', 'Tesla 02'], ['B2-15', 'Tesla 03'],
  ['C2-01', 'Tesla 04'], ['C2-02', 'Tesla 05'], ['C2-03', 'Tesla 06'], ['C2-09', 'Tesla 07'],
  // 3. kat - Tolkien
  ['B3-02', 'Tolkien 01'], ['B3-03', 'Tolkien 02'], ['B3-04', 'Tolkien 03'],
  ['B3-09', 'Tolkien 04'], ['B3-10', 'Tolkien 05'], ['B3-15', 'Tolkien 06'],
  ['C3-01', 'Tolkien 07'], ['C3-02', 'Tolkien 08'], ['C3-03', 'Tolkien 09'], ['C3-09', 'Tolkien 10'],
  // 4. kat - Einstein
  ['A4-09', 'Einstein 02'], ['A4-10', 'Einstein 03'], ['A4-11', 'Einstein 04'],
  ['B4-02', 'Einstein 05'], ['B4-03', 'Einstein 06'], ['B4-04', 'Einstein 07'], ['B4-05', 'Einstein 08'],
  ['B4-09', 'Einstein 09'], ['B4-10', 'Einstein 10'], ['B4-15', 'Einstein 11'],
  ['C4-01', 'Einstein 12'], ['C4-02', 'Einstein 13'], ['C4-03', 'Einstein 14'], ['C4-09', 'Einstein 15'],
  // 5. kat - Da Vinci
  ['A5-09', 'Da Vinci 02'], ['A5-10', 'Da Vinci 03'], ['A5-11', 'Da Vinci 04'],
  ['B5-02', 'Da Vinci 05'], ['B5-03', 'Da Vinci 06'], ['B5-04', 'Da Vinci 07'], ['B5-05', 'Da Vinci 08'],
  ['B5-09', 'Da Vinci 09'], ['B5-10', 'Da Vinci 10'], ['B5-15', 'Da Vinci 11'],
  ['C5-01', 'Da Vinci 12'], ['C5-02', 'Da Vinci 13'], ['C5-03', 'Da Vinci 14'], ['C5-09', 'Da Vinci 15'],
  // 6. kat - İbn-i Sina
  ['A6-09', 'İbn-i Sina 02'], ['A6-10', 'İbn-i Sina 03'], ['A6-11', 'İbn-i Sina 04'],
  // 7. kat - Cahit Arf
  ['B7-02', 'Cahit Arf 01'], ['B7-03', 'Cahit Arf 02'], ['B7-04', 'Cahit Arf 03'], ['B7-05', 'Cahit Arf 04'],
  // 8. kat - Farabi
  ['B8-02', 'Farabi 01'], ['B8-03', 'Farabi 02'], ['B8-04', 'Farabi 03'], ['B8-05', 'Farabi 04']
];

// "C5-03" -> blok C, kat 5, no 03
module.exports = PAIRS.map(([code, name]) => ({
  code,
  name,
  block: code[0],
  floor: Number(code[1]),
  number: code.slice(3)
}));
