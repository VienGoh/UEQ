"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Role = "ADMIN" | "PENELITI";

type NavItem = {
  href: string;
  label: string;
  roles?: Role[];
};

export default function Nav({ role = "ADMIN" }: { role?: Role }) {
  const pathname = usePathname();

  // ✅ Disesuaikan dengan Wireframe BAB III (Toko Karts Omnichannel)
  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/orders", label: "Pesanan Masuk" },
    { href: "/products", label: "Produk & Stok" },
    { href: "/sync", label: "Sinkronisasi & Log" },
    { href: "/settings", label: "Pengaturan API" },
    
    // Contoh: jika ada halaman khusus riset/laporan lanjutan
    // { href: "/reports", label: "Laporan Penjualan", roles: ["ADMIN"] },
  ];

  // 🔐 Filter berdasarkan role (LOGIKA TIDAK DIUBAH)
  const items = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="rounded-xl border bg-white px-2 py-2 shadow-sm">
      <ul className="flex flex-wrap gap-1">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={[
                "inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition",
                isActive(item.href)
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100",
              ].join(" ")}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}