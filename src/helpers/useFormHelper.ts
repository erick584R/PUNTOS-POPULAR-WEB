import { EventTargetProps } from "@/interfaces/App/Forms.interfaces";
import { useState } from "react";

function useFormHelper<T>(initialState: T) {
  const [values, setValues] = useState(initialState);

  function handleChange(event: EventTargetProps) {
    setValues((prev: any) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  function updateValues(newStates: T) {
    setValues(newStates);
  }

  return {
    values,
    handleChange,
    updateValues,
  };
}

export default useFormHelper;