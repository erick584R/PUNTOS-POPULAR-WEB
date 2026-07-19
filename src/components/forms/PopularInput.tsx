"use client";

import { PopularInputProps } from "@/interfaces/App/Forms.interfaces";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Input, InputAdornment, InputLabel } from "@mui/material";
import { useId, useState } from "react";

const PopularInput: React.FC<PopularInputProps> = ({
  label,
  name,
  value,
  className,
  placeholder,
  type,
  isPassword,
  startAdornment,
  endAdornment,
  disabled,
  onChange,
  onFocus,
  onBlur,
  onClick,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = useId();

  return (
    <div className={className ? className : "mb-4"}>
      <InputLabel htmlFor={inputId}>{label}</InputLabel>
      <Input
        id={inputId}
        placeholder={placeholder}
        type={((isPassword && showPassword) || !isPassword) ? type ?? "text" : "password"}
        fullWidth
        name={name}
        value={value ?? ""}
        autoComplete="off"
        onFocus={onFocus as any}
        onBlur={onBlur as any}
        onClick={onClick}
        onChange={(e) =>
          onChange?.({ target: { name: e.target.name, value: e.target.value } }, true)
        }
        disabled={disabled}
        startAdornment={
          startAdornment ? <InputAdornment position="start">{startAdornment}</InputAdornment> : undefined
        }
        endAdornment={
          isPassword ? (
            <InputAdornment position="end">
              {showPassword ? (
                <VisibilityOff onClick={() => setShowPassword(false)} style={{ cursor: "pointer" }} />
              ) : (
                <Visibility onClick={() => setShowPassword(true)} style={{ cursor: "pointer" }} />
              )}
            </InputAdornment>
          ) : endAdornment ? (
            <InputAdornment position="end">{endAdornment}</InputAdornment>
          ) : undefined
        }
      />
    </div>
  );
};

export default PopularInput;