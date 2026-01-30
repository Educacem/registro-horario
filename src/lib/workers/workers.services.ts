import { prisma } from "@/lib/prisma";

export async function getWorkerById(id: number) {
  return prisma.worker.findUnique({
    where: { id },
  });
}
export async function getAllWorkers() {
  return prisma.worker.findMany();
}

export async function createWorker(data: {
  dni: string;
  name: string;
  lastName: string;
}) {
  return prisma.worker.create({
    data,
  });
}

export async function updateWorker(
  id: number,
  data: { dni?: string; name?: string; lastName?: string },
) {
  return prisma.worker.update({
    where: { id },
    data,
  });
}

export async function deleteWorker(id: number) {
  return prisma.worker.delete({
    where: { id },
  });
}

export async function softDeleteWorker(id: number) {
  return prisma.worker.update({
    where: { id },
    data: { active: false },
  });
}

export async function restoreWorker(id: number) {
  return prisma.worker.update({
    where: { id },
    data: { active: true },
  });
}

export async function findWorkerByDni(dni: string) {
  return prisma.worker.findUnique({
    where: { dni },
  });
}

export async function getWorkerByName(name: string) {
  return prisma.worker.findFirst({
    where: { name },
  });
}
