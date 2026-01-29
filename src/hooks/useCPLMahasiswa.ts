// src/hooks/useCPLMahasiswa.ts
import { useState, useEffect, useMemo } from 'react';

// --- Types ---
export interface Student {
  nim: string;
  nama: string;
}

export interface StudentCPL {
  code: string;
  cplLo: string;
  nilai: number;
  description: string;
  descriptionEn: string;
}

export interface TahunAjaran {
  id: number;
  tahun: string;
  semester: string;
}

export type FilterType = "SEMUA" | "TAHUN" | "SEMESTER";

export const useCPLMahasiswa = () => {
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);

  const [filterType, setFilterType] = useState<FilterType>("SEMESTER");
  const [selectedYear, setSelectedYear] = useState<string>(""); 
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(""); 

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchNim, setSearchNim] = useState('');
  const [searchName, setSearchName] = useState('');

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentCPLData, setStudentCPLData] = useState<StudentCPL[]>([]);
  const [loadingCPL, setLoadingCPL] = useState(false);
  const [activeTab, setActiveTab] = useState<'radar' | 'bar'>('radar');

  useEffect(() => {
    const fetchSemester = async () => {
      try {
        const res = await fetch("/api/tahunAjaran");
        const json = await res.json();
        const data = Array.isArray(json) ? json : json.data || [];
        
        setSemesterList(data);

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

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(semesterList.map(s => s.tahun)));
  }, [semesterList]);

  const getActiveSemesterIds = () => {
    if (filterType === "SEMUA") return semesterList.map(s => Number(s.id));
    if (filterType === "TAHUN") return semesterList.filter(s => s.tahun === selectedYear).map(s => Number(s.id));
    return [Number(selectedSemesterId)];
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const semesterIds = getActiveSemesterIds();
      
      const res = await fetch("/api/laporan/cpl-mahasiswa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ semester_ids: semesterIds }) 
      });
      
      const json = await res.json();
    
      setStudents(json.pesertaList || []); 
    } catch (err) {
      console.error(err);
      alert("Gagal memuat data mahasiswa");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.nim.toLowerCase().includes(searchNim.toLowerCase()) &&
      s.nama.toLowerCase().includes(searchName.toLowerCase())
    );
  }, [students, searchNim, searchName]);

  const handleOpenCPL = async (student: Student) => {
    setSelectedStudent(student);
    setLoadingCPL(true);
    try {
        const semesterIds = getActiveSemesterIds();

        const res = await fetch("/api/laporan/cpl-mahasiswa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                semester_ids: semesterIds,
                nim: student.nim 
            })
        });
        
        const json = await res.json();

        setStudentCPLData(json.cplData || []);
    } catch (e) {
        console.error(e);
        alert("Gagal hitung CPL");
    } finally {
        setLoadingCPL(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setStudentCPLData([]);
    setActiveTab('radar');
  };

  return {

    semesterList,
    uniqueYears,
    filteredStudents,
    selectedStudent,
    studentCPLData,

    loading,
    loadingCPL,
    activeTab,
    setActiveTab,

    filterType, setFilterType,
    selectedYear, setSelectedYear,
    selectedSemesterId, setSelectedSemesterId,
    searchNim, setSearchNim,
    searchName, setSearchName,

    loadStudents,
    handleOpenCPL,
    handleCloseModal
  };
};