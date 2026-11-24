// Okul asansör düzeni.
//  - trackCrowd: kamera (simülasyon) ile yoğunluk seviyesi tutulacak gruplar
//  - alternatives: bu grup yoğunsa önerilecek diğer gruplar
const groups = [
  { groupId: 'A', name: 'A blok asansörleri', blocks: ['A'], trackCrowd: true, alternatives: [], crowdLevel: 'low' },
  { groupId: 'A-PERSONEL', name: 'A blok personel asansörü', blocks: ['A'], trackCrowd: false, alternatives: [], crowdLevel: 'low' },
  { groupId: 'B-IKILI', name: 'B blok ikili asansörler', blocks: ['B'], trackCrowd: true, alternatives: ['BC-UCLU'], crowdLevel: 'low' },
  { groupId: 'BC-UCLU', name: 'B blok üçlü asansörler (B ve C ortak)', blocks: ['B', 'C'], trackCrowd: true, alternatives: ['B-IKILI'], crowdLevel: 'high' },
  { groupId: 'ACIL', name: 'Acil durum asansörleri', blocks: ['A', 'B', 'C'], trackCrowd: false, alternatives: [], crowdLevel: 'low' }
];

const elevators = [
  { elevatorId: 'A-1', groupId: 'A', name: 'A blok asansör 1', type: 'student', blocks: ['A'], floorFrom: 1, floorTo: 6 },
  { elevatorId: 'A-2', groupId: 'A', name: 'A blok asansör 2', type: 'student', blocks: ['A'], floorFrom: 1, floorTo: 6 },
  { elevatorId: 'A-3', groupId: 'A', name: 'A blok asansör 3', type: 'student', blocks: ['A'], floorFrom: 1, floorTo: 6 },
  {
    elevatorId: 'A-P1', groupId: 'A-PERSONEL', name: 'A blok personel asansörü', type: 'staff', blocks: ['A'],
    floorFrom: 7, floorTo: 14, note: 'Hoca ofislerinin olduğu üst katlar. Gerçek adı okuldan öğrenilince güncellenecek.'
  },
  { elevatorId: 'B-I-1', groupId: 'B-IKILI', name: 'B blok ikili asansör 1', type: 'student', blocks: ['B'], floorFrom: 1, floorTo: 9 },
  { elevatorId: 'B-I-2', groupId: 'B-IKILI', name: 'B blok ikili asansör 2', type: 'student', blocks: ['B'], floorFrom: 1, floorTo: 9, status: 'Under Maintenance' },
  { elevatorId: 'BC-U-1', groupId: 'BC-UCLU', name: 'B blok üçlü asansör 1', type: 'student', blocks: ['B', 'C'], floorFrom: 1, floorTo: 11, note: 'C blok da bu asansörleri kullanır.' },
  { elevatorId: 'BC-U-2', groupId: 'BC-UCLU', name: 'B blok üçlü asansör 2', type: 'student', blocks: ['B', 'C'], floorFrom: 1, floorTo: 11, note: 'C blok da bu asansörleri kullanır.' },
  { elevatorId: 'BC-U-3', groupId: 'BC-UCLU', name: 'B blok üçlü asansör 3', type: 'student', blocks: ['B', 'C'], floorFrom: 1, floorTo: 11, note: 'C blok da bu asansörleri kullanır.' },
  { elevatorId: 'ACIL-A', groupId: 'ACIL', name: 'A blok acil durum asansörü', type: 'emergency', blocks: ['A'] },
  { elevatorId: 'ACIL-B', groupId: 'ACIL', name: 'B blok acil durum asansörü', type: 'emergency', blocks: ['B'] },
  { elevatorId: 'ACIL-C', groupId: 'ACIL', name: 'C blok acil durum asansörü', type: 'emergency', blocks: ['C'], note: 'C blokta acil asansör olup olmadığı doğrulanacak.' }
].map((e, i) => ({ ...e, order: i }));

module.exports = { groups, elevators };
