import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { AppError } from '../lib/errors.js';
import { notificationService } from '../services/notification.service.js';
import { emailService } from '../services/email.service.js';

const router = Router();
router.use(authenticate);

router.post('/', authorize('PATIENT'), async (req, res) => {
  const data = z.object({
    doctorId: z.string(),
    startsAt: z.iso.datetime(),
    reason: z.string().min(3),
    symptoms: z.array(z.string()).default([]),
  }).parse(req.body);
  const startsAt = new Date(data.startsAt);
  if (startsAt <= new Date()) throw new AppError(422, 'Appointment must be in the future');
  const patient = await prisma.patient.findUniqueOrThrow({ where: { userId: req.auth!.userId } });
  const doctor = await prisma.doctor.findUnique({ where: { id: data.doctorId }, include: { user: true } });
  if (!doctor || doctor.user.status !== 'ACTIVE') throw new AppError(404, 'Doctor is unavailable');
  const endsAt = new Date(startsAt.getTime() + 30 * 60000);
  try {
    const appointment = await prisma.appointment.create({
      data: { patientId: patient.id, doctorId: doctor.id, startsAt, endsAt, reason: data.reason, symptoms: data.symptoms, appointmentNumber: `UHS-${Date.now().toString(36).toUpperCase()}` },
    });
    await notificationService.create(doctor.userId, 'APPOINTMENT', 'New appointment request', `A patient requested ${startsAt.toLocaleString()}`, { appointmentId: appointment.id });
    res.status(201).json({ success: true, data: appointment });
  } catch (error: any) {
    if (error.code === 'P2002') throw new AppError(409, 'This appointment slot was just booked. Please choose another.', 'SLOT_UNAVAILABLE');
    throw error;
  }
});

router.get('/', async (req, res) => {
  const where = req.auth!.role === 'PATIENT' ? { patient: { userId: req.auth!.userId } } : req.auth!.role === 'DOCTOR' ? { doctor: { userId: req.auth!.userId } } : {};
  const appointments = await prisma.appointment.findMany({ where, include: { doctor: { include: { user: true } }, patient: { include: { user: true } }, medicalRecord: { include: { prescription: { include: { items: { include: { medicine: true } } } }, labReports: true } } }, orderBy: { startsAt: 'desc' } });
  res.json({ success: true, data: appointments });
});

router.patch('/:id/status', authorize('DOCTOR', 'ADMIN'), async (req, res) => {
  const { status, reason } = z.object({ status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']), reason: z.string().optional() }).parse(req.body);
  const current = await prisma.appointment.findUnique({ where: { id: String(req.params.id) }, include: { patient: { include: { user: true } }, doctor: true } });
  if (!current) throw new AppError(404, 'Appointment not found');
  if (req.auth!.role === 'DOCTOR' && current.doctor.userId !== req.auth!.userId) throw new AppError(403, 'This appointment belongs to another doctor');
  const appointment = await prisma.appointment.update({ where: { id: current.id }, data: { status, cancellationReason: reason } });
  await notificationService.create(current.patient.userId, 'APPOINTMENT', `Appointment ${status.toLowerCase()}`, `Appointment ${current.appointmentNumber} is now ${status.toLowerCase()}`, { appointmentId: current.id });
  await emailService.send(current.patient.user.email, `UHS appointment ${status.toLowerCase()}`, `<p>Your appointment is now <strong>${status}</strong>.</p>`);
  res.json({ success: true, data: appointment });
});

router.post('/:id/consultation', authorize('DOCTOR'), async (req, res) => {
  const data = z.object({
    diagnosis: z.string().min(2),
    notes: z.string().min(2),
    recommendations: z.string().optional(),
    medicines: z.array(z.object({ name: z.string().min(1), dosage: z.string().min(1), frequency: z.string().min(1), duration: z.string().min(1), instructions: z.string().optional() })).default([]),
    labTests: z.array(z.string()).default([]),
    labReports: z.array(z.object({ testName: z.string().min(1), fileUrl: z.string().optional(), result: z.string().optional(), status: z.string().default('UPLOADED') })).default([]),
    dietPlan: z.string().optional(),
    workoutPlan: z.string().optional(),
    nextVisit: z.string().optional(),
  }).parse(req.body);
  const appointmentId = z.string().parse(req.params.id);
  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId }, include: { doctor: true, patient: { include: { user: true } } } });
  if (!appointment) throw new AppError(404, 'Appointment not found');
  if (appointment.doctor.userId !== req.auth!.userId) throw new AppError(403, 'This appointment belongs to another doctor');
  const record = await prisma.$transaction(async tx => {
    const medicalRecord = await tx.medicalRecord.upsert({
      where: { appointmentId: appointment.id },
      update: { diagnosis: data.diagnosis, notes: data.notes, recommendations: data.recommendations },
      create: { appointmentId: appointment.id, patientId: appointment.patientId, doctorId: appointment.doctorId, diagnosis: data.diagnosis, notes: data.notes, recommendations: data.recommendations },
    });
    const prescription = await tx.prescription.upsert({
      where: { medicalRecordId: medicalRecord.id },
      update: { instructions: data.recommendations },
      create: { medicalRecordId: medicalRecord.id, patientId: appointment.patientId, doctorId: appointment.doctorId, instructions: data.recommendations },
    });
    await tx.prescriptionMedicine.deleteMany({ where: { prescriptionId: prescription.id } });
    for (const item of data.medicines) {
      const medicine = await tx.medicine.upsert({ where: { id: `med-${item.name.toLowerCase().replaceAll(' ', '-')}` }, update: { name: item.name }, create: { id: `med-${item.name.toLowerCase().replaceAll(' ', '-')}`, name: item.name } });
      await tx.prescriptionMedicine.create({ data: { prescriptionId: prescription.id, medicineId: medicine.id, dosage: item.dosage, frequency: item.frequency, duration: item.duration, instructions: item.instructions } });
    }
    for (const testName of data.labTests) await tx.labReport.create({ data: { patientId: appointment.patientId, medicalRecordId: medicalRecord.id, testName, status: 'REQUESTED' } });
    for (const report of data.labReports) await tx.labReport.create({ data: { patientId: appointment.patientId, medicalRecordId: medicalRecord.id, testName: report.testName, result: report.result, status: report.status, fileUrl: report.fileUrl } });
    if (data.dietPlan) await tx.dietPlan.create({ data: { patientId: appointment.patientId, title: 'Doctor recommended diet', content: { plan: data.dietPlan }, startsAt: new Date() } });
    if (data.workoutPlan) await tx.workoutPlan.create({ data: { patientId: appointment.patientId, title: 'Doctor recommended workout', content: { plan: data.workoutPlan }, startsAt: new Date() } });
    await tx.appointment.update({ where: { id: appointment.id }, data: { status: 'COMPLETED' } });
    return medicalRecord;
  });
  await notificationService.create(appointment.patient.userId, 'PRESCRIPTION', 'Consultation updated', 'Your diagnosis, prescription, and care plan are ready.', { appointmentId: appointment.id, medicalRecordId: record.id });
  res.status(201).json({ success: true, data: record });
});

export default router;
