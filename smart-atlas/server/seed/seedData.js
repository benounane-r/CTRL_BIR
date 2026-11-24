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
    { category: 'Asansör', block: 'A', floor: 0, elevatorId: 'A-2', description: 'Asansörün kapısı geç kapanıyor, zaman zaman takılıyor.', status: 'open' },
    { category: 'Klima/ısıtma', block: 'B', floor: 4, room: 'B4-05', description: 'Sınıfta klima çalışmıyor, çok sıcak.', status: 'in_progress' }
  ]);

  // Çalışma odaları (örnek)
  await StudyRoom.insertMany([
    { roomId: 'SR-1', name: 'Çalışma Odası 1', block: 'B', floor: 3, capacity: 2, status: 'free' },
    { roomId: 'SR-2', name: 'Çalışma Odası 2', block: 'B', floor: 3, capacity: 4, status: 'occupied', occupiedSince: new Date(), statusSource: 'student' },
    { roomId: 'SR-3', name: 'Çalışma Odası 3', block: 'B', floor: 4, capacity: 6, status: 'free' },
    { roomId: 'SR-4', name: 'Çalışma Odası 4', block: 'C', floor: 2, capacity: 4, status: 'free' },
    { roomId: 'SR-5', name: 'Çalışma Odası 5', block: 'A', floor: 3, capacity: 2, status: 'occupied', occupiedSince: new Date(), statusSource: 'student' }
  ]);

  // Kampüs yoğunluk bölgeleri (isim ve kapasiteler örnek)
  const today = todayKey();
  await Area.insertMany([
    { areaId: 'kafe-1', name: 'Kafe 1', location: 'Zemin kat', type: 'sensor', capacity: 60, count: 24, countDate: today },
    { areaId: 'kafe-2', name: 'Kafe 2', location: 'Zemin kat', type: 'sensor', capacity: 60, count: 41, countDate: today },
    { areaId: 'yemekhane', name: 'Yemekhane', location: 'B blok 9. kat', type: 'sensor', capacity: 300, count: 130, countDate: today },
    { areaId: 'cadde', name: 'Cadde ortak oturma alanı', location: 'Okul caddesi', type: 'report', capacity: 200 },
    { areaId: 'bahce', name: 'Bahçe', location: 'Kampüs bahçesi', type: 'report', capacity: 100 }
  ]);
  await DensityReport.insertMany([
    { areaId: 'cadde', level: 'medium' },
    { areaId: 'cadde', level: 'high' }
  ]);

  return {
    elevators: elevators.length,
    classrooms: classroomData.length,
    lessons: real.length + sample.length
  };
}

module.exports = { seedAll };
