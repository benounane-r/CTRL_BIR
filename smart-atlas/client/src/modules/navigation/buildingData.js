// buildingData.js - the real Atlas building, from the team's floor table (24 Nov).
//
// >>> If something about the building is wrong, EDIT THIS FILE ONLY. <<<
// Levels are text, not numbers, because the building has "G", "A" and negative floors.
// Node ids look like "B:5:lobby" (block : level : kind), so levels can safely contain "-".

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => String(a + i));

// Levels of each block, listed bottom to top.
export const BLOCKS = {
  A: { levels: ["-3", "-2", "-1", "G", ...range(1, 14)] },
  B: { levels: ["-2", "-1", "G", "A", ...range(1, 11)] }, // "A" is an extra level between G and 1
  C: { levels: range(2, 5) }, // C has no ground floor and no floor 1
};

// Stairs. "service" = the storage/back stairs (slower, students probably should not need them).
export const STAIRS = [
  { id: "A-main", block: "A", from: "G", to: "6", service: false }, // A main staircase reaches floor 6
  { id: "A-service", block: "A", from: "-3", to: "14", service: true }, // A storage stair, -3 to 14
  { id: "B-main", block: "B", from: "-2", to: "11", service: false },
  { id: "C-main", block: "C", from: "2", to: "5", service: false }, // "same stairs as B"
];

// Walkable connections between blocks: [block, level, block, level].
// These are the rows where the table lines up (A3, A7 and B's level "A" have no neighbour).
export const CROSSINGS = [
  ["A", "G", "B", "G"],
  ["A", "1", "B", "1"],
  ["A", "2", "B", "2"],
  ["A", "4", "B", "3"],
  ["A", "5", "B", "4"],
  ["A", "6", "B", "5"],
  ["A", "8", "B", "6"],
  ["B", "2", "C", "2"],
  ["B", "3", "C", "3"],
  ["B", "4", "C", "4"],
  ["B", "5", "C", "5"],
];

// Where students walk in from outside. ASSUMPTION: ground floor of A and B. Please confirm.
export const ENTRANCES = [
  { id: "ENT-A", label: "Entrance - Block A (ground)", block: "A", level: "G" },
  { id: "ENT-B", label: "Entrance - Block B (ground)", block: "B", level: "G" },
];

// ASSUMPTIONS to confirm (flip them here if wrong):
// 1) Irem lists student elevators as starting at floor 1 (her list came from the school's floor plan, which
//    had no ground floor). We assume they also stop at the ground floor "G". Without this, nobody could
//    get from the entrance to any elevator without using stairs.
export const ELEVATORS_STOP_AT_GROUND = true;
// 2) Students may use the A-block service (storage) stairs. If not, set to false.
export const STUDENTS_MAY_USE_SERVICE_STAIRS = true;

// Route costs (roughly seconds).
export const COST = {
  access: 1, // lobby <-> elevator door
  stairsAccess: 2, // lobby <-> staircase
  elevatorStep: 1, // one floor by elevator
  stairsStep: 3, // one floor by stairs
  serviceStairsStep: 6, // one floor by service stairs
  crossing: 4, // walking from one block to the next
};

// Extra cost for boarding an elevator group that the camera simulation reports as busy.
export const CROWD_PENALTY = { low: 0, medium: 2, high: 6, very_high: 12 };
