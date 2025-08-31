import {
  IconButton,
  Input,
  InputAdornment,
  InputProps,
  TextField,
  TextFieldProps,
} from "@mui/material";
import { forwardRef, useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default forwardRef(function PasswordInput(props: InputProps, ref) {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  return (
    <Input
      ref={ref}
      type={showPassword ? "text" : "password"}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            aria-label={
              showPassword ? "hide the password" : "display the password"
            }
            onClick={handleClickShowPassword}
            onMouseDown={handleMouseDownPassword}
            onMouseUp={handleMouseUpPassword}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      }
      {...props}
    />
  );
});
