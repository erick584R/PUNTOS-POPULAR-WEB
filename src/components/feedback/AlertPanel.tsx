"use client";

import React from "react";
import { useAlertStore, Alert } from "@/store/alertStore";
import {
  CheckCircleOutline,
  ErrorOutline,
  WarningAmber,
  InfoOutlined,
  CloseOutlined,
} from "@mui/icons-material";
import "@/styles/AlertPanel.css";

const AlertPanel: React.FC = () => {
  const { alerts, removeAlert } = useAlertStore();

  const getIconByType = (type: Alert["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleOutline className="alert-icon alert-icon--success" />;
      case "error":
        return <ErrorOutline className="alert-icon alert-icon--error" />;
      case "warning":
        return <WarningAmber className="alert-icon alert-icon--warning" />;
      case "info":
        return <InfoOutlined className="alert-icon alert-icon--info" />;
      default:
        return null;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="alert-container">
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert alert--${alert.type}`}>
          <div className="alert-content">
            <div className="alert-icon-wrapper">
              {alert.icon ? alert.icon : getIconByType(alert.type)}
            </div>

            <div className="alert-text">
              <h4 className="alert-title">{alert.title}</h4>
              <p className="alert-message">{alert.message}</p>
            </div>

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

          <button
            className="alert-close-btn"
            onClick={() => removeAlert(alert.id)}
            aria-label="Cerrar alerta"
          >
            <CloseOutlined />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AlertPanel;
