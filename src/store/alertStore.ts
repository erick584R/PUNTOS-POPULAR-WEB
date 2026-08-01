import { create } from "zustand";

export type AlertType = "success" | "error" | "warning" | "info";

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertStore {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, "id">) => void;
  removeAlert: (id: string) => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertStore>((set) => ({
  alerts: [],

  addAlert: (alert) => {
    const id = `alert-${Date.now()}-${Math.random()}`;
    const newAlert: Alert = { ...alert, id };

    set((state) => ({
      alerts: [...state.alerts, newAlert],
    }));

    if (alert.duration) {
      setTimeout(() => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }));
      }, alert.duration);
    }

    return id;
  },

  removeAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    }));
  },

  clearAlerts: () => {
    set({ alerts: [] });
  },
}));
