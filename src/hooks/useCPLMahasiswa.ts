import { useState, useEffect, useMemo } from 'react';

export interface TahunAjaran { id: number; tahun: string; semester: string; }
export interface Mahasiswa { id: number; nim: string; nama: string; prodi?: string; }
export interface StudentCPL { code: string; description: string; nilai: number; }
export type FilterType = "SEMUA" | "TAHUN" | "SEMESTER";

export const useCPLMahasiswa = () => {
  const [semesterList, setSemesterList] = useState<TahunAjaran[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);

  const [filterType, setFilterType] = useState<FilterType>("SEMESTER");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [searchNim, setSearchNim] = useState("");
  const [searchName, setSearchName] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingCPL, setLoadingCPL] = useState(false);
  const [activeTab, setActiveTab] = useState<"radar" | "bar">("radar");

  const [selectedStudent, setSelectedStudent] = useState<Mahasiswa | null>(null);
  const [studentCPLData, setStudentCPLData] = useState<StudentCPL[]>([]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const resSem = await fetch("/api/tahunAjaran");
        const jsonSem = await resSem.json();
        const dataSem = Array.isArray(jsonSem) ? jsonSem : jsonSem.data || [];
        setSemesterList(dataSem);
        if (dataSem.length > 0) {
            setSelectedSemesterId(String(dataSem[0].id));
            setSelectedYear(dataSem[0].tahun);
        }
      } catch (err) {
        console.error("Gagal load master data", err);
      }
    };
    fetchMasterData();
  }, []);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(semesterList.map(s => s.tahun)));
  }, [semesterList]);

  const loadStudents = async () => {
    setLoading(true);
    try {
        const resMhs = await fetch("/api/mahasiswa?limit=1000"); 
        const jsonMhs = await resMhs.json();
        const dataMhs = Array.isArray(jsonMhs) ? jsonMhs : jsonMhs.data || [];
        setMahasiswaList(dataMhs);
    } catch (error) {
        console.error(error);
        alert("Gagal memuat data mahasiswa");
    } finally {
        setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
    return mahasiswaList.filter(m => {
        const matchNim = m.nim.toLowerCase().includes(searchNim.toLowerCase());
        const matchName = m.nama.toLowerCase().includes(searchName.toLowerCase());
        return matchNim && matchName;
    });
  }, [mahasiswaList, searchNim, searchName]);

  const handleOpenCPL = async (student: Mahasiswa) => {
    setSelectedStudent(student);
    setLoadingCPL(true);

    let ids: number[] = [];
    if (filterType === "SEMUA") {
        ids = semesterList.map(s => Number(s.id));
    } else if (filterType === "TAHUN") {
        ids = semesterList.filter(s => s.tahun === selectedYear).map(s => Number(s.id));
    } else {
        ids = [Number(selectedSemesterId)];
    }

    try {
        const res = await fetch("/api/laporan/cpl-mahasiswa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                mahasiswa_id: student.id,
                semester_ids: ids
            })
        });

        const json = await res.json();

        if (json.radarData && Array.isArray(json.radarData)) {
            const formatted: StudentCPL[] = json.radarData.map((item: any) => ({
                code: item.subject,
                description: item.full_name || "Deskripsi CPL",
                nilai: item.score || 0
            }));
            setStudentCPLData(formatted);
        } else {
            setStudentCPLData([]);
        }
    } catch (error) {
        console.error(error);
        alert("Gagal mengambil detail CPL Mahasiswa");
    } finally {
        setLoadingCPL(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setStudentCPLData([]);
  };

  return {
    semesterList, uniqueYears,
    filteredStudents, selectedStudent, studentCPLData,
    loading, loadingCPL,
    activeTab, setActiveTab,
    filterType, setFilterType,
    selectedYear, setSelectedYear,
    selectedSemesterId, setSelectedSemesterId,
    searchNim, setSearchNim,
    searchName, setSearchName,
    loadStudents, handleOpenCPL, handleCloseModal
  };
};