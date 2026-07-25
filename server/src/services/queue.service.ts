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
      projectedEnd:
        queueStartedAt + (originalIndex + 1) * CONSULTATION_MINUTES * 60000,
    }))
    .filter((window) => window.projectedEnd > now.getTime());
  return activeWindows.map(({ item }, index) => {
    const queuePosition = index + 1;
    return {
      ...item,
      queuePosition,
      liveWaitMinutes: index * CONSULTATION_MINUTES,
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
  const queues = new Map<string, typeof appointments>();
  for (const appointment of appointments) {
    const queueTime =
      appointment.selectedTime ?? appointment.startsAt.toISOString().slice(11, 16);
    queues.set(queueTime, [
      ...(queues.get(queueTime) ?? []),
      appointment,
    ]);
  }
  const queue = [...queues.values()].flatMap((items) =>
    liveQueueValues(items, now),
  );
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
    selectedTime: string | null;
    status: string;
    queuePosition: number;
  },
>(db: Db, appointments: T[]) {
  const groups = new Map<
    string,
    { doctorId: string; selectedDay: number; selectedTime: string | null }
  >();
  for (const appointment of appointments) {
    const selectedDay =
      appointment.selectedDay ?? appointment.startsAt.getDay();
    const queueTime =
      appointment.selectedTime ?? appointment.startsAt.toISOString().slice(11, 16);
    const key = `${appointment.doctorId}:${selectedDay}:${queueTime}`;
    groups.set(key, {
      doctorId: appointment.doctorId,
      selectedDay,
      selectedTime: appointment.selectedTime,
    });
  }
  const values = new Map<
    string,
    {
      queuePosition: number;
      liveWaitMinutes: number;
      estimatedWaitMinutes: number;
    }
  >();
  for (const group of groups.values()) {
    const completeQueue = await db.appointment.findMany({
      where: {
        doctorId: group.doctorId,
        selectedDay: group.selectedDay,
        selectedTime: group.selectedTime,
        status: { in: [...activeStatuses] },
      },
      orderBy: { bookingTimestamp: "asc" },
    });
    for (const item of liveQueueValues(completeQueue))
      values.set(item.id, {
        queuePosition: item.queuePosition,
        liveWaitMinutes: item.liveWaitMinutes,
        estimatedWaitMinutes: item.liveWaitMinutes,
      });
  }
  return appointments.map((item) => ({
    ...item,
    ...(values.get(item.id) ?? {
      queuePosition: item.queuePosition,
      liveWaitMinutes: 0,
      estimatedWaitMinutes: 0,
    }),
  }));
}
