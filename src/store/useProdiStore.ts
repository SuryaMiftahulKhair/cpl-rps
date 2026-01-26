import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProdiState {
  activeProdiId: number | null;
  activeProdiName: string | null;
  setActiveProdi: (id: number, nama: string) => void;
}

export const useProdiStore = create<ProdiState>()(
  persist(
    (set) => ({
      activeProdiId: null,
      activeProdiName: null,
      // Fungsi untuk set ID dan Nama sekaligus
      setActiveProdi: (id, nama) => set({ 
        activeProdiId: id, 
        activeProdiName: nama 
      }),
    }),
    {
      name: 'prodi-storage', // Data akan disimpan di LocalStorage browser
    }
  )
);