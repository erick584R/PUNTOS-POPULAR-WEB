"use client";

import React from "react";
import { useAlertStore, Alert } from "@/store/alertStore";
import {
  CheckCircle,
  Error,
  WarningRounded,
  Info,
  Close,
} from "@mui/icons-material";
import "@/styles/AlertPanel.css";

const AlertPanel: React.FC = () => {
  const { alerts, removeAlert } = useAlertStore();

  const getIconByType = (type: Alert["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="alert-icon alert-icon--success" />;
      case "error":
        return <Error className="alert-icon alert-icon--error" />;
      case "warning":
        return <WarningRounded className="alert-icon alert-icon--warning" />;
      case "info":
        return <Info className="alert-icon alert-icon--info" />;
      default:
        return null;
    }
  };

  const handleAccept = (alert: Alert) => {
    if (alert.onAccept) {
      alert.onAccept();
    }
    removeAlert(alert.id);
  };

  if (alerts.length === 0) return null;

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert alert--${alert.type}`}>
          <div className="alert-icon-wrapper">
            {alert.icon ? alert.icon : getIconByType(alert.type)}
          </div>

          <div className="alert-content">
            <div className="alert-text">
              <h4 className="alert-title">{alert.title}</h4>
              <p className="alert-message">{alert.message}</p>
            </div>

            <div className="alert-buttons">
              {alert.showAcceptButton && (
                <button
                  className="alert-accept-btn"
                  onClick={() => handleAccept(alert)}
                >
                  Aceptar
                </button>
              )}

              {alert.action && (
                <button
                  className="alert-action-btn"
                  onClick={() => {
                    alert.action?.onClick();
                    removeAlert(alert.id);
                  }}
                >
                  {alert.action.label}
                </button>
              )}
            </div>
          </div>

          <button
            className="alert-close-btn"
            onClick={() => removeAlert(alert.id)}
            aria-label="Cerrar alerta"
          >
            <Close />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertPanel;
