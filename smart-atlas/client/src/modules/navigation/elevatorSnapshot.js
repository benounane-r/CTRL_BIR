// elevatorSnapshot.js - offline copy of Irem's elevator list (smart-atlas/server/data/elevators.js).
// Used ONLY when the server cannot be reached, so the navigation page still works in a demo.
// Keep it in sync with her file if she changes elevator ids or floors.

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
  E("A-P1", "A-PERSONEL", "staff", ["A"], 7, 14, { crowdLevel: null }),
  E("B-I-1", "B-IKILI", "student", ["B"], 1, 9, { crowdLevel: "low" }),
  E("B-I-2", "B-IKILI", "student", ["B"], 1, 9, { crowdLevel: "low", status: "Under Maintenance" }),
  E("BC-U-1", "BC-UCLU", "student", ["B", "C"], 1, 11, { crowdLevel: "high" }),
  E("BC-U-2", "BC-UCLU", "student", ["B", "C"], 1, 11, { crowdLevel: "high" }),
  E("BC-U-3", "BC-UCLU", "student", ["B", "C"], 1, 11, { crowdLevel: "high" }),
  E("ACIL-A", "ACIL", "emergency", ["A"], undefined, undefined, { crowdLevel: null }),
  E("ACIL-B", "ACIL", "emergency", ["B"], undefined, undefined, { crowdLevel: null }),
  E("ACIL-C", "ACIL", "emergency", ["C"], undefined, undefined, { crowdLevel: null }),
];
