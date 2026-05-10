// src/app/(protected)/responden/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import RespondenModal from "../../../components/modals/responden-modal";

interface Platform {
  id: number;
  name: string;
}

interface Responden {
  id: number;
  nama: string;
  umur: number;
  jenisKelamin: string;
  platformId: number;
  platform: Platform;
  taskResults: any[];
  createdAt: string;
}

export default function RespondenPage() {
  const [allResponden, setAllResponden] = useState<Responden[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResponden, setEditingResponden] = useState<Responden | null>(null);

  const [filters, setFilters] = useState({
    platformId: "",
    search: ""
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  // Ambil semua data responden (sekali saja)
  const fetchData = async () => {
    try {
      setLoading(true);

      // Ambil daftar platform
      const platformsRes = await fetch("/api/platform");
      const platformsData = await platformsRes.json();
      if (platformsData.success) {
        setPlatforms(platformsData.data);
      }

      // Ambil semua responden (limit besar untuk memastikan semua data terambil)
      const respondenRes = await fetch("/api/responden?limit=1000");
      const respondenData = await respondenRes.json();

      if (respondenData.success) {
        setAllResponden(respondenData.data);
      } else {
        setError(respondenData.error);
      }
    } catch (err) {
      setError("Gagal memuat data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter data berdasarkan platformId dan search (client-side)
  const filteredResponden = useMemo(() => {
    let filtered = allResponden;

    if (filters.platformId) {
      filtered = filtered.filter(r => r.platformId === parseInt(filters.platformId));
    }

    if (filters.search.trim() !== "") {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => r.nama.toLowerCase().includes(searchLower));
    }

    return filtered;
  }, [allResponden, filters.platformId, filters.search]);

  // Perbarui pagination setiap kali data filter berubah
  useEffect(() => {
    const total = filteredResponden.length;
    const pages = Math.ceil(total / pagination.limit);
    setPagination(prev => ({
      ...prev,
      total,
      pages,
      page: prev.page > pages && pages > 0 ? pages : prev.page
    }));
  }, [filteredResponden, pagination.limit]);

  // Data untuk halaman saat ini
  const currentResponden = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    const end = start + pagination.limit;
    return filteredResponden.slice(start, end);
  }, [filteredResponden, pagination.page, pagination.limit]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    // filter sudah otomatis karena state filters berubah
  };

  const handleReset = () => {
    setFilters({ platformId: "", search: "" });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSave = async (data: any) => {
    try {
      const url = editingResponden
        ? `/api/responden/${editingResponden.id}`
        : "/api/responden";
      const method = editingResponden ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success) {
        // Refresh data
        fetchData();
        setIsModalOpen(false);
        setEditingResponden(null);
      } else {
        alert(result.error || "Gagal menyimpan data");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan data");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus responden ini?")) return;
    try {
      const res = await fetch(`/api/responden/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (result.success) {
        fetchData();
      } else {
        alert(result.error || "Gagal menghapus data");
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus data");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Data Responden</h1>
        <p className="text-gray-600 mt-2">
          Kelola data responden penelitian Usability Testing
        </p>
      </div>

      {/* Stats Card - menggunakan filteredResponden */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Total Responden</p>
          <p className="text-2xl font-bold text-gray-800">{filteredResponden.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Shopee</p>
          <p className="text-2xl font-bold text-gray-800">
            {filteredResponden.filter(r => r.platform.name === "Shopee").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">TikTok Shop</p>
          <p className="text-2xl font-bold text-gray-800">
            {filteredResponden.filter(r => r.platform.name === "TikTok Shop").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          <p className="text-sm text-gray-500">Rata-rata Umur</p>
          <p className="text-2xl font-bold text-gray-800">
            {filteredResponden.length > 0
              ? Math.round(filteredResponden.reduce((sum, r) => sum + r.umur, 0) / filteredResponden.length)
              : 0} tahun
          </p>
        </div>
      </div>

      {/* Filter dan Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="flex gap-3">
              <select
                value={filters.platformId}
                onChange={(e) => setFilters({...filters, platformId: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Platform</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id.toString()}>
                    {platform.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                placeholder="Cari nama responden..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Cari
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </form>

          <button
            onClick={() => {
              setEditingResponden(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 whitespace-nowrap"
          >
            + Tambah Responden
          </button>
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            <p>{error}</p>
          </div>
        ) : currentResponden.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>Tidak ada data responden</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Umur & Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentResponden.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{r.nama}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{r.umur} tahun</div>
                        <div className="text-sm text-gray-500">{r.jenisKelamin}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          r.platform.name === "Shopee" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {r.platform.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>{r.taskResults.filter(t => t.success).length} / {r.taskResults.length}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{
                              width: r.taskResults.length > 0
                                ? (r.taskResults.filter(t => t.success).length / r.taskResults.length) * 100 + "%"
                                : "0%"
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button onClick={() => { setEditingResponden(r); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-900">Edit</button>
                          <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                          <Link href={`/responden/${r.id}`} className="text-green-600 hover:text-green-900">Detail</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} data
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPagination({...pagination, page: i + 1})}
                        className={`px-3 py-1 border rounded ${
                          pagination.page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "border-gray-300"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                      disabled={pagination.page === pagination.pages}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <RespondenModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingResponden(null); }}
        onSave={handleSave}
        platforms={platforms}
        initialData={editingResponden}
      />
    </div>
  );
}