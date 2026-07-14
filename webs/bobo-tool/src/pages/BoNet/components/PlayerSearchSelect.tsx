import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import type { MomoPlayerGid } from "../types";
import { queryUid } from "../services/api";

type PlayerSearchSelectProps = {
  value: MomoPlayerGid | null;
  onChange: (player: MomoPlayerGid | null) => void;
  disabled?: boolean;
  sx?: object;
};

const PlayerSearchSelect: FC<PlayerSearchSelectProps> = ({
  value,
  onChange,
  disabled,
  sx,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<MomoPlayerGid[]>([]);
  const [loading, setLoading] = useState(false);
  const seqRef = useRef(0);

  const search = useCallback(async (keyword: string) => {
    const kw = keyword.trim();
    if (kw.length < 1) {
      setOptions([]);
      return;
    }
    const seq = ++seqRef.current;
    setLoading(true);
    try {
      const list = await queryUid(kw);
      if (seq === seqRef.current) {
        setOptions(list);
      }
    } catch {
      if (seq === seqRef.current) {
        setOptions([]);
      }
    } finally {
      if (seq === seqRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void search(inputValue);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [inputValue, search]);

  useEffect(() => {
    if (value) {
      setInputValue(`${value.name} (${value.gid})`);
    }
  }, [value]);

  const optionLabel = useMemo(
    () => (option: MomoPlayerGid) => `${option.name} (${option.gid})`,
    [],
  );

  return (
    <Autocomplete
      sx={{ minWidth: 280, ...sx }}
      size="small"
      disabled={disabled}
      value={value}
      options={options}
      loading={loading}
      inputValue={inputValue}
      filterOptions={(x) => x}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionLabel={optionLabel}
      noOptionsText={inputValue.trim() ? "无匹配角色" : "输入角色名关键字"}
      onInputChange={(_, next, reason) => {
        if (reason === "input" || reason === "clear") {
          setInputValue(next);
        }
        if (reason === "clear") {
          onChange(null);
        }
      }}
      onChange={(_, next) => {
        onChange(next);
        if (next) {
          setInputValue(optionLabel(next));
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="搜索角色"
          placeholder="输入角色名关键字"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={18} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default PlayerSearchSelect;
