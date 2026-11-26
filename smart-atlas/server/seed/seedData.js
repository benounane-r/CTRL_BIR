const Elevator = require('../models/Elevator');
const ElevatorGroup = require('../models/ElevatorGroup');
const Classroom = require('../models/Classroom');
const Lesson = require('../models/Lesson');
const Fault = require('../models/Fault');
const StudyRoom = require('../models/StudyRoom');
const Notification = require('../models/Notification');
const Area = require('../models/Area');
const DensityReport = require('../models/DensityReport');

const classroomData = require('../data/classrooms');
const realLessons = require('../data/realLessons');
const { groups, elevators } = require('../data/elevators');
const { toMinutes, todayKey } = require('../services/timeUtils');
const { overlaps } = require('../services/classroomService');
const { buildSampleLessons } = require('./seedData.pure');

async function seedAll() {
  await Promise.all([
    Elevator.deleteMany({}), ElevatorGroup.deleteMany({}), Classroom.deleteMany({}), Lesson.deleteMany({}),
    Fault.deleteMany({}), StudyRoom.deleteMany({}), Notification.deleteMany({}), Area.deleteMany({}),
    DensityReport.deleteMany({})
  ]);

  // Asansörler
  await ElevatorGroup.insertMany(groups);
  await Elevator.insertMany(elevators);

  // Derslikler ve ders programı (gerçek dersler + örnek dersler)
  await Classroom.insertMany(classroomData);
  const real = realLessons.map((l) => ({
    classroomCode: l.classroomCode, day: l.day, startMinutes: toMinutes(l.start), endMinutes: toMinutes(l.end), source: 'real'
  }));
  const sample = buildSampleLessons(classroomData).filter(
    (s) => !real.some((r) => r.classroomCode === s.classroomCode && r.day === s.day && overlaps(r.startMinutes, r.endMinutes, s.startMinutes, s.endMinutes))
  );
  await Lesson.insertMany([...real, ...sample]);

  // Arızalar (örnek)
  await Fault.insertMany([
    { category: 'Elevator', block: 'A', floor: 0, elevatorId: 'A-2', description: 'The elevator door closes slowly and occasionally gets stuck.', status: 'open' },
    { category: 'Air Conditioning/Heating', block: 'B', floor: 4, room: 'B4-05', description: 'The air conditioning is not working in the classroom.', status: 'in_progress' }
  ]);

  // Çalışma odaları (örnek)
  await StudyRoom.insertMany([
    { roomId: 'SR-1', name: 'Study Room 1', block: 'B', floor: 3, capacity: 2, status: 'free' },
    { roomId: 'SR-2', name: 'Study Room 2', block: 'B', floor: 3, capacity: 4, status: 'occupied', occupiedSince: new Date(), statusSource: 'student' },
    { roomId: 'SR-3', name: 'Study Room 3', block: 'B', floor: 4, capacity: 6, status: 'free' },
    { roomId: 'SR-4', name: 'Study Room 4', block: 'C', floor: 2, capacity: 4, status: 'free' },
    { roomId: 'SR-5', name: 'Study Room 5', block: 'A', floor: 3, capacity: 2, status: 'occupied', occupiedSince: new Date(), statusSource: 'student' }
  ]);

  // Kampüs yoğunluk bölgeleri (isim ve kapasiteler örnek)
  const today = todayKey();

await Area.insertMany([
  { areaId: 'cafe-1', name: 'Cafe 1', location: 'Ground Floor', type: 'sensor', capacity: 60, count: 24, countDate: today },
  { areaId: 'cafe-2', name: 'Cafe 2', location: 'Ground Floor', type: 'sensor', capacity: 60, count: 41, countDate: today },
  { areaId: 'cafeteria', name: 'Cafeteria', location: 'Block B, 9th Floor', type: 'sensor', capacity: 300, count: 130, countDate: today },
  { areaId: 'street', name: 'Street Common Seating Area', location: 'Campus Street', type: 'report', capacity: 200 },
  { areaId: 'garden', name: 'Garden', location: 'Campus Garden', type: 'report', capacity: 100 }
]);

await DensityReport.insertMany([
  { areaId: 'street', level: 'medium' },
  { areaId: 'street', level: 'high' }
]);

return {
  elevators: elevators.length,
  classrooms: classroomData.length,
  lessons: real.length + sample.length
};
}

module.exports = { seedAll };

