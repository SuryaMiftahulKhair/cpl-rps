import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export const createNewKurikulum = async (data) => {
  try {
    const kurikulum = await prisma.kurikulum.create({
      data: {
        nama: data.nama,
        tahun: data.tahun,
        programStudi: {
          connect: { id: data.program_studi_id },
        },
      },
      include: {
        programStudi: true, 
      }
    });
    return kurikulum;
  } catch (error) {
    throw error;
  }
};


export const fetchAllKurikulum = async () => {
    try {
        const allKurikulum = await prisma.kurikulum.findMany({
            orderBy: {
                tahun: 'desc', 
            },
            include: { programStudi: true } 
        });
        return allKurikulum;
    } catch (error) {
         throw error;
    }
};


export const fetchKurikulumById = async (id) => {
    try {
        const kurikulum = await prisma.kurikulum.findUnique({
            where: { id: id },
             include: {
                programStudi: true,
                mataKuliah: { 
                    orderBy: { kode_mk: 'asc' }
                }
            }
        });
        return kurikulum;
    } catch (error) {
         throw error;
    }
};


export const updateExistingKurikulum = async (id, data) => {
    try {
        const updatedKurikulum = await prisma.kurikulum.update({
            where: { id: id },
            data: data,
            include: { programStudi: true } 
        });
        return updatedKurikulum;
    } catch (error) {
        throw error;
    }
};


export const deleteExistingKurikulum = async (id) => {
    try {
        await prisma.kurikulum.delete({
            where: { id: id },
        });
    } catch (error) {
         throw error;
    }
};