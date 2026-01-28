import { prisma } from "@/lib/prisma";

export async function getWorkerTimeById(id: number) {
  return prisma.workTime.findMany({
    where: { workerId: id },
  });
}

export async function getAllWorkersTime() {
  return prisma.workTime.findMany();
}

export async function createWorkerTime(data: {
  workerId: number;
  date: Date;
  clockIn: Date;
  clockOut: Date;
}) {
  return prisma.workTime.create({
    data: {
      workerId: data.workerId,
      date: data.date,
      clockIn: data.clockIn,
      clockOut: data.clockOut,
    },
  });
}

export async function updateWorkerTime(
  id: number,
  data: {
    date?: Date;
    clockIn?: Date;
    clockOut?: Date;
  },
) {
  return prisma.workTime.update({
    where: { id },
    data: {
      date: data.date,
      clockIn: data.clockIn,
      clockOut: data.clockOut,
    },
  });
}

export async function deleteWorkerTime(id: number) {
  return prisma.workTime.delete({
    where: { id },
  });
}

export async function findDuplicateWorkStartTimeExact(
  workerId: number,
  clockIn: Date,
) {
  return prisma.workTime.findFirst({
    where: {
      workerId,
      clockIn: clockIn,
    },
  });
}
export async function findDuplicateWorkEndTimeExact(
  workerId: number,
  clockOut: Date,
) {
  return prisma.workTime.findFirst({
    where: {
      workerId,
      clockOut: clockOut,
    },
  });
}

export async function findWorkerTimeByWorkerId(workerId: number) {
  return prisma.workTime.findMany({
    where: {
      workerId,
    },
  });
}
