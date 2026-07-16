"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Shirt,
  Tags,
  CalendarCheck,
  Users,
  Menu,
  X,
  ChevronRight,
  Home,
} from "lucide-react";

const sidebarLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/productos",
    label: "Productos",
    icon: Shirt,
  },
  {
    href: "/admin/categorias",
    label: "Categorías",
    icon: Tags,
  },
  {
    href: "/admin/alquileres",
    label: "Alquileres",
    icon: CalendarCheck,
  },
  {
    href: "/admin/clientes",
    label: "Clientes",
    icon: Users,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 mt-16 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out lg:relative lg:mt-0 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-gray-100 p-6">
            <p className="font-playfair text-lg font-bold text-primary-700">
              Panel Admin
            </p>
            <p className="text-xs text-gray-400">Bordados Rocio</p>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  <link.icon
                    className={`h-5 w-5 ${
                      isActive ? "text-primary-500" : "text-gray-400"
                    }`}
                  />
                  <span>{link.label}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 text-primary-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-100 p-4">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Home className="h-5 w-5 text-gray-400" />
              <span>Ver sitio web</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Mobile header */}
        <div className="sticky top-16 z-30 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Menu className="h-5 w-5" />
            <span>Menú Admin</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
