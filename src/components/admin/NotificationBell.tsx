"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  Clock,
  Info,
  X,
  ChevronRight,
} from "lucide-react";

interface AlertDetail {
  id: number;
  customer: string;
  days: number;
  endDate: string;
}

interface Alert {
  id: string;
  type: "error" | "warning" | "info";
  title: string;
  message: string;
  details: AlertDetail[];
  count: number;
}

interface NotificationData {
  alerts: Alert[];
  totalAlerts: number;
  badgeCount: number;
  activeRentals: number;
}

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

export function NotificationBell() {
  const [data, setData] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notificaciones");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
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

  const badgeCount = data?.badgeCount || 0;
  const visibleAlerts = (data?.alerts || []).filter(
    (a) => !dismissedAlerts.has(a.id)
  );

  return (
    <>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white lg:text-gray-500 lg:hover:bg-gray-100 lg:hover:text-gray-700"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {badgeCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        )}
      </button>

      {showDropdown && data && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 origin-top-right rounded-2xl border border-gray-200 bg-white shadow-xl shadow-black/5 lg:right-4">
            <div className="border-b border-gray-100 px-5 py-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">
                  Notificaciones
                </h3>
                {badgeCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                    {badgeCount} nuevas
                  </span>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {visibleAlerts.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-gray-400">
                  <Bell className="h-8 w-8 mb-2" />
                  <p className="text-sm font-medium">Sin notificaciones</p>
                  <p className="text-xs">Todo está al día</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {visibleAlerts.map((alert) => {
                    const styles = alertStyles[alert.type];
                    const Icon = alertIcons[alert.type];

                    return (
                      <div
                        key={alert.id}
                        className={`rounded-xl p-3 ${styles.bg}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`rounded-lg p-1.5 ${styles.iconBg}`}>
                            <Icon className={`h-4 w-4 ${styles.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-xs font-semibold ${styles.textColor}`}
                            >
                              {alert.title}
                            </p>
                            <p
                              className={`mt-0.5 text-[11px] ${styles.textMuted}`}
                            >
                              {alert.message}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setDismissedAlerts(
                                (prev) => new Set([...prev, alert.id])
                              )
                            }
                            className={`rounded p-1 transition-colors hover:bg-black/5 ${styles.textMuted}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 px-5 py-3">
              <Link
                href="/admin/alquileres"
                onClick={() => setShowDropdown(false)}
                className="flex items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
              >
                Ver todos los alquileres
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </>
      )}

      {loading && (
        <div className="h-9 w-9 rounded-lg bg-gray-100 animate-pulse" />
      )}
    </>
  );
}
