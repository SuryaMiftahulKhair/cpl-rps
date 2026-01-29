// src/hooks/useCPLProdi.ts
import { useState, useEffect, useMemo } from 'react';

// --- Types ---
export interface TahunAjaran {
  id: number;
  tahun: string;
  semester: string;
}

export interface RadarItem {
  subject: string;
  prodi: number;
  target: number;
}

export interface CourseItem {
  id: number;
  code: string;
  name: string;
  class_name: string;
  scores: Record<string, number>; // { "CPL-01": 80, "CPL-02": 75 }
}

export type FilterType = "SEMUA" | "TAHUN" | "SEMESTER";

export const useCPLProdi = () => {
  // --- STATE: Master Data ---
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  
  // --- STATE: Filter Controls ---
  const [filterType, setFilterType] = useState<FilterType>("SEMESTER");
  const [selectedYear, setSelectedYear] = useState<string>(""); 
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(""); 

  // --- STATE: Data Report ---
  const [radarData, setRadarData] = useState<RadarItem[]>([]);
  const [courseList, setCourseList] = useState<CourseItem[]>([]);
  
  // --- STATE: UI ---
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 1. Initial Load: Ambil Daftar Tahun Ajaran
  useEffect(() => {
    const fetchSemester = async () => {
      try {
        const res = await fetch("/api/tahunAjaran");
        const json = await res.json();
        const data = Array.isArray(json) ? json : json.data || [];
        
        setSemesterList(data);
        
        // Set default values ke semester terbaru
        if (data.length > 0) {
            setSelectedSemesterId(String(data[0].id));
            setSelectedYear(data[0].tahun);
        }
      } catch (err) {
        console.error("Gagal load tahun ajaran", err);
      }
    };
    fetchSemester();
  }, []);

  // Helper: Ambil Tahun Unik
  const uniqueYears = useMemo(() => {
    return Array.from(new Set(semesterList.map(s => s.tahun)));
  }, [semesterList]);

  // 2. Action: Load Data Grafik (POST ke Backend)
  const loadReport = async () => {
    setLoading(true);
    setHasSearched(true);
    
    // Logic ID Semester berdasarkan Filter
    let ids: number[] = [];
    if (filterType === "SEMUA") {
        ids = semesterList.map(s => Number(s.id));
    } else if (filterType === "TAHUN") {
        ids = semesterList.filter(s => s.tahun === selectedYear).map(s => Number(s.id));
    } else {
        ids = [Number(selectedSemesterId)];
    }

    try {
        const res = await fetch("/api/laporan/cpl-prodi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ semester_ids: ids })
        });
        
        const json = await res.json();
        
        // Simpan data dari backend
        setRadarData(json.radarData || []);
        setCourseList(json.courseData || []);
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
    uniqueYears,
    radarData,
    courseList,

    // UI State
    loading,
    hasSearched,

    // Filter State
    filterType, setFilterType,
    selectedYear, setSelectedYear,
    selectedSemesterId, setSelectedSemesterId,

    // Actions
    loadReport
  };
};