"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
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
  LogOut,
  FileText,
  CalendarDays,
} from "lucide-react";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { NotificationBell } from "@/components/admin/NotificationBell";

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
  {
    href: "/admin/reportes",
    label: "Reportes",
    icon: FileText,
  },
  {
    href: "/admin/calendario",
    label: "Calendario",
    icon: CalendarDays,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
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
            <div className="flex items-center justify-between">
              <div>
                <p className="font-playfair text-lg font-bold text-primary-700">
                  Panel Admin
                </p>
                <p className="text-xs text-gray-400">Bordados Rocio</p>
              </div>
              <div className="relative hidden lg:block">
                <NotificationBell />
              </div>
            </div>
          </div>

          {/* User info */}
          {session?.user && (
            <div className="border-b border-gray-100 bg-gradient-to-r from-primary-50/50 to-secondary-50/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-sm font-semibold text-white">
                  {session.user.name?.charAt(0) || "A"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {session.user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

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

          <div className="border-t border-gray-100 p-4 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <Home className="h-5 w-5 text-gray-400" />
              <span>Ver sitio web</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="sticky top-16 z-30 border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
              <span>Menú Admin</span>
            </button>
            <div className="relative">
              <NotificationBell />
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <AdminNotifications />
          {children}
        </div>
      </div>
    </div>
  );
}
