"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";

interface TaskData {
  respondenId: number;
  respondenNama: string;
  platformName: string;
  tasks: {
    taskId: number;
    taskName: string;
    success: boolean | null;
    timeOnTask: number;
  }[];
}

export default function TaskHeatmapVisual() {
  const [data, setData] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"success" | "time">("success");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  useEffect(() => {
    fetch("/api/heatmap/task-data")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Gagal load data heatmap:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Memuat data heatmap...</div>;
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-gray-500">Belum ada data task result.</div>;
  }

  // Filter platform
  const filteredData =
    filterPlatform === "all"
      ? data
      : data.filter((d) => d.platformName === filterPlatform);

  // Ambil semua task unik (urut berdasarkan taskId)
  const allTasks = Array.from(
    new Map(
      data.flatMap((d) => d.tasks.map((t) => [t.taskId, t.taskName]))
    ).entries()
  ).sort((a, b) => a[0] - b[0]);

  const platforms = Array.from(new Set(data.map((d) => d.platformName)));

  // Fungsi warna
  const getCellColor = (value: number, metricType: "success" | "time") => {
    if (metricType === "success") {
      if (value === 100) return "#22c55e"; // hijau
      if (value === 0) return "#ef4444";   // merah
      const hue = (value / 100) * 120;
      return `hsl(${hue}, 70%, 60%)`;
    } else {
      if (value === 0) return "#e5e7eb";
      const intensity = Math.min(1, value / 120);
      return `rgb(255, ${200 - Math.floor(150 * intensity)}, ${200 - Math.floor(150 * intensity)})`;
    }
  };

  const getNumericValue = (task: TaskData["tasks"][0]) => {
    if (metric === "success") {
      return task.success === null ? 0 : task.success ? 100 : 0;
    } else {
      return task.timeOnTask || 0;
    }
  };

  const getDisplayValue = (task: TaskData["tasks"][0]) => {
    if (metric === "success") {
      return task.success === null ? "?" : task.success ? "✓" : "✗";
    } else {
      return task.timeOnTask ? Math.round(task.timeOnTask) : "-";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setMetric("success")}
            className={`px-3 py-1 text-sm rounded-md ${
              metric === "success" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Success Rate
          </button>
          <button
            onClick={() => setMetric("time")}
            className={`px-3 py-1 text-sm rounded-md ${
              metric === "time" ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Time on Task (detik)
          </button>
        </div>
        <select
          className="rounded border p-1 text-sm"
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
        >
          <option value="all">Semua Platform</option>
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header */}
          <div className="grid" style={{ gridTemplateColumns: `200px repeat(${allTasks.length}, 100px)` }}>
            <div className="font-semibold p-2 border-b bg-gray-50">Responden / Task</div>
            {allTasks.map(([id, name]) => (
              <div key={id} className="font-semibold p-2 border-b text-center text-sm bg-gray-50">
                {name}
              </div>
            ))}
          </div>

          {/* Baris data */}
          {filteredData.map((responden) => (
            <div
              key={responden.respondenId}
              className="grid hover:bg-gray-50"
              style={{ gridTemplateColumns: `200px repeat(${allTasks.length}, 100px)` }}
            >
              <div className="p-2 border-b truncate text-sm" title={responden.respondenNama}>
                {responden.respondenNama} <span className="text-xs text-gray-500">({responden.platformName})</span>
              </div>
              {allTasks.map(([taskId]) => {
                const task = responden.tasks.find((t) => t.taskId === taskId);
                if (!task)
                  return (
                    <div key={taskId} className="p-2 border-b text-center bg-gray-100 text-gray-400 text-sm">
                      N/A
                    </div>
                  );
                const numericValue = getNumericValue(task);
                const bgColor = getCellColor(numericValue, metric);
                const display = getDisplayValue(task);
                return (
                  <div
                    key={taskId}
                    className="p-2 border-b text-center text-white font-medium text-sm"
                    style={{ backgroundColor: bgColor }}
                    title={metric === "success" ? (task.success ? "Success" : "Failed") : `${task.timeOnTask?.toFixed(1)} detik`}
                  >
                    {display}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500 text-center">
        {metric === "success"
          ? "✓ = Success, ✗ = Failed, warna hijau = tinggi, merah = rendah"
          : "Warna merah gelap = waktu lama (>120 detik), angka = detik"}
      </div>
    </div>
  );
}