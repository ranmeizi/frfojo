import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Box, Divider, Fade, Stack, Typography } from "@mui/material";
import { type FC, useMemo } from "react";
import { buildItemDetailModel } from "../engine/itemDetailText";
import { FloatWindow } from "./FloatWindow";
import { FLOAT_STACK_KEYS } from "../RoCalcFloatStackContext";

const RO_CALC_DRAG_BOUNDS_SELECTOR = ".ro-calc-container";

type ItemInfoFloatProps = {
  itemId: number;
};

const ItemInfoFloat: FC<ItemInfoFloatProps> = ({ itemId }) => {
  const detail = useMemo(() => buildItemDetailModel(itemId), [itemId]);

  return (
    <FloatWindow
      boundsSelector={RO_CALC_DRAG_BOUNDS_SELECTOR}
      defaultSide="left"
      defaultPosition={{ y: 96 }}
      stackKey={FLOAT_STACK_KEYS.itemInfo}
      verticalStackOrder={0}
      rootClassName="ro-calc-item-info-float"
      title="物品资料"
      collapseIcon={<InfoOutlinedIcon fontSize="small" />}
      collapseAriaLabel="展开物品资料"
      collapseTooltip="展开物品资料"
      closeAriaLabel="收起"
      cardSx={{
        maxHeight: "min(70vh, 520px)",
      }}
      contentSx={{ p: 1.5 }}
    >
      <Fade in timeout={220} key={detail.id}>
        <Box>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {detail.name}
          </Typography>

          <Stack spacing={0.75} sx={{ mb: 1.5 }}>
            <Row label={detail.atkOrDefLabel} value={String(detail.atkOrDef)} />
            {detail.showWeaponLevel ? (
              <Row label="武器 Lv" value={detail.weaponLevelDisplay} />
            ) : null}
            <Row label="洞数" value={detail.slotsDisplay} />
            <Row label="重量" value={detail.weightDisplay} />
            <Row label="要求 Lv" value={detail.reqLvDisplay} />
          </Stack>

          {detail.setMembershipLines.length > 0 ? (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.5 }}
              >
                套装
              </Typography>
              <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                {detail.setMembershipLines.map((line, i) => (
                  <Typography
                    key={`set-${detail.id}-${i}`}
                    component="li"
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.45 }}
                  >
                    {line}
                  </Typography>
                ))}
              </Stack>
            </>
          ) : null}

          {detail.scriptLines.length > 0 ? (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.5 }}
              >
                效果
              </Typography>
              <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                {detail.scriptLines.map((line, i) => (
                  <Typography
                    key={`${detail.id}-${i}`}
                    component="li"
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.45 }}
                  >
                    {line}
                  </Typography>
                ))}
              </Stack>
            </>
          ) : null}

          {detail.flavorText ? (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 0.5 }}
              >
                说明
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.5,
                }}
              >
                {detail.flavorText}
              </Typography>
            </>
          ) : null}
        </Box>
      </Fade>
    </FloatWindow>
  );
};

const Row: FC<{ label: string; value: string }> = ({ label, value }) => (
  <Stack
    direction="row"
    justifyContent="space-between"
    gap={1}
    sx={{ typography: "body2" }}
  >
    <Typography component="span" color="text.secondary" variant="body2">
      {label}
    </Typography>
    <Typography
      component="span"
      variant="body2"
      fontWeight={500}
      textAlign="right"
    >
      {value}
    </Typography>
  </Stack>
);

export default ItemInfoFloat;
