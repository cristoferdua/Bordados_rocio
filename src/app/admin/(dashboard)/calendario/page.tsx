"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Clock,
  Eye,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────

interface CalendarEvent {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  status: string;
  totalPrice: number | null;
  products: string[];
  productCount: number;
}

interface MonthSummary {
  total: number;
  activos: number;
  completados: number;
  cotizaciones: number;
  ingresos: number;
}

interface CalendarData {
  events: CalendarEvent[];
  summary: MonthSummary;
  month: number;
  year: number;
}

// ─── Helpers ─────────────────────────────────────────

const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const statusColors: Record<string, string> = {
  cotizacion: "bg-amber-400",
  pendiente: "bg-blue-400",
  activo: "bg-green-400",
  completado: "bg-gray-400",
  cancelado: "bg-red-400",
};

const statusLabels: Record<string, string> = {
  cotizacion: "Cotización",
  pendiente: "Pendiente",
  activo: "Activo",
  completado: "Completado",
  cancelado: "Cancelado",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency", currency: "MXN", minimumFractionDigits: 0,
  }).format(value);
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

// ─── Component ───────────────────────────────────────

export default function CalendarioPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/calendario?year=${year}&month=${month}`);
      if (res.ok) setData(await res.json());
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const goPrev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelectedDay(null);
  };

  const goNext = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelectedDay(null);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
    setSelectedDay(today.getDate());
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const summary = data?.summary;

  // Group events by day
  const eventsByDay: Record<number, CalendarEvent[]> = {};
  data?.events.forEach((ev) => {
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (
        d.getFullYear() === year &&
        d.getMonth() === month - 1
      ) {
        const day = d.getDate();
        if (!eventsByDay[day]) eventsByDay[day] = [];
        eventsByDay[day].push(ev);
      }
    }
  });

  const selectedEvents = selectedDay ? eventsByDay[selectedDay] || [] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-gray-900">
            Calendario
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Visualiza los alquileres por fecha
          </p>
        </div>
        <button
          onClick={goToday}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
        >
          <CalendarDays className="h-4 w-4" />
          Hoy
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-5">
          <SummaryCard label="Total" value={summary.total} icon={CalendarDays} color="bg-gray-50 text-gray-600" />
          <SummaryCard label="Activos" value={summary.activos} icon={CheckCircle2} color="bg-green-50 text-green-600" />
          <SummaryCard label="Completados" value={summary.completados} icon={CheckCircle2} color="bg-blue-50 text-blue-600" />
          <SummaryCard label="Cotizaciones" value={summary.cotizaciones} icon={Clock} color="bg-amber-50 text-amber-600" />
          <SummaryCard label="Ingresos" value={formatCurrency(summary.ingresos)} icon={DollarSign} color="bg-emerald-50 text-emerald-600" />
        </div>
      )}

      {/* Calendar Grid + Events Panel */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Calendar */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          {/* Month Nav */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <button
              onClick={goPrev}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-playfair text-lg font-bold text-gray-900">
              {monthNames[month - 1]} {year}
            </h2>
            <button
              onClick={goNext}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Day Names */}
          <div className="grid grid-cols-7 border-b border-gray-50">
            {dayNames.map((d) => (
              <div
                key={d}
                className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-gray-400"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-500" />
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {/* Empty cells before first day */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[90px] sm:min-h-[100px] border-b border-r border-gray-50 bg-gray-50/30" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const events = eventsByDay[day] || [];
                const isToday =
                  today.getDate() === day &&
                  today.getMonth() === month - 1 &&
                  today.getFullYear() === year;
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[90px] sm:min-h-[100px] border-b border-r border-gray-50 p-1.5 text-left transition-colors hover:bg-primary-50/50 ${
                      isSelected
                        ? "bg-primary-50 ring-2 ring-inset ring-primary-200"
                        : ""
                    }`}
                  >
                    {/* Day number */}
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                        isToday
                          ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white"
                          : isSelected
                            ? "bg-primary-100 text-primary-700"
                            : "text-gray-600"
                      }`}
                    >
                      {day}
                    </span>

                    {/* Event dots */}
                    {events.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {events.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            className="flex items-center gap-1"
                          >
                            <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusColors[ev.status] || "bg-gray-300"}`} />
                            <span className="truncate text-[10px] font-medium text-gray-600">
                              {ev.title}
                            </span>
                          </div>
                        ))}
                        {events.length > 3 && (
                          <p className="text-[9px] font-medium text-gray-400 pl-2.5">
                            +{events.length - 3} más
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Day Detail Panel */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100">
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {selectedDay
                ? `${selectedDay} de ${monthNames[month - 1]}`
                : "Selecciona un día"}
            </h3>
            <p className="text-xs text-gray-400">
              {selectedEvents.length} alquiler{selectedEvents.length !== 1 ? "es" : ""}
            </p>
          </div>

          <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {!selectedDay ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <Eye className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Selecciona un día</p>
                <p className="text-xs">Para ver los alquileres</p>
              </div>
            ) : selectedEvents.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <CalendarDays className="h-8 w-8 mb-2" />
                <p className="text-sm font-medium">Sin alquileres</p>
                <p className="text-xs">No hay eventos este día</p>
              </div>
            ) : (
              selectedEvents.map((ev) => {
                const start = new Date(ev.startDate);
                const end = new Date(ev.endDate);
                const isMultiDay =
                  start.toDateString() !== end.toDateString();

                return (
                  <Link
                    key={ev.id}
                    href={`/admin/alquileres/${ev.id}`}
                    className="block rounded-xl border border-gray-100 p-4 transition-all hover:border-primary-100 hover:shadow-sm hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {ev.title}
                      </p>
                      <span
                        className={`shrink-0 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          ev.status === "activo"
                            ? "bg-green-100 text-green-700"
                            : ev.status === "completado"
                              ? "bg-gray-100 text-gray-700"
                              : ev.status === "cotizacion"
                                ? "bg-amber-100 text-amber-700"
                                : ev.status === "pendiente"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-red-100 text-red-700"
                        }`}
                      >
                        {statusLabels[ev.status] || ev.status}
                      </span>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {start.toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                        {isMultiDay &&
                          ` - ${end.toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                          })}`}
                      </span>
                    </div>

                    {/* Products */}
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
                      <span>{ev.productCount} producto{ev.productCount !== 1 ? "s" : ""}</span>
                      {ev.products.length > 0 && (
                        <span className="truncate">
                          · {ev.products.slice(0, 2).join(", ")}
                          {ev.products.length > 2 && "..."}
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    {ev.totalPrice && (
                      <p className="mt-2 text-xs font-bold text-emerald-600">
                        {formatCurrency(ev.totalPrice)}
                      </p>
                    )}
                  </Link>
                );
              })
            )}
          </div>

          {selectedEvents.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-3">
              <Link
                href={`/admin/alquileres`}
                className="flex items-center justify-center gap-1 text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
              >
                Ver todos los alquileres
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SummaryCard ─────────────────────────────────────

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 sm:p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`rounded-lg p-1.5 sm:p-2 ${color}`}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{value}</p>
          <p className="text-[10px] sm:text-[11px] text-gray-500 truncate">{label}</p>
        </div>
      </div>
    </div>
  );
}
