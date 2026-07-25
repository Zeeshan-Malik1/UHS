import type { Prisma, PrismaClient } from "@prisma/client";

export const CONSULTATION_MINUTES = 30;
const activeStatuses = ["PENDING", "APPROVED"] as const;
type Db = PrismaClient | Prisma.TransactionClient;

export function liveQueueValues<
  T extends {
    createdAt: Date;
    bookingTimestamp: Date;
    startsAt: Date;
    status: string;
    queuePosition: number;
  },
>(items: T[], now = new Date()) {
  const queue = items
    .filter((item) =>
      activeStatuses.includes(item.status as (typeof activeStatuses)[number]),
    )
    .sort(
      (a, b) => a.bookingTimestamp.getTime() - b.bookingTimestamp.getTime(),
    );
  const queueStartedAt = queue[0]?.startsAt.getTime() ?? now.getTime();
  const activeWindows = queue
    .map((item, originalIndex) => ({
      item,
      projectedStart:
        queueStartedAt + originalIndex * CONSULTATION_MINUTES * 60000,
      projectedEnd:
        queueStartedAt + (originalIndex + 1) * CONSULTATION_MINUTES * 60000,
    }))
    .filter((window) => window.projectedEnd > now.getTime());
  return activeWindows.map(({ item, projectedStart }, index) => {
    const queuePosition = index + 1;
    return {
      ...item,
      queuePosition,
      liveWaitMinutes: Math.max(
        0,
        Math.ceil((projectedStart - now.getTime()) / 60000),
      ),
    };
  });
}

export async function recalculateDoctorQueue(
  db: Db,
  doctorId: string,
  selectedDay: number,
  now = new Date(),
) {
  const appointments = await db.appointment.findMany({
    where: { doctorId, selectedDay, status: { in: [...activeStatuses] } },
    orderBy: { createdAt: "asc" },
  });
  const queue = liveQueueValues(appointments, now);
  await Promise.all(
    queue.map((item) =>
      db.appointment.update({
        where: { id: item.id },
        data: {
          queuePosition: item.queuePosition,
          estimatedWaitMinutes: item.liveWaitMinutes,
        },
      }),
    ),
  );
  return queue;
}

export async function appointmentsWithLiveQueue<
  T extends {
    id: string;
    doctorId: string;
    selectedDay: number | null;
    createdAt: Date;
    bookingTimestamp: Date;
    startsAt: Date;
    status: string;
    queuePosition: number;
  },
>(db: Db, appointments: T[]) {
  const groups = new Map<string, { doctorId: string; selectedDay: number }>();
  for (const appointment of appointments) {
    const selectedDay =
      appointment.selectedDay ?? appointment.startsAt.getDay();
    const key = `${appointment.doctorId}:${selectedDay}`;
    groups.set(key, { doctorId: appointment.doctorId, selectedDay });
  }
  const values = new Map<
    string,
    { queuePosition: number; liveWaitMinutes: number }
  >();
  for (const group of groups.values()) {
    const completeQueue = await db.appointment.findMany({
      where: {
        doctorId: group.doctorId,
        selectedDay: group.selectedDay,
        status: { in: [...activeStatuses] },
      },
      orderBy: { bookingTimestamp: "asc" },
    });
    for (const item of liveQueueValues(completeQueue))
      values.set(item.id, item);
  }
  return appointments.map((item) => ({
    ...item,
    ...(values.get(item.id) ?? {
      queuePosition: item.queuePosition,
      liveWaitMinutes: 0,
    }),
  }));
}
