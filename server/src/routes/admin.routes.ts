import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { AppError } from "../lib/errors.js";
import { notificationService } from "../services/notification.service.js";
const router = Router();
router.use(authenticate, authorize("ADMIN"));
router.get("/analytics", async (_req, res) => {
  const [patients, doctors, pendingDoctors, hospitals, appointments] =
    await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count({ where: { user: { status: "ACTIVE" } } }),
      prisma.doctor.count({ where: { user: { status: "PENDING" } } }),
      prisma.hospital.count({ where: { active: true } }),
      prisma.appointment.groupBy({ by: ["status"], _count: true }),
    ]);
  res.json({
    success: true,
    data: { patients, doctors, pendingDoctors, hospitals, appointments },
  });
});
router.get("/patients", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q : undefined;
  const patients = await prisma.patient.findMany({
    where: q
      ? {
          user: {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { email: { contains: q } },
            ],
          },
        }
      : undefined,
    include: {
      user: true,
      appointments: true,
      labReports: true,
      predictions: true,
    },
    orderBy: { user: { createdAt: "desc" } },
  });
  res.json({ success: true, data: patients });
});
router.get("/doctors", async (req, res) => {
  const status =
    typeof req.query.status === "string" ? req.query.status : undefined;
  const doctors = await prisma.doctor.findMany({
    where: status ? { user: { status: status as any } } : undefined,
    include: {
      user: true,
      hospital: true,
      department: true,
      appointments: true,
      reviews: true,
      availability: true,
    },
    orderBy: { user: { createdAt: "desc" } },
  });
  res.json({ success: true, data: doctors });
});
router.get("/appointments", async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1),
    pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 20)),
    q = typeof req.query.q === "string" ? req.query.q : undefined,
    status =
      typeof req.query.status === "string" ? req.query.status : undefined;
  const where: any = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          OR: [
            { appointmentNumber: { contains: q } },
            {
              patient: {
                user: {
                  OR: [
                    { firstName: { contains: q } },
                    { lastName: { contains: q } },
                  ],
                },
              },
            },
            {
              doctor: {
                user: {
                  OR: [
                    { firstName: { contains: q } },
                    { lastName: { contains: q } },
                  ],
                },
              },
            },
          ],
        }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.appointment.findMany({
      where,
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.appointment.count({ where }),
  ]);
  res.json({
    success: true,
    data: { items, total, page, pageSize, pages: Math.ceil(total / pageSize) },
  });
});
router.patch("/users/:id/status", async (req, res) => {
  const { status } = z
    .object({ status: z.enum(["ACTIVE", "PENDING", "SUSPENDED", "REJECTED"]) })
    .parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { status },
    select: { id: true, status: true },
  });
  res.json({ success: true, data: user });
});
router.delete("/users/:id", async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
router.delete("/doctors/:id", async (req, res) => {
  const doctor = await prisma.doctor.findUnique({
    where: { id: req.params.id },
  });
  if (!doctor) throw new AppError(404, "Doctor not found");
  await prisma.user.delete({ where: { id: doctor.userId } });
  res.status(204).end();
});
router.delete("/patients/:id", async (req, res) => {
  const patient = await prisma.patient.findUnique({
    where: { id: req.params.id },
  });
  if (!patient) throw new AppError(404, "Patient not found");
  await prisma.user.delete({ where: { id: patient.userId } });
  res.status(204).end();
});
router.delete("/appointments/:id", async (req, res) => {
  await prisma.appointment.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
router.get("/requests", async (_req, res) => {
  const [doctors, patients, appointments] = await Promise.all([
    prisma.doctor.findMany({
      include: { user: true, availability: true },
      orderBy: { user: { createdAt: "desc" } },
    }),
    prisma.patient.findMany({
      include: {
        user: true,
        appointments: { include: { doctor: { include: { user: true } } } },
      },
      orderBy: { user: { createdAt: "desc" } },
    }),
    prisma.appointment.findMany({
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  res.json({ success: true, data: { doctors, patients, appointments } });
});
router.get("/doctors/pending", async (_req, res) =>
  res.json({
    success: true,
    data: await prisma.doctor.findMany({
      where: { user: { status: "PENDING" } },
      include: { user: true },
    }),
  }),
);
router.patch("/doctors/:id/status", async (req, res) => {
  const { status } = z
    .object({ status: z.enum(["ACTIVE", "REJECTED"]) })
    .parse(req.body);
  const doctor = await prisma.doctor.findUnique({
    where: { id: req.params.id },
  });
  if (!doctor) throw new AppError(404, "Doctor not found");
  await prisma.user.update({ where: { id: doctor.userId }, data: { status } });
  if (status === "ACTIVE")
    await prisma.doctor.update({
      where: { id: doctor.id },
      data: { approvedAt: new Date() },
    });
  await notificationService.create(
    doctor.userId,
    "SYSTEM",
    `Doctor account ${status === "ACTIVE" ? "approved" : "rejected"}`,
    status === "ACTIVE"
      ? "You can now access your doctor dashboard."
      : "Please contact support for more information.",
  );
  res.json({ success: true, data: { id: doctor.id, status } });
});
export default router;
