
// Offline copy of the server elevator list.
// Used when the server cannot be reached.

const E = (elevatorId, groupId, type, blocks, floorFrom, floorTo, extra = {}) => ({
  elevatorId,
  groupId,
  type,
  blocks,
  floorFrom,
  floorTo,
  status: "Working",
  ...extra,
});

export const ELEVATOR_SNAPSHOT = [
  E("A-1", "A", "student", ["A"], 1, 6, { crowdLevel: "low" }),
  E("A-2", "A", "student", ["A"], 1, 6, { crowdLevel: "low" }),
  E("A-3", "A", "student", ["A"], 1, 6, { crowdLevel: "low" }),
  E("A-P1", "A-STAFF", "staff", ["A"], 7, 14),
  E("B-I-1", "B-DOUBLE", "student", ["B"], 1, 9, { crowdLevel: "low" }),
  E("B-I-2", "B-DOUBLE", "student", ["B"], 1, 9, { crowdLevel: "low", status: "Under Maintenance" }),
  E("BC-U-1", "BC-TRIPLE", "student", ["B", "C"], 1, 11, { crowdLevel: "high" }),
  E("BC-U-2", "BC-TRIPLE", "student", ["B", "C"], 1, 11, { crowdLevel: "high" }),
  E("BC-U-3", "BC-TRIPLE", "student", ["B", "C"], 1, 11, { crowdLevel: "high" }),
  E("EMERGENCY-A", "EMERGENCY", "emergency", ["A"]),
  E("EMERGENCY-B", "EMERGENCY", "emergency", ["B"]),
  E("EMERGENCY-C", "EMERGENCY", "emergency", ["C"]),
];
