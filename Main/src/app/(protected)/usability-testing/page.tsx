// app/usability-testing/page.tsx
"use client";

import { useState, useEffect } from "react";
import TaskSuccessChart from "@/components/charts/task-success-chart";
import TimeDistributionChart from "@/components/charts/time-distribution-chart";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ... (interfaces yang sama seperti sebelumnya, tambahkan untuk SUS dan UEQ)
interface PlatformData {
  platform: string;
  totalResponden: number;
  totalTasks: number;
  successTasks: number;
  successRate: number;
  avgTime: number;
  avgErrors: number;
  color: string;
}

interface TaskPerformance {
  taskId: number;
  taskName: string;
  description: string;
  totalAttempts: number;
  successRate: number;
  avgTime: number;
  avgErrors: number;
  platformBreakdown: Array<{
    platform: string;
    total: number;
    successRate: number;
    color: string;
  }>;
}

interface TimeDistribution {
  task: string;
  "Sangat Cepat (< 30s)": number;
  "Cepat (30-60s)": number;
  "Sedang (60-120s)": number;
  "Lambat (120-180s)": number;
  "Sangat Lambat (> 180s)": number;
}

interface ErrorAnalysis {
  task: string;
  "0 Error": number;
  "1-2 Error": number;
  "3-5 Error": number;
  ">5 Error": number;
}

interface Platform {
  id: number;
  name: string;
}

