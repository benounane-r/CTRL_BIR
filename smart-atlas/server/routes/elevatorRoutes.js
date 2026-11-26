
const express = require('express');
const Elevator = require('../models/Elevator');
const ElevatorGroup = require('../models/ElevatorGroup');
const wrap = require('../utils/wrap');

const router = express.Router();

const CROWD_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  very_high: 'Very High'
};

// Warning displayed when an elevator group is crowded.
// Route calculation is handled by Navigation.
function crowdMessage(group, groupsById) {
  if (!group.trackCrowd) return null;
  if (group.crowdLevel !== 'high' && group.crowdLevel !== 'very_high') return null;

  const level = group.crowdLevel === 'very_high' ? 'very crowded' : 'crowded';
  const alts = (group.alternatives || [])
    .map((id) => groupsById.get(id))
    .filter(Boolean);

  if (alts.length === 0) {
    return `${group.name} is currently ${level}.`;
  }

  return `${group.name} is currently ${level}. Please consider using ${alts.map((a) => a.name).join(' or ')} instead.`;
}

// GET /api/elevators -> Returns elevators with their status and crowd level.
router.get(
  '/elevators',
  wrap(async (req, res) => {
    const [elevators, groups] = await Promise.all([
      Elevator.find().sort({ order: 1 }).lean(),
      ElevatorGroup.find().lean()
    ]);

    const byId = new Map(groups.map((g) => [g.groupId, g]));

    res.json(
      elevators.map((e) => {
        const g = byId.get(e.groupId);

        return {
          ...e,
          crowdLevel: g && g.trackCrowd ? g.crowdLevel : null,
          crowdMessage: g ? crowdMessage(g, byId) : null
        };
      })
    );
  })
);

// GET /api/elevator-groups -> Returns groups and crowd warnings.
router.get(
  '/elevator-groups',
  wrap(async (req, res) => {
    const groups = await ElevatorGroup.find().lean();
    const byId = new Map(groups.map((g) => [g.groupId, g]));

    res.json(
      groups.map((g) => ({
        ...g,
        crowdLabel: g.trackCrowd ? CROWD_LABELS[g.crowdLevel] : null,
        message: crowdMessage(g, byId)
      }))
    );
  })
);

// PATCH /api/elevators/:id { status }
// Allowed values: Working | Out of Service | Under Maintenance
router.patch(
  '/elevators/:id',
  wrap(async (req, res) => {
    const { status } = req.body || {};

    if (!Elevator.STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Status must be one of: ${Elevator.STATUSES.join(', ')}`
      });
    }

    const updated = await Elevator.findOneAndUpdate(
      { elevatorId: req.params.id },
      { status, statusUpdatedAt: new Date() },
      { new: true }
    ).lean();

    if (!updated) {
      return res.status(404).json({ error: 'Elevator not found' });
    }

    res.json(updated);
  })
);

// PATCH /api/elevator-groups/:groupId { crowdLevel }
// Simulates camera-based crowd monitoring.
router.patch(
  '/elevator-groups/:groupId',
  wrap(async (req, res) => {
    const { crowdLevel } = req.body || {};

    if (!ElevatorGroup.CROWD_LEVELS.includes(crowdLevel)) {
      return res.status(400).json({
        error: `Crowd level must be one of: ${ElevatorGroup.CROWD_LEVELS.join(', ')}`
      });
    }

    const group = await ElevatorGroup.findOne({
      groupId: req.params.groupId
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.trackCrowd) {
      return res.status(400).json({
        error: 'Crowd tracking is not enabled for this group'
      });
    }

    group.crowdLevel = crowdLevel;
    group.crowdUpdatedAt = new Date();

    await group.save();

    res.json(group);
  })
);

module.exports = router;
