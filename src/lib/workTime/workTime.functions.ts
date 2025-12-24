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
  clockIn: Date;
  clockOut: Date;
}) {
  return prisma.workTime.create({
    data: {
      workerId: data.workerId,
      date: new Date(),
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
  }
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
