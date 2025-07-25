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
  ignoreFormItem?: boolean; // 不要 FormControl / label / error
  ignoreLabel?: boolean; // 不要 Label
  ignoreError?: boolean; // 不要错误
};

export default function BoFormItem({
  label,
  name,
  options = {},
  formControlProps = {},
  ignoreFormItem,
  ignoreLabel,
  ignoreError,
  children,
}: PropsWithChildren<FormItemProps>) {
  // 处理 value onchange
  const { origin } = useContext(RHFContext);

  const hasError = !!origin?.formState?.errors?.[name];

  const helperText = origin?.formState?.errors?.[name]?.message || "";

  return ignoreFormItem ? (
    <Box className="BoFormItem" sx={{ width: "100%" }}>
      {React.cloneElement(children, {
        ...origin?.register(name, options),
        label: ignoreLabel ? undefined : label,
        error: hasError,
        fullWidth: true,
      })}
      {ignoreError ? null : (
        <Box className="BoFormItem-error-area" sx={{ height: "12px" }}>
          <FormHelperText error={hasError}>{helperText}</FormHelperText>
        </Box>
      )}
    </Box>
  ) : (
    <FormControl
      className="BoFormItem"
      fullWidth
      {...formControlProps}
      error={hasError}
    >
      {/* clone 给他加入一些这个组件控制的属性 */}
      {ignoreLabel ? null : (
        <InputLabel className="BoFormItem-label" htmlFor={name}>
          {label}
        </InputLabel>
      )}
      {React.cloneElement(children, {
        id: name,
        ...origin?.register(name, options),
      })}
      {ignoreError ? null : (
        <Box className="BoFormItem-error-area" sx={{ height: "12px" }}>
          <FormHelperText>{helperText}</FormHelperText>
        </Box>
      )}
    </FormControl>
  );
}
