
// School elevator layout.
//  - trackCrowd: groups whose crowd levels are tracked by camera (simulation)
//  - alternatives: other groups suggested when this group is crowded
const groups = [
  { groupId: 'A', name: 'Block A Elevators', blocks: ['A'], trackCrowd: true, alternatives: [], crowdLevel: 'low' },
  { groupId: 'A-STAFF', name: 'Block A Staff Elevator', blocks: ['A'], trackCrowd: false, alternatives: [], crowdLevel: 'low' },
  { groupId: 'B-DOUBLE', name: 'Block B Double Elevators', blocks: ['B'], trackCrowd: true, alternatives: ['BC-TRIPLE'], crowdLevel: 'low' },
  { groupId: 'BC-TRIPLE', name: 'Block B Triple Elevators (Shared by Blocks B and C)', blocks: ['B', 'C'], trackCrowd: true, alternatives: ['B-DOUBLE'], crowdLevel: 'high' },
  { groupId: 'EMERGENCY', name: 'Emergency Elevators', blocks: ['A', 'B', 'C'], trackCrowd: false, alternatives: [], crowdLevel: 'low' }
];

const elevators = [
  { elevatorId: 'A-1', groupId: 'A', name: 'Block A Elevator 1', type: 'student', blocks: ['A'], floorFrom: 1, floorTo: 6 },
  { elevatorId: 'A-2', groupId: 'A', name: 'Block A Elevator 2', type: 'student', blocks: ['A'], floorFrom: 1, floorTo: 6 },
  { elevatorId: 'A-3', groupId: 'A', name: 'Block A Elevator 3', type: 'student', blocks: ['A'], floorFrom: 1, floorTo: 6 },
  {
    elevatorId: 'A-P1', groupId: 'A-STAFF', name: 'Block A Staff Elevator', type: 'staff', blocks: ['A'],
    floorFrom: 7, floorTo: 14, note: 'Upper floors where the faculty offices are located. The name will be updated once confirmed by the university.'
  },
  { elevatorId: 'B-I-1', groupId: 'B-DOUBLE', name: 'Block B Double Elevator 1', type: 'student', blocks: ['B'], floorFrom: 1, floorTo: 9 },
  { elevatorId: 'B-I-2', groupId: 'B-DOUBLE', name: 'Block B Double Elevator 2', type: 'student', blocks: ['B'], floorFrom: 1, floorTo: 9, status: 'Under Maintenance' },
  { elevatorId: 'BC-U-1', groupId: 'BC-TRIPLE', name: 'Block B Triple Elevator 1', type: 'student', blocks: ['B', 'C'], floorFrom: 1, floorTo: 11, note: 'Block C also uses these elevators.' },
  { elevatorId: 'BC-U-2', groupId: 'BC-TRIPLE', name: 'Block B Triple Elevator 2', type: 'student', blocks: ['B', 'C'], floorFrom: 1, floorTo: 11, note: 'Block C also uses these elevators.' },
  { elevatorId: 'BC-U-3', groupId: 'BC-TRIPLE', name: 'Block B Triple Elevator 3', type: 'student', blocks: ['B', 'C'], floorFrom: 1, floorTo: 11, note: 'Block C also uses these elevators.' },
  { elevatorId: 'EMERGENCY-A', groupId: 'EMERGENCY', name: 'Block A Emergency Elevator', type: 'emergency', blocks: ['A'] },
  { elevatorId: 'EMERGENCY-B', groupId: 'EMERGENCY', name: 'Block B Emergency Elevator', type: 'emergency', blocks: ['B'] },
  { elevatorId: 'EMERGENCY-C', groupId: 'EMERGENCY', name: 'Block C Emergency Elevator', type: 'emergency', blocks: ['C'], note: 'It will be confirmed whether Block C has an emergency elevator.' }
].map((e, i) => ({ ...e, order: i }));

module.exports = { groups, elevators };
