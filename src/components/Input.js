import React from "react";

// A functional component to render an input field with optional props
export default function Input({
  onChange,
  id,
  name,
  inputs,
  type,
  pattern,
  maxLength,
  required,
  placeholder,
}) {
  return (
    <div className="m-1">
      <input
        style={{
          backgroundColor: "#F8F8F6",
          borderColor: "transparent",
          fontSize: "16px",
        }}
        type={type}
        onChange={onChange}
        placeholder={placeholder}
        value={inputs[name]}
        name={name}
        className="form-control"
        required={required}
        id={id}
        pattern={pattern}
        maxLength={maxLength}
      />
    </div>
  );
}
