"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Clock,
  Info,
  X,
  ChevronDown,
  ChevronRight,
  CalendarCheck,
} from "lucide-react";

type AlertDetail = {
  id: number;
  customer: string;
  days: number;
  endDate: string;
};

type Alert = {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  details: AlertDetail[];
  count: number;
};

type NotificationData = {
  alerts: Alert[];
  totalAlerts: number;
  badgeCount: number;
  activeRentals: number;
};

const alertStyles = {
  error: {
    bg: "bg-red-50 border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    textColor: "text-red-800",
    textMuted: "text-red-600",
    badgeBg: "bg-red-500",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    textColor: "text-amber-800",
    textMuted: "text-amber-600",
    badgeBg: "bg-amber-500",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    textColor: "text-blue-800",
    textMuted: "text-blue-600",
    badgeBg: "bg-blue-500",
  },
};

const alertIcons = {
  error: AlertTriangle,
  warning: Clock,
  info: Info,
};

export function AdminNotifications() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(
    new Set()
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notificaciones");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleFocus = () => fetchNotifications();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchNotifications]);

  const activeAlerts = (data?.alerts || []).filter(
    (a) => !dismissedAlerts.has(a.id)
  );
  if (activeAlerts.length === 0) return null;

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts((prev) => new Set([...prev, alertId]));
  };

  const dismissAll = () => {
    setDismissedAlerts(new Set(activeAlerts.map((a) => a.id)));
  };

  const toggleExpand = (alertId: string) => {
    setExpandedAlerts((prev) => {
      const next = new Set(prev);
      next.has(alertId) ? next.delete(alertId) : next.add(alertId);
      return next;
    });
  };

  return (
    <div className="mb-6 space-y-2">
      {activeAlerts.map((alert) => {
        const styles = alertStyles[alert.type];
        const Icon = alertIcons[alert.type];
        const isExpanded = expandedAlerts.has(alert.id);

        return (
          <div
            key={alert.id}
            className={`relative rounded-xl border ${styles.bg} p-4 transition-all`}
          >
            <button
              onClick={() => dismissAlert(alert.id)}
              className="absolute right-3 top-3 rounded-lg p-1 transition-colors hover:bg-black/5"
              aria-label="Cerrar"
            >
              <X className={`h-4 w-4 ${styles.textMuted}`} />
            </button>

            <div className="flex items-start gap-3 pr-8">
              <div className={`rounded-lg p-2 ${styles.iconBg}`}>
                <Icon className={`h-5 w-5 ${styles.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-semibold ${styles.textColor}`}>
                    {alert.title}
                  </p>
                  <span
                    className={`inline-flex items-center justify-center h-5 min-w-[20px] rounded-full px-1.5 text-[10px] font-bold text-white ${styles.badgeBg}`}
                  >
                    {alert.count}
                  </span>
                </div>
                <p className={`mt-0.5 text-xs ${styles.textMuted}`}>
                  {alert.message}
                </p>

                {alert.details.length > 0 && (
                  <>
                    <button
                      onClick={() => toggleExpand(alert.id)}
                      className={`mt-2 flex items-center gap-1 text-xs font-medium ${styles.textMuted} hover:underline`}
                    >
                      {isExpanded ? "Ocultar detalles" : "Ver detalles"}
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="mt-2 space-y-1.5">
                        {alert.details.map((detail) => (
                          <Link
                            key={detail.id}
                            href={`/admin/alquileres/${detail.id}`}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors hover:bg-black/5 ${styles.textMuted}`}
                          >
                            <span className="font-medium">
                              {detail.customer}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <CalendarCheck className="h-3 w-3" />
                              {alert.type === "error"
                                ? `Vencido hace ${detail.days} día${detail.days === 1 ? "" : "s"}`
                                : `Vence en ${detail.days} día${detail.days === 1 ? "" : "s"}`}
                            </span>
                          </Link>
                        ))}
                        <Link
                          href="/admin/alquileres"
                          className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${styles.textMuted} hover:underline`}
                        >
                          Ir a alquileres
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {activeAlerts.length > 1 && (
        <button
          onClick={dismissAll}
          className="w-full rounded-lg py-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100"
        >
          Descartar todas
        </button>
      )}
    </div>
  );
}
