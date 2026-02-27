//src/store/useProdiStore.ts

import { Jenjang } from "@prisma/client";
import { act } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProdiState {
  activeProdiId: number | null;
  activeProdiName: string | null;
  activeProdiJenjang: string | null;
  setActiveProdi: (id: number, nama: string, jenjang: string) => void;
}

export const useProdiStore = create<ProdiState>()(
  persist(
    (set) => ({
      activeProdiId: null,
      activeProdiName: null,
      activeProdiJenjang: null,
      // Fungsi untuk set ID dan Nama sekaligus
      setActiveProdi: (id, nama, jenjang) =>
        set({
          activeProdiId: id,
          activeProdiName: nama,
          activeProdiJenjang: jenjang, // Ambil jenjang dari nama prodi (misal "S1 Teknik Informatika" -> "S1")
        }),
    }),
    {
      name: "prodi-storage", // Data akan disimpan di LocalStorage browser
    },
  ),
);
