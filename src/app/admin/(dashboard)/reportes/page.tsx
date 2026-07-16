"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FileText,
  Package,
  CalendarCheck,
  DollarSign,
  Users,
  Calendar,
  Printer,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Types ───────────────────────────────────────────

type ReportType = "inventario" | "alquileres" | "ingresos" | "clientes";

interface ReportTab {
  id: ReportType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: ReportTab[] = [
  { id: "inventario", label: "Inventario", icon: Package },
  { id: "alquileres", label: "Alquileres", icon: CalendarCheck },
  { id: "ingresos", label: "Ingresos", icon: DollarSign },
  { id: "clientes", label: "Clientes", icon: Users },
];

// ─── Helpers ─────────────────────────────────────────

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    cotizacion: "bg-amber-100 text-amber-700",
    pendiente: "bg-blue-100 text-blue-700",
    activo: "bg-green-100 text-green-700",
    completado: "bg-gray-100 text-gray-700",
    cancelado: "bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    cotizacion: "Cotización",
    pendiente: "Pendiente",
    activo: "Activo",
    completado: "Completado",
    cancelado: "Cancelado",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        styles[status] || "bg-gray-100"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

// ─── PDF Generator ───────────────────────────────────

function generatePDF(
  type: ReportType,
  data: any[],
  summary: any,
  dateRange: string
) {
  const doc = new jsPDF("landscape", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.setTextColor(139, 92, 246);
  doc.text("Bordados Rocio", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const tabLabel = tabs.find((t) => t.id === type)?.label || type;
  doc.text(`Reporte de ${tabLabel}`, pageWidth / 2, 28, { align: "center" });

  if (dateRange) {
    doc.setFontSize(9);
    doc.text(dateRange, pageWidth / 2, 34, { align: "center" });
  }

  // Summary
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  let yOffset = 42;

  if (type === "inventario" && summary) {
    const summaryText = `Total: ${summary.totalProductos} productos | Stock total: ${summary.totalStock} | Disponibles: ${summary.disponibles} | Stock bajo: ${summary.stockBajo}`;
    doc.text(summaryText, 14, yOffset);
    yOffset += 8;
  } else if (type === "alquileres" && summary) {
    const summaryText = `Total: ${summary.total} | Cotización: ${summary.cotizacion} | Activos: ${summary.activo} | Completados: ${summary.completado} | Cancelados: ${summary.cancelado}`;
    doc.text(summaryText, 14, yOffset);
    yOffset += 8;
  } else if (type === "ingresos" && summary) {
    const summaryText = `Total ingresos: $${summary.totalIngresos.toFixed(2)} | Promedio: $${summary.promedioPorAlquiler.toFixed(2)} | Alquileres: ${summary.totalAlquileres}`;
    doc.text(summaryText, 14, yOffset);
    yOffset += 8;
  } else if (type === "clientes" && summary) {
    const summaryText = `Total: ${summary.total} clientes | Con teléfono: ${summary.conTelefono} | Con alquileres: ${summary.conAlquileres}`;
    doc.text(summaryText, 14, yOffset);
    yOffset += 8;
  }

  // Table
  const tableColumn = (() => {
    switch (type) {
      case "inventario":
        return [
          "ID",
          "Nombre",
          "Categoría",
          "Precio",
          "Depósito",
          "Stock",
          "Disponible",
          "Veces Alquilado",
        ];
      case "alquileres":
        return [
          "ID",
          "Cliente",
          "Productos",
          "Inicio",
          "Fin",
          "Estado",
          "Total",
        ];
      case "ingresos":
        return ["ID", "Cliente", "Monto", "Fecha", "Estado"];
      case "clientes":
        return [
          "ID",
          "Nombre",
          "Teléfono",
          "Email",
          "Alquileres",
          "Gasto Total",
        ];
    }
  })();

  const tableRows = data.map((item: any) => {
    switch (type) {
      case "inventario":
        return [
          item.id,
          item.nombre,
          item.categoria,
          `$${item.precioAlquiler}`,
          `$${item.deposito}`,
          item.stock,
          item.disponible ? "Sí" : "No",
          item.vecesAlquilado,
        ];
      case "alquileres":
        return [
          item.id,
          item.cliente,
          item.productos.substring(0, 40),
          formatDate(item.fechaInicio),
          formatDate(item.fechaFin),
          item.estado,
          `$${item.total.toFixed(2)}`,
        ];
      case "ingresos":
        return [
          item.id,
          item.cliente,
          `$${item.monto.toFixed(2)}`,
          formatDate(item.fecha),
          item.estado,
        ];
      case "clientes":
        return [
          item.id,
          item.nombre,
          item.telefono || "—",
          item.email || "—",
          item.totalAlquileres,
          `$${item.gastoTotal.toFixed(2)}`,
        ];
    }
  });

  autoTable(doc, {
    startY: yOffset,
    head: [tableColumn],
    body: tableRows,
    theme: "grid",
    headStyles: {
      fillColor: [139, 92, 246],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: { fontSize: 7 },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    margin: { top: 35 },
  });

  // Footer
  const jsDoc = doc as any;
  const pageCount = jsDoc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    jsDoc.setPage(i);
    jsDoc.setFontSize(7);
    jsDoc.setTextColor(180, 180, 180);
    jsDoc.text(
      `Generado el ${new Date().toLocaleDateString("es-ES")} · Página ${i} de ${pageCount}`,
      pageWidth / 2,
      jsDoc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`reporte-${type}-${new Date().toISOString().split("T")[0]}.pdf`);
}

// ─── Excel Generator ─────────────────────────────────

async function generateExcel(
  type: ReportType,
  data: any[],
  summary: any
) {
  const XLSX = await import("xlsx");

  const rows = data.map((item: any) => {
    switch (type) {
      case "inventario":
        return {
          ID: item.id,
          Nombre: item.nombre,
          Categoría: item.categoria,
          "Precio Alquiler": item.precioAlquiler,
          Depósito: item.deposito,
          Stock: item.stock,
          Disponible: item.disponible ? "Sí" : "No",
          "Veces Alquilado": item.vecesAlquilado,
        };
      case "alquileres":
        return {
          ID: item.id,
          Cliente: item.cliente,
          Productos: item.productos,
          "Fecha Inicio": formatDate(item.fechaInicio),
          "Fecha Fin": formatDate(item.fechaFin),
          "Fecha Devolución": formatDate(item.fechaDevolucion),
          Estado: item.estado,
          Total: item.total,
        };
      case "ingresos":
        return {
          ID: item.id,
          Cliente: item.cliente,
          Monto: item.monto,
          Fecha: formatDate(item.fecha),
          Estado: item.estado,
        };
      case "clientes":
        return {
          ID: item.id,
          Nombre: item.nombre,
          Teléfono: item.telefono || "—",
          Email: item.email || "—",
          "Total Alquileres": item.totalAlquileres,
          "Gasto Total": item.gastoTotal,
        };
    }
  });

  // Add summary as a second sheet
  const summaryRows =
    type === "inventario" && summary
      ? [
          { Métrica: "Total Productos", Valor: summary.totalProductos },
          { Métrica: "Stock Total", Valor: summary.totalStock },
          { Métrica: "Disponibles", Valor: summary.disponibles },
          { Métrica: "No Disponibles", Valor: summary.noDisponibles },
          { Métrica: "Stock Bajo", Valor: summary.stockBajo },
          { Métrica: "Valor Inventario", Valor: summary.valorInventario },
        ]
      : type === "alquileres" && summary
        ? [
            { Métrica: "Total", Valor: summary.total },
            { Métrica: "Cotización", Valor: summary.cotizacion },
            { Métrica: "Pendiente", Valor: summary.pendiente },
            { Métrica: "Activo", Valor: summary.activo },
            { Métrica: "Completado", Valor: summary.completado },
            { Métrica: "Cancelado", Valor: summary.cancelado },
            { Métrica: "Ingresos", Valor: summary.ingresos },
          ]
        : type === "ingresos" && summary
          ? [
              { Métrica: "Total Ingresos", Valor: summary.totalIngresos },
              { Métrica: "Total Alquileres", Valor: summary.totalAlquileres },
              { Métrica: "Promedio por Alquiler", Valor: summary.promedioPorAlquiler },
            ]
          : type === "clientes" && summary
            ? [
                { Métrica: "Total", Valor: summary.total },
                { Métrica: "Con Teléfono", Valor: summary.conTelefono },
                { Métrica: "Con Email", Valor: summary.conEmail },
                { Métrica: "Con Alquileres", Valor: summary.conAlquileres },
              ]
            : [];

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws1, "Datos");

  if (summaryRows.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, ws2, "Resumen");
  }

  XLSX.writeFile(
    wb,
    `reporte-${type}-${new Date().toISOString().split("T")[0]}.xlsx`
  );
}

// ─── Report Page Component ───────────────────────────

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState<ReportType>("inventario");
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type: activeTab });
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const res = await fetch(`/api/admin/reportes?${params}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data || []);
        setSummary(json.summary || null);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [activeTab, fromDate, toDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExportPDF = () => {
    setExporting("pdf");
    try {
      const dateRange = fromDate || toDate
        ? `${fromDate ? formatDate(fromDate) : ""} - ${toDate ? formatDate(toDate) : "hoy"}`
        : "";
      generatePDF(activeTab, data, summary, dateRange);
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting("excel");
    try {
      await generateExcel(activeTab, data, summary);
    } finally {
      setExporting(null);
    }
  };

  const currentTab = tabs.find((t) => t.id === activeTab)!;
  const TabIcon = currentTab.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-gray-900">
            Reportes
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Genera y descarga reportes detallados del negocio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            disabled={exporting !== null || loading || data.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {exporting === "pdf" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            PDF
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exporting !== null || loading || data.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {exporting === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-gray-100 p-1.5 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              }`}
            >
              <Icon
                className={`h-4 w-4 ${
                  isActive ? "text-primary-500" : "text-gray-400"
                }`}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Date filters (only for alquileres/ingresos) */}
      {(activeTab === "alquileres" || activeTab === "ingresos") && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
            />
            <span className="text-xs text-gray-400">a</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          {(fromDate || toDate) && (
            <button
              onClick={() => {
                setFromDate("");
                setToDate("");
              }}
              className="text-xs font-medium text-red-500 hover:text-red-600"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {activeTab === "inventario" && (
            <>
              <SummaryCard
                label="Total Productos"
                value={summary.totalProductos}
                icon={Package}
                color="bg-blue-50 text-blue-600"
              />
              <SummaryCard
                label="Disponibles"
                value={summary.disponibles}
                icon={Package}
                color="bg-green-50 text-green-600"
              />
              <SummaryCard
                label="Stock Bajo"
                value={summary.stockBajo}
                icon={Package}
                color={summary.stockBajo > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}
              />
              <SummaryCard
                label="Valor Inventario"
                value={formatCurrency(summary.valorInventario)}
                icon={DollarSign}
                color="bg-purple-50 text-purple-600"
              />
            </>
          )}
          {activeTab === "alquileres" && (
            <>
              <SummaryCard
                label="Total"
                value={summary.total}
                icon={CalendarCheck}
                color="bg-gray-50 text-gray-600"
              />
              <SummaryCard
                label="Activos"
                value={summary.activo}
                icon={CalendarCheck}
                color="bg-green-50 text-green-600"
              />
              <SummaryCard
                label="Completados"
                value={summary.completado}
                icon={CalendarCheck}
                color="bg-blue-50 text-blue-600"
              />
              <SummaryCard
                label="Ingresos"
                value={formatCurrency(summary.ingresos)}
                icon={DollarSign}
                color="bg-emerald-50 text-emerald-600"
              />
            </>
          )}
          {activeTab === "ingresos" && (
            <>
              <SummaryCard
                label="Total Ingresos"
                value={formatCurrency(summary.totalIngresos)}
                icon={DollarSign}
                color="bg-emerald-50 text-emerald-600"
              />
              <SummaryCard
                label="Total Alquileres"
                value={summary.totalAlquileres}
                icon={CalendarCheck}
                color="bg-blue-50 text-blue-600"
              />
              <SummaryCard
                label="Promedio por Alquiler"
                value={formatCurrency(summary.promedioPorAlquiler)}
                icon={DollarSign}
                color="bg-purple-50 text-purple-600"
              />
            </>
          )}
          {activeTab === "clientes" && (
            <>
              <SummaryCard
                label="Total Clientes"
                value={summary.total}
                icon={Users}
                color="bg-blue-50 text-blue-600"
              />
              <SummaryCard
                label="Con Teléfono"
                value={summary.conTelefono}
                icon={Users}
                color="bg-green-50 text-green-600"
              />
              <SummaryCard
                label="Con Email"
                value={summary.conEmail}
                icon={Users}
                color="bg-purple-50 text-purple-600"
              />
              <SummaryCard
                label="Con Alquileres"
                value={summary.conAlquileres}
                icon={CalendarCheck}
                color="bg-amber-50 text-amber-600"
              />
            </>
          )}
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-400" />
            <p className="mt-3 text-sm text-gray-400">
              Generando reporte...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 font-playfair text-base font-semibold text-gray-500">
              No hay datos para este reporte
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {activeTab === "alquileres" || activeTab === "ingresos"
                ? "Prueba ajustando el filtro de fechas"
                : "Los datos aparecerán cuando tengas registros"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  {activeTab === "inventario" && (
                    <>
                      <HeaderCell>Producto</HeaderCell>
                      <HeaderCell>Categoría</HeaderCell>
                      <HeaderCell>Precio</HeaderCell>
                      <HeaderCell>Stock</HeaderCell>
                      <HeaderCell>Alq.</HeaderCell>
                      <HeaderCell>Estado</HeaderCell>
                    </>
                  )}
                  {activeTab === "alquileres" && (
                    <>
                      <HeaderCell>Cliente</HeaderCell>
                      <HeaderCell>Productos</HeaderCell>
                      <HeaderCell>Inicio</HeaderCell>
                      <HeaderCell>Fin</HeaderCell>
                      <HeaderCell>Total</HeaderCell>
                      <HeaderCell>Estado</HeaderCell>
                    </>
                  )}
                  {activeTab === "ingresos" && (
                    <>
                      <HeaderCell>Cliente</HeaderCell>
                      <HeaderCell>Monto</HeaderCell>
                      <HeaderCell>Fecha</HeaderCell>
                      <HeaderCell>Estado</HeaderCell>
                    </>
                  )}
                  {activeTab === "clientes" && (
                    <>
                      <HeaderCell>Nombre</HeaderCell>
                      <HeaderCell>Contacto</HeaderCell>
                      <HeaderCell>Alquileres</HeaderCell>
                      <HeaderCell>Gasto Total</HeaderCell>
                      <HeaderCell>Registro</HeaderCell>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.slice(0, 100).map((item: any) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    {activeTab === "inventario" && (
                      <>
                        <DataCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-50 to-secondary-50 text-sm">
                              👗
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                {item.nombre}
                              </p>
                            </div>
                          </div>
                        </DataCell>
                        <DataCell>
                          <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-700">
                            {item.categoria}
                          </span>
                        </DataCell>
                        <DataCell>
                          <span className="text-sm font-medium">
                            {formatCurrency(item.precioAlquiler)}
                          </span>
                        </DataCell>
                        <DataCell>
                          <span
                            className={`text-sm font-medium ${
                              item.stock <= 3 && item.disponible
                                ? "text-red-600"
                                : "text-gray-700"
                            }`}
                          >
                            {item.stock}
                          </span>
                        </DataCell>
                        <DataCell>
                          <span className="text-sm text-gray-600">
                            {item.vecesAlquilado}
                          </span>
                        </DataCell>
                        <DataCell>
                          {item.disponible ? (
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-semibold text-green-700">
                              Disponible
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-semibold text-red-700">
                              No disponible
                            </span>
                          )}
                        </DataCell>
                      </>
                    )}
                    {activeTab === "alquileres" && (
                      <>
                        <DataCell>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.cliente}
                          </p>
                          {item.telefono && (
                            <p className="text-xs text-gray-400">
                              {item.telefono}
                            </p>
                          )}
                        </DataCell>
                        <DataCell>
                          <p className="text-sm text-gray-600 truncate max-w-[200px]">
                            {item.productos}
                          </p>
                        </DataCell>
                        <DataCell>
                          <p className="text-sm text-gray-700">
                            {formatDate(item.fechaInicio)}
                          </p>
                        </DataCell>
                        <DataCell>
                          <p className="text-sm text-gray-700">
                            {formatDate(item.fechaFin)}
                          </p>
                        </DataCell>
                        <DataCell>
                          <span className="text-sm font-semibold">
                            {formatCurrency(item.total)}
                          </span>
                        </DataCell>
                        <DataCell>{getStatusBadge(item.estado)}</DataCell>
                      </>
                    )}
                    {activeTab === "ingresos" && (
                      <>
                        <DataCell>
                          <p className="text-sm font-semibold text-gray-900">
                            {item.cliente}
                          </p>
                        </DataCell>
                        <DataCell>
                          <span className="text-sm font-bold text-emerald-600">
                            {formatCurrency(item.monto)}
                          </span>
                        </DataCell>
                        <DataCell>
                          <p className="text-sm text-gray-600">
                            {formatDate(item.fecha)}
                          </p>
                        </DataCell>
                        <DataCell>{getStatusBadge(item.estado)}</DataCell>
                      </>
                    )}
                    {activeTab === "clientes" && (
                      <>
                        <DataCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-50 to-secondary-50 text-xs font-bold text-primary-600">
                              {item.nombre.charAt(0)}
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                              {item.nombre}
                            </p>
                          </div>
                        </DataCell>
                        <DataCell>
                          <p className="text-sm text-gray-700">
                            {item.telefono || "—"}
                          </p>
                          {item.email && (
                            <p className="text-xs text-gray-400">
                              {item.email}
                            </p>
                          )}
                        </DataCell>
                        <DataCell>
                          <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-[11px] font-medium text-primary-700">
                            {item.totalAlquileres}
                          </span>
                        </DataCell>
                        <DataCell>
                          <span className="text-sm font-medium">
                            {formatCurrency(item.gastoTotal)}
                          </span>
                        </DataCell>
                        <DataCell>
                          <p className="text-sm text-gray-500">
                            {formatDate(item.createdAt)}
                          </p>
                        </DataCell>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 100 && (
              <div className="border-t border-gray-100 px-6 py-4 text-center text-sm text-gray-400">
                Mostrando 100 de {data.length} registros. Descarga el reporte
                para verlos todos.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────

function HeaderCell({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
      {children}
    </th>
  );
}

function DataCell({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3">{children}</td>;
}

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
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
          <p className="text-[11px] text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
