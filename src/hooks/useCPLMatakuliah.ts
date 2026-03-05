// src/hooks/useCPLMatakuliah.ts
import { useState, useEffect, useMemo } from 'react';

// --- Types ---
export interface TahunAjaran {
  id: number;
  tahun: string;
  semester: string;
}

export interface Matakuliah {
  id: number;
  code: string;
  name: string;
}

export interface RadarItem {
  subject: string;
  prodi: number;
  target: number;
}

export interface ClassDetail {
  id: number;
  class_name: string;
  total_students: number;
  scores: Record<string, number>; // { "CPL-01": 80, "CPL-02": 75 }
}

export type FilterType = "SEMUA" | "TAHUN" | "SEMESTER";

export const useCPLMatakuliah = () => {
  // --- STATE: Master Data ---
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [matakuliahList, setMatakuliahList] = useState<Matakuliah[]>([]);
  
  // --- STATE: Filter Controls ---
  const [filterType, setFilterType] = useState<FilterType>("SEMESTER");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // --- STATE: Data Report ---
  const [radarData, setRadarData] = useState<RadarItem[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  
  // --- STATE: UI ---
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Initial Load: Ambil Daftar Tahun Ajaran & Matakuliah
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Tahun Ajaran
        const resSemester = await fetch("/api/tahunAjaran");
        const jsonSemester = await resSemester.json();
        const dataSemester = Array.isArray(jsonSemester) ? jsonSemester : jsonSemester.data || [];
        setSemesterList(dataSemester);

        // Fetch Daftar Matakuliah
        const resCourse = await fetch("/api/matakuliah");
        const jsonCourse = await resCourse.json();
        const dataCourse = Array.isArray(jsonCourse) ? jsonCourse : jsonCourse.data || [];
        setMatakuliahList(dataCourse);

        // Set default values
        if (dataSemester.length > 0) {
          setSelectedSemesterId(String(dataSemester[0].id));
          setSelectedYear(dataSemester[0].tahun);
        }
        if (dataCourse.length > 0) {
          setSelectedCourseId(String(dataCourse[0].id));
        }
      } catch (err) {
        console.error("Gagal load data awal", err);
      }
    };
    fetchInitialData();
  }, []);

  // Helper: Ambil Tahun Unik
  const uniqueYears = useMemo(() => {
    return Array.from(new Set(semesterList.map(s => s.tahun)));
  }, [semesterList]);

  // 2. Action: Load Data Grafik (POST ke Backend)
  const loadReport = async () => {
    if (!selectedCourseId) {
      alert("Pilih matakuliah terlebih dahulu");
      return;
    }

    setLoading(true);
    setHasSearched(true);

    // Logic ID Semester berdasarkan Filter
    let semesterIds: number[] = [];
    if (filterType === "SEMUA") {
      semesterIds = semesterList.map(s => Number(s.id));
    } else if (filterType === "TAHUN") {
      semesterIds = semesterList
        .filter(s => s.tahun === selectedYear)
        .map(s => Number(s.id));
    } else {
      semesterIds = [Number(selectedSemesterId)];
    }

    try {
      const res = await fetch("/api/laporan/cpl-matakuliah", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: Number(selectedCourseId),
          semester_ids: semesterIds,
        }),
      });

      const json = await res.json();

      // Simpan data dari backend
      setRadarData(json.radarData || []);
      setClassDetails(json.classData || []);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat data grafik");
    } finally {
      setLoading(false);
    }
  };

  return {
    // Data
    semesterList,
    matakuliahList,
    uniqueYears,
    radarData,
    classDetails,

    // UI State
    loading,
    hasSearched,

    // Filter State
    filterType,
    setFilterType,
    selectedYear,
    setSelectedYear,
    selectedSemesterId,
    setSelectedSemesterId,
    selectedCourseId,
    setSelectedCourseId,

    // Actions
    loadReport,
  };
};
