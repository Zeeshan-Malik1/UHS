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
  },
>(items: T[], now = new Date()) {
  const queue = items
    .filter((item) =>
      activeStatuses.includes(item.status as (typeof activeStatuses)[number]),
    )
    .sort(
      (a, b) => a.bookingTimestamp.getTime() - b.bookingTimestamp.getTime(),
    );
  const queueStartedAt = queue[0]?.bookingTimestamp.getTime() ?? now.getTime();
  return queue.map((item, index) => {
    const queuePosition = index + 1;
    const projectedStart =
      queueStartedAt + index * CONSULTATION_MINUTES * 60000;
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
  },
>(db: Db, appointments: T[]) {
  const groups = new Map<string, T[]>();
  for (const appointment of appointments) {
    const key = `${appointment.doctorId}:${appointment.selectedDay ?? appointment.startsAt.getDay()}`;
    groups.set(key, [...(groups.get(key) ?? []), appointment]);
  }
  const values = new Map<
    string,
    { queuePosition: number; liveWaitMinutes: number }
  >();
  for (const group of groups.values()) {
    for (const item of liveQueueValues(group)) values.set(item.id, item);
  }
  return appointments.map((item) => ({
    ...item,
    ...(values.get(item.id) ?? { liveWaitMinutes: 0 }),
  }));
}