interface SUSData {
  averageScore: number;
  totalRespondents: number;
  distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

interface UEQData {
  categories: Array<{ category: string; average: number }>;
  overallAverage: number;
}

export default function UsabilityTestingPage() {
  // ... state yang sudah ada
  const [platformData, setPlatformData] = useState<PlatformData[]>([]);
  const [taskPerformance, setTaskPerformance] = useState<TaskPerformance[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>([]);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalTasks: 0,
    totalSuccess: 0,
    overallSuccessRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  // State untuk SUS
  const [susData, setSusData] = useState<SUSData | null>(null);
  const [susLoading, setSusLoading] = useState(true);
  const [susError, setSusError] = useState("");

  // State untuk UEQ
  const [ueqData, setUeqData] = useState<UEQData | null>(null);
  const [ueqLoading, setUeqLoading] = useState(true);
  const [ueqError, setUeqError] = useState("");

  // Fetch platforms
  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await fetch("/api/platform");
        const result = await res.json();
        if (result.success) setPlatforms(result.data);
      } catch (err) {
        console.error("Error fetching platforms:", err);
      }
    };
    fetchPlatforms();
  }, []);

  // Fetch data usability testing
  const fetchUsabilityData = async (platformFilter: string = selectedPlatform) => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (platformFilter !== "all") params.append("platformId", platformFilter);
      const url = params.toString() ? `/api/usability-testing/stats?${params.toString()}` : "/api/usability-testing/stats";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();
      if (result.success) {
        setPlatformData(result.data.platformData || []);
        setTaskPerformance(result.data.taskPerformance || []);
        setTimeDistribution(result.data.timeDistribution || []);
        setErrorAnalysis(result.data.errorAnalysis || []);
        setOverallStats({
          totalTasks: result.data.totalTasks || 0,
          totalSuccess: result.data.totalSuccess || 0,
          overallSuccessRate: result.data.overallSuccessRate || 0
        });
      } else {
        setError(result.error || "Gagal memuat data");
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Gagal memuat data usability testing");
    } finally {
      setLoading(false);
    }
  };

  // Fetch SUS data
  const fetchSusData = async () => {
    try {
      setSusLoading(true);
      setSusError("");
      const params = new URLSearchParams();
      if (selectedPlatform !== "all") params.append("platformId", selectedPlatform);
      const url = params.toString() ? `/api/sus/stats?${params.toString()}` : "/api/sus/stats";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();
      if (result.success) {
        setSusData(result.data);
      } else {
        setSusError(result.error || "Gagal memuat data SUS");
      }
    } catch (err: any) {
      console.error("Error fetching SUS data:", err);
      setSusError(err.message || "Gagal memuat data SUS");
    } finally {
      setSusLoading(false);
    }
  };

  // Fetch UEQ data
  const fetchUeqData = async () => {
    try {
      setUeqLoading(true);
      setUeqError("");
      const params = new URLSearchParams();
      if (selectedPlatform !== "all") params.append("platformId", selectedPlatform);
      const url = params.toString() ? `/api/ueq/stats?${params.toString()}` : "/api/ueq/stats";
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const result = await res.json();
      if (result.success) {
        setUeqData(result.data);
      } else {
        setUeqError(result.error || "Gagal memuat data UEQ");
      }
    } catch (err: any) {
      console.error("Error fetching UEQ data:", err);
      setUeqError(err.message || "Gagal memuat data UEQ");
    } finally {
      setUeqLoading(false);
    }
  };

  // Trigger semua fetch saat filter berubah
  useEffect(() => {
    fetchUsabilityData();
    fetchSusData();
    fetchUeqData();
  }, [selectedPlatform]);

  // Fungsi export Excel (perbarui dengan SUS dan UEQ)
  const handleExport = async () => {
    try {
      setExportLoading(true);
      const exportData = {
        metadata: {
          title: "Laporan Usability Testing",
          generatedAt: new Date().toISOString(),
          filter: selectedPlatform === "all" ? "Semua Platform" : 
                  platforms.find(p => p.id.toString() === selectedPlatform)?.name || selectedPlatform
        },
        summary: {
          ...overallStats,
          totalPlatforms: platformData.length,
          totalTasksAnalyzed: taskPerformance.reduce((sum, t) => sum + t.totalAttempts, 0),
          susScore: susData?.averageScore || 0,
          ueqOverall: ueqData?.overallAverage || 0,
        },
        platformComparison: platformData,
        taskPerformance: taskPerformance.map(t => ({
          task: t.taskName,
          description: t.description,
          totalAttempts: t.totalAttempts,
          successRate: t.successRate,
          avgTimeSeconds: t.avgTime,
          avgErrors: t.avgErrors,
          platformBreakdown: t.platformBreakdown
        })),
        timeDistribution: timeDistribution,
        errorAnalysis: errorAnalysis,
        susAnalysis: susData,
        ueqAnalysis: ueqData,
        insights: generateInsights()
      };

      const workbook = XLSX.utils.book_new();

      // Sheet Summary
      const summarySheet = XLSX.utils.json_to_sheet([
        { "Judul Laporan": exportData.metadata.title, "Waktu Generate": new Date(exportData.metadata.generatedAt).toLocaleString("id-ID"), "Filter": exportData.metadata.filter },
        {},
        { "Metrik": "Total Tugas", "Nilai": exportData.summary.totalTasks },
        { "Metrik": "Tugas Berhasil", "Nilai": exportData.summary.totalSuccess },
        { "Metrik": "Success Rate", "Nilai": `${exportData.summary.overallSuccessRate.toFixed(2)}%` },
        { "Metrik": "Platform Dianalisis", "Nilai": exportData.summary.totalPlatforms },
        { "Metrik": "Total Attempts", "Nilai": exportData.summary.totalTasksAnalyzed },
        { "Metrik": "Rata-rata SUS", "Nilai": exportData.summary.susScore },
        { "Metrik": "Rata-rata UEQ (keseluruhan)", "Nilai": exportData.summary.ueqOverall },
      ]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan");

      // Platform Comparison
      const platformSheet = XLSX.utils.json_to_sheet(platformData.map(p => ({
        Platform: p.platform,
        "Total Responden": p.totalResponden,
        "Total Tugas": p.totalTasks,
        "Tugas Berhasil": p.successTasks,
        "Success Rate (%)": p.successRate,
        "Rata-rata Waktu (detik)": p.avgTime,
        "Rata-rata Error": p.avgErrors
      })));
      XLSX.utils.book_append_sheet(workbook, platformSheet, "Perbandingan Platform");

      // Task Performance
      const taskSheet = XLSX.utils.json_to_sheet(taskPerformance.map(t => ({
        Task: t.taskName,
        Deskripsi: t.description,
        "Total Attempts": t.totalAttempts,
        "Success Rate (%)": t.successRate,
        "Rata-rata Waktu (detik)": t.avgTime,
        "Rata-rata Error": t.avgErrors
      })));
      XLSX.utils.book_append_sheet(workbook, taskSheet, "Performa Task");

      // Time Distribution
      const timeSheet = XLSX.utils.json_to_sheet(timeDistribution);
      XLSX.utils.book_append_sheet(workbook, timeSheet, "Distribusi Waktu");

      // Error Analysis
      const errorSheet = XLSX.utils.json_to_sheet(errorAnalysis);
      XLSX.utils.book_append_sheet(workbook, errorSheet, "Analisis Error");

      // SUS Analysis
      if (susData) {
        const susSheetData = [
          { "Metrik": "Rata-rata Skor SUS", "Nilai": susData.averageScore },
          { "Metrik": "Total Responden", "Nilai": susData.totalRespondents },
          { "Klasifikasi": "Rendah (<51)", "Jumlah Responden": susData.distribution.low },
          { "Klasifikasi": "Sedang (51-68)", "Jumlah Responden": susData.distribution.medium },
          { "Klasifikasi": "Tinggi (>68)", "Jumlah Responden": susData.distribution.high },
        ];
        const susSheet = XLSX.utils.json_to_sheet(susSheetData);
        XLSX.utils.book_append_sheet(workbook, susSheet, "Analisis SUS");
      }

      // UEQ Analysis
      if (ueqData) {
        const ueqSheetData = [
          { "Kategori": "Rata-rata Keseluruhan", "Skor": ueqData.overallAverage },
          ...ueqData.categories.map(c => ({ Kategori: c.category, Skor: c.average }))
        ];
        const ueqSheet = XLSX.utils.json_to_sheet(ueqSheetData);
        XLSX.utils.book_append_sheet(workbook, ueqSheet, "Analisis UEQ");
      }

      // Insights
      const insightsData = exportData.insights.map((insight: any, i: number) => ({
        No: i + 1,
        Kategori: insight.category,
        Deskripsi: insight.description,
        Rekomendasi: insight.recommendation
      }));
      const insightsSheet = XLSX.utils.json_to_sheet(insightsData);
      XLSX.utils.book_append_sheet(workbook, insightsSheet, "Insights & Rekomendasi");

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `usability_testing_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Error exporting data:", err);
      alert("Gagal mengekspor data. Silakan coba lagi.");
    } finally {
      setExportLoading(false);
    }
  };

  const generateInsights = () => {
    const insights: any[] = [];
    // ... (insights dari platform dan task seperti sebelumnya)
    if (platformData.length > 0) {
      const bestPlatform = platformData.reduce((prev, curr) => prev.successRate > curr.successRate ? prev : curr);
      const worstPlatform = platformData.reduce((prev, curr) => prev.successRate < curr.successRate ? prev : curr);
      insights.push({ category: "Platform Terbaik", description: `${bestPlatform.platform} memiliki success rate tertinggi (${bestPlatform.successRate}%)`, recommendation: "Adopsi best practice platform ini" });
      insights.push({ category: "Platform Perlu Perbaikan", description: `${worstPlatform.platform} memiliki success rate terendah (${worstPlatform.successRate}%)`, recommendation: "Fokus perbaikan UX di platform ini" });
    }
    if (taskPerformance.length > 0) {
      taskPerformance.filter(t => t.successRate < 70).slice(0, 3).forEach(task => {
        insights.push({ category: "Task Bermasalah", description: `${task.taskName} memiliki success rate rendah (${task.successRate}%)`, recommendation: "Review alur task" });
      });
      taskPerformance.filter(t => t.avgTime > 120).slice(0, 3).forEach(task => {
        insights.push({ category: "Task Lambat", description: `${task.taskName} membutuhkan waktu rata-rata ${task.avgTime} detik`, recommendation: "Sederhanakan proses" });
      });
    }
    if (susData && susData.averageScore < 51) {
      insights.push({ category: "SUS Rendah", description: `Skor SUS rata-rata ${susData.averageScore} (di bawah 51)`, recommendation: "Perbaiki aspek usability secara keseluruhan" });
    }
    if (ueqData && ueqData.overallAverage < 0) {
      insights.push({ category: "UEQ Negatif", description: `Skor UEQ keseluruhan ${ueqData.overallAverage} (negatif)`, recommendation: "Tingkatkan pengalaman pengguna pada semua aspek" });
    }
    return insights;
  };

  const successRateColors = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSUSGrade = (score: number) => {
    if (score >= 80.3) return { grade: "A", color: "text-green-600" };
    if (score >= 68) return { grade: "B", color: "text-blue-600" };
    if (score >= 51) return { grade: "C", color: "text-yellow-600" };
    if (score >= 32) return { grade: "D", color: "text-orange-600" };
    return { grade: "F", color: "text-red-600" };
  };

  if (loading) {
    return <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p className="mt-4 text-gray-600">Memuat data...</p></div></div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Usability Testing</h1>
          <p className="text-gray-600 mt-2">Analisis performa pengguna dalam menyelesaikan tugas pada platform e-commerce</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter Platform:</label>
            <select value={selectedPlatform} onChange={(e) => setSelectedPlatform(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg">
              <option value="all">Semua Platform</option>
              {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <button onClick={handleExport} disabled={exportLoading || platformData.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            {exportLoading ? <>⏳ Mengekspor...</> : <>📊 Export Laporan (Excel)</>}
          </button>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"><button onClick={() => fetchUsabilityData()} className="underline">Coba muat ulang</button></div>}

  {/* Overall Stats - Responsive & Anti Potong */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
  {/* Card 1: Success Rate */}
  <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border flex flex-col">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs md:text-sm text-gray-500 truncate">Overall Success Rate</p>
        <p className="text-2xl md:text-3xl font-bold">{overallStats.overallSuccessRate.toFixed(1)}%</p>
      </div>
    </div>
    <div className="mt-3">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${successRateColors(overallStats.overallSuccessRate)}`} style={{ width: `${Math.min(overallStats.overallSuccessRate, 100)}%` }}></div>
      </div>
      <p className="text-xs text-gray-500 mt-2 break-words">{overallStats.totalSuccess} dari {overallStats.totalTasks} tugas berhasil</p>
    </div>
  </div>

  {/* Card 2: Rata-rata Waktu */}
  <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border flex flex-col">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-green-100 flex-shrink-0">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs md:text-sm text-gray-500 truncate">Rata-rata Waktu</p>
        <p className="text-2xl md:text-3xl font-bold">{taskPerformance.length > 0 ? Math.round(taskPerformance.reduce((s,t)=>s+t.avgTime,0)/taskPerformance.length) : 0}s</p>
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-3 break-words">Rata-rata waktu penyelesaian semua tugas</p>
  </div>

  {/* Card 3: Rata-rata Error */}
  <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border flex flex-col">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-red-100 flex-shrink-0">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs md:text-sm text-gray-500 truncate">Rata-rata Error</p>
        <p className="text-2xl md:text-3xl font-bold">{taskPerformance.length > 0 ? (taskPerformance.reduce((s,t)=>s+t.avgErrors,0)/taskPerformance.length).toFixed(1) : "0.0"}</p>
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-3 break-words">Rata-rata kesalahan per tugas</p>
  </div>

  {/* Card 4: SUS */}
  <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border flex flex-col">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-purple-100 flex-shrink-0">
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs md:text-sm text-gray-500 truncate">Rata-rata SUS</p>
        <p className="text-2xl md:text-3xl font-bold">{susLoading ? "..." : (susData?.averageScore ?? 0).toFixed(1)}</p>
        <p className={`text-xs font-medium ${getSUSGrade(susData?.averageScore ?? 0).color}`}>
          {susData ? `Grade ${getSUSGrade(susData.averageScore).grade}` : ""}
        </p>
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-3 break-words">Skor System Usability Scale (0-100)</p>
  </div>

  {/* Card 5: UEQ */}
  <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border flex flex-col">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-indigo-100 flex-shrink-0">
        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs md:text-sm text-gray-500 truncate">Rata-rata UEQ</p>
        <p className="text-2xl md:text-3xl font-bold">{ueqLoading ? "..." : (ueqData?.overallAverage ?? 0).toFixed(2)}</p>
      </div>
    </div>
    <p className="text-xs text-gray-500 mt-3 break-words">Skor keseluruhan UEQ (skala -3 s.d. 3)</p>
  </div>
</div>
      {/* Platform Comparison (sama seperti sebelumnya) */}
      {platformData.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-6">Perbandingan Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformData.map(p => (
              <div key={p.platform} className="border rounded-lg p-4">
                <div className="flex justify-between mb-3"><h3 className="font-semibold">{p.platform}</h3><span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: `${p.color}20`, color: p.color }}>{p.totalResponden} responden</span></div>
                <div className="space-y-3">
                  <div><div className="flex justify-between text-sm"><span>Success Rate</span><span>{p.successRate}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${successRateColors(p.successRate)}`} style={{ width: `${p.successRate}%` }}></div></div></div>
                  <div className="grid grid-cols-2 gap-3"><div className="text-center p-2 bg-gray-50 rounded"><p className="text-xs">Avg Time</p><p className="font-semibold">{p.avgTime}s</p></div><div className="text-center p-2 bg-gray-50 rounded"><p className="text-xs">Avg Errors</p><p className="font-semibold">{p.avgErrors}</p></div></div>
                  <div className="text-sm text-gray-600">{p.successTasks} dari {p.totalTasks} tugas berhasil</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Performance Chart (sama) */}
      {taskPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">Task Performance</h2><div className="text-sm text-gray-600">{taskPerformance.length} tugas diuji</div></div>
          <TaskSuccessChart data={taskPerformance} />
        </div>
      )}

      {/* Task Details Table (sama) */}
      {taskPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-6">Detail Performa per Task</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead><tr className="bg-gray-50"><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success Rate</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Errors</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Attempts</th></tr></thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {taskPerformance.map(task => (
                  <tr key={task.taskId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{task.taskName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{task.description}</td>
                    <td className="px-6 py-4"><div className="flex items-center"><div className="w-24 bg-gray-200 rounded-full h-2 mr-3"><div className={`h-2 rounded-full ${successRateColors(task.successRate)}`} style={{ width: `${task.successRate}%` }}></div></div><span>{task.successRate}%</span></div><div className="flex gap-1 mt-1">{task.platformBreakdown.map(pb => <span key={pb.platform} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: `${pb.color}20`, color: pb.color }}>{pb.platform}: {pb.successRate}%</span>)}</div></td>
                    <td className="px-6 py-4">{task.avgTime}s</td>
                    <td className="px-6 py-4"><div className="flex items-center"><div className="w-16 bg-gray-200 rounded-full h-2 mr-3"><div className={`h-2 rounded-full ${task.avgErrors === 0 ? 'bg-green-500' : task.avgErrors <= 1 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(task.avgErrors * 20, 100)}%` }}></div></div><span>{task.avgErrors.toFixed(1)}</span></div></td>
                    <td className="px-6 py-4">{task.totalAttempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Time Distribution & Error Analysis */}
      {(timeDistribution.length > 0 || errorAnalysis.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {timeDistribution.length > 0 && <div className="bg-white p-6 rounded-xl shadow-sm border"><h2 className="text-xl font-bold mb-6">Distribusi Waktu Penyelesaian</h2><TimeDistributionChart data={timeDistribution} /></div>}
          {errorAnalysis.length > 0 && <div className="bg-white p-6 rounded-xl shadow-sm border"><h2 className="text-xl font-bold mb-6">Analisis Kesalahan</h2><div className="h-80"><ResponsiveContainer><BarChart data={errorAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="task" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} /><YAxis /><Tooltip /><Legend /><Bar dataKey="0 Error" name="0 Error" fill="#10B981" stackId="a" /><Bar dataKey="1-2 Error" name="1-2 Error" fill="#F59E0B" stackId="a" /><Bar dataKey="3-5 Error" name="3-5 Error" fill="#EF4444" stackId="a" /><Bar dataKey=">5 Error" name=">5 Error" fill="#7C3AED" stackId="a" /></BarChart></ResponsiveContainer></div></div>}
        </div>
      )}

      {/* SUS Analysis Section */}
      {!susLoading && !susError && susData && susData.totalRespondents > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-6">Analisis SUS (System Usability Scale)</h2>
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={getSUSGrade(susData.averageScore).color.replace('text-','bg-')} strokeWidth="10" strokeDasharray={`${(susData.averageScore / 100) * 283} 283`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-3xl font-bold">{susData.averageScore.toFixed(0)}</span>
                  <span className="text-sm text-gray-500 block">/ 100</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-gray-700 mb-4">Skor SUS rata-rata: <strong>{susData.averageScore.toFixed(1)}</strong> ({getSUSGrade(susData.averageScore).grade})</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-red-50 p-2 rounded"><p className="text-sm text-red-600">Rendah (&lt;51)</p><p className="text-xl font-bold">{susData.distribution.low}</p><p className="text-xs">responden</p></div>
                <div className="bg-yellow-50 p-2 rounded"><p className="text-sm text-yellow-600">Sedang (51-68)</p><p className="text-xl font-bold">{susData.distribution.medium}</p><p className="text-xs">responden</p></div>
                <div className="bg-green-50 p-2 rounded"><p className="text-sm text-green-600">Tinggi (&gt;68)</p><p className="text-xl font-bold">{susData.distribution.high}</p><p className="text-xs">responden</p></div>
              </div>
              <p className="text-sm text-gray-500 mt-4">Berdasarkan {susData.totalRespondents} responden.</p>
            </div>
          </div>
        </div>
      )}

      {/* UEQ Analysis Section */}
      {!ueqLoading && !ueqError && ueqData && ueqData.categories.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h2 className="text-xl font-bold mb-6">Analisis UEQ (User Experience Questionnaire)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ueqData.categories} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[-3, 3]} />
                <Tooltip formatter={(value: number) => `${value} (skala -3 s.d. 3)`} />
                <Bar dataKey="average" fill="#3B82F6" name="Rata-rata Skor">
                  {ueqData.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.average >= 0 ? "#3B82F6" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p>Skor berkisar dari -3 (sangat buruk) hingga +3 (sangat baik).</p>
            <p>Rata-rata keseluruhan: <strong>{ueqData.overallAverage.toFixed(2)}</strong></p>
          </div>
        </div>
      )}

      {/* Error & Loading States */}
      {susError && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"><p className="text-yellow-700">{susError}</p></div>}
      {ueqError && <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4"><p className="text-yellow-700">{ueqError}</p></div>}
      {(susLoading || ueqLoading) && <div className="text-center py-4 text-gray-500">Memuat data tambahan...</div>}

      {/* No Data */}
      {!loading && platformData.length === 0 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border text-center">
          <p>Tidak ada data. {selectedPlatform !== "all" && <button onClick={() => setSelectedPlatform("all")} className="text-blue-600 underline">Lihat semua data</button>}</p>
        </div>
      )}
    </div>
  );
}