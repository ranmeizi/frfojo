import {
  Box,
  FormControl,
  FormControlProps,
  FormHelperText,
  InputLabel,
} from "@mui/material";
import React, { PropsWithChildren, ReactNode, useContext } from "react";
import { RHFContext } from "../BoForm";
import { RegisterOptions } from "react-hook-form";

type FormItemProps = {
  label?: ReactNode;
  name: string; // key
  options?: RegisterOptions;
  formControlProps?: FormControlProps;
};

export default function BoFormItem({
  label,
  name,
  options = {},
  formControlProps = {},
  children,
}: PropsWithChildren<FormItemProps>) {
  // 处理 value onchange
  const { origin } = useContext(RHFContext);

  const hasError = !!origin?.formState?.errors?.[name];

  return (
    <FormControl
      className="BoFormItem"
      fullWidth
      {...formControlProps}
      error={hasError}
    >
      <InputLabel className="BoFormItem-label" htmlFor={name}>
        {label}
      </InputLabel>
      {/* clone 给他加入一些这个组件控制的属性 */}
      {React.cloneElement(children, {
        id: name,
        ...origin?.register(name, options),
        error: hasError,
      })}
      <Box className="BoFormItem-error-area" sx={{ height: "12px" }}>
        <FormHelperText>
          {origin?.formState?.errors?.[name]?.message || ""}
        </FormHelperText>
      </Box>
    </FormControl>
  );
}
