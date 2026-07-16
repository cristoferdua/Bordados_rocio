"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Plus,
  X,
  Save,
  Loader2,
  Trash2,
  KeyRound,
} from "lucide-react";
import { roleLabel, roleBadgeColor, isAdmin } from "@/lib/permissions";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const roleOptions = [
  { value: "admin", label: "Administrador", icon: ShieldAlert, desc: "Acceso completo al sistema" },
  { value: "editor", label: "Editor", icon: ShieldCheck, desc: "Puede crear y editar contenido" },
  { value: "viewer", label: "Visualizador", icon: Shield, desc: "Solo lectura" },
];

export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "viewer" });

  // Redirect non-admins
  useEffect(() => {
    if (status === "authenticated" && !isAdmin((session?.user as any)?.role)) {
      redirect("/admin");
    }
  }, [status, session]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/usuarios");
      if (res.ok) setUsers(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary-400" />
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ name: "", email: "", password: "", role: "viewer" });
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear usuario");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await fetch(`/api/admin/usuarios?id=${userId}`, { method: "DELETE" });
      fetchUsers();
    } catch {}
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });
      fetchUsers();
    } catch {}
  };

  const currentUserRole = (session?.user as any)?.role;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-gray-900">
            Usuarios
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los usuarios y sus roles de acceso
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
        >
          {showForm ? (
            <><X className="h-4 w-4" /> Cancelar</>
          ) : (
            <><Plus className="h-4 w-4" /> Nuevo Usuario</>
          )}
        </button>
      </div>

      {/* Roles info cards */}
      <div className="grid gap-3 sm:grid-cols-3">
        {roleOptions.map((role) => {
          const Icon = role.icon;
          const count = users.filter((u) => u.role === role.value).length;
          return (
            <div key={role.value} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${
                  role.value === "admin" ? "bg-purple-50 text-purple-600" :
                  role.value === "editor" ? "bg-blue-50 text-blue-600" :
                  "bg-gray-50 text-gray-600"
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{role.label}</p>
                  <p className="text-xs text-gray-400">{count} usuario{count !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-gray-400">{role.desc}</p>
            </div>
          );
        })}
      </div>

      {/* New user form */}
      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-playfair text-base font-semibold text-gray-900">Nuevo Usuario</h3>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-2">{error}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
                placeholder="email@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Rol</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
              >
                {roleOptions.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Crear Usuario
            </button>
          </div>
        </form>
      )}

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Shield className="mx-auto h-10 w-10 mb-3" />
            <p className="text-sm font-medium">No hay usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Usuario</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Rol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Registro</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => {
                  const isSelf = user.id === session?.user?.id;
                  return (
                    <tr key={user.id} className="transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-sm font-bold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {user.name}
                              {isSelf && (
                                <span className="ml-2 text-[10px] font-medium text-primary-500">(tú)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={isSelf}
                            className={`rounded-lg border-0 px-2.5 py-1.5 text-xs font-semibold outline-none ${roleBadgeColor(user.role)} ${
                              isSelf ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                            }`}
                          >
                            {roleOptions.map((r) => (
                              <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isSelf && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
