import { useAlertStore, Alert, AlertType } from "@/store/alertStore";

interface UseAlertOptions {
  duration?: number;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useAlert = () => {
  const { addAlert, removeAlert, clearAlerts } = useAlertStore();

  const showAlert = (
    type: AlertType,
    title: string,
    message: string,
    options?: UseAlertOptions
  ) => {
    return addAlert({
      type,
      title,
      message,
      duration: options?.duration,
      icon: options?.icon,
      action: options?.action,
    });
  };

  const showSuccess = (
    title: string,
    message: string,
    options?: UseAlertOptions
  ) => {
    return showAlert("success", title, message, options);
  };

  const showError = (
    title: string,
    message: string,
    options?: UseAlertOptions
  ) => {
    return showAlert("error", title, message, options);
  };

  const showWarning = (
    title: string,
    message: string,
    options?: UseAlertOptions
  ) => {
    return showAlert("warning", title, message, options);
  };

  const showInfo = (
    title: string,
    message: string,
    options?: UseAlertOptions
  ) => {
    return showAlert("info", title, message, options);
  };

  return {
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert,
    clearAlerts,
  };
};
