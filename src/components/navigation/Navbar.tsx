"use client";

import React, { useEffect, useState } from "react";
import { GetSessionStorage } from "@/helpers/helpers";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function PopularNavbar() {
  const [userName, setUserName] = useState("");
  const [userAccount, setUserAccount] = useState("");

  useEffect(() => {
    const name = GetSessionStorage("user_name_data") || "USUARIO";
    const account = GetSessionStorage("user_account") || ""; // Lee cuentaBP guardada

    setUserName(name);
    setUserAccount(account);
  }, []);

  return (
    <header className="popular-top-navbar">
      <div className="popular-navbar-spacer" />
      
      <div className="popular-navbar-user-box">
        <AccountCircleIcon className="popular-navbar-user-icon" />
        <div className="popular-navbar-user-info">
          <span className="navbar-username">{userName}</span>
          <span className="navbar-user-account">Cuenta: {userAccount}</span>
        </div>
      </div>
    </header>
  );
}