import { prisma } from "@/lib/prisma";

export async function getAllCompanys() {
  return prisma.company.findMany();
}
export async function getCompanyById(id: number) {
  return prisma.company.findUnique({
    where: { id },
  });
}
export async function createCompany(data: { name: string }) {
  return prisma.company.create({
    data,
  });
}

export async function updateCompany(id: number, data: { name?: string }) {
  return prisma.company.update({
    where: { id },
    data,
  });
}
export async function deleteCompany(id: number) {
  return prisma.company.delete({
    where: { id },
  });
}
