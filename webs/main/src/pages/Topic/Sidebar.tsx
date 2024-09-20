import { FC, forwardRef, useEffect, useState } from "react";
import { Box, Divider, styled, alpha, keyframes } from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import {
  TreeItem2Root,
  TreeItem2Props,
  TreeItem2Checkbox,
  TreeItem2Label,
  TreeItem2GroupTransition,
  TreeItem2Content,
  TreeItem2IconContainer,
} from "@mui/x-tree-view/TreeItem2";
import { TreeItem2Provider } from "@mui/x-tree-view/TreeItem2Provider";
import { TreeItem2Icon } from "@mui/x-tree-view/TreeItem2Icon";
import { useTreeItem2 } from "@mui/x-tree-view/useTreeItem2/useTreeItem2";
import { TreeItem2DragAndDropOverlay } from "@mui/x-tree-view/TreeItem2DragAndDropOverlay";
import NumbersIcon from "@mui/icons-material/Numbers";
import ImageBlackboard from "@/assets/blackboard.jpg";
import { services } from "@/db/services/Menu.service";
import { motion } from "framer-motion";

const MUI_X_PRODUCTS: TreeViewBaseItem[] = [
  {
    id: "1",
    label: "官方频道",
    children: [
      { id: "1-1", label: "〔📣〕产品公告" },
      { id: "1-2", label: "〔ℹ️〕产品信息" },
      { id: "1-3", label: "〔🆕〕近期新闻" },
    ],
  },
  {
    id: "2",
    label: "门店",
    children: [
      { id: "2-1", label: "〔🥮〕月球B区嫦娥路店" },
      { id: "2-2", label: "〔🔥〕火星对流层移动店" },
      { id: "2-3", label: "〔👼〕西城区-毽子幼儿园店" },
      { id: "2-4", label: "〔🌞〕太阳黑子区-A" },
      { id: "2-5", label: "〔🧹〕宇宙尘埃店" },
      { id: "2-6", label: "〔🏠〕我家店 (进群有礼)" },
      { id: "2-7", label: "〔⚡〕凹凸电波店" },
      { id: "2-8", label: "〔😴〕梦境超市店" },
    ],
  },
  {
    id: "3",
    label: "顾客讨论区",
    children: [
      { id: "3-1", label: "〔👶〕婴幼儿交友基地" },
      { id: "3-2", label: "〔🙋‍♂️〕青少年交友基地" },
      { id: "3-3", label: "〔🧑‍🦰〕青年人交友基地" },
      { id: "3-4", label: "〔🧔‍♂️〕中年人交友基地" },
      { id: "3-5", label: "〔👨‍🦰〕中老年交友基地" },
      { id: "3-6", label: "〔👵〕夕阳红交友基地" },
      { id: "3-7", label: "〔🪦〕太平间交友墓地" },
    ],
  },
  {
    id: "4",
    label: "投诉区",
    children: [{ id: "4-1", label: "〔🚫〕投诉本" }],
  },
];

const Root = styled("div")(({ theme }) => ({
  // padding: theme.spacing(1),
}));

const CustomTreeItem = forwardRef(
  (props: TreeItem2Props, ref: React.Ref<HTMLLIElement>) => {
    const { id, itemId, label, disabled, children, ...other } = props;

    const {
      getRootProps,
      getContentProps,
      getIconContainerProps,
      getCheckboxProps,
      getLabelProps,
      getGroupTransitionProps,
      getDragAndDropOverlayProps,
      status,
    } = useTreeItem2({ id, itemId, children, label, disabled, rootRef: ref });

    return (
      <TreeItem2Provider itemId={itemId}>
        <TreeItem2Root {...getRootProps(other)}>
          <TreeItem2Content {...getContentProps()} sx={{ padding: "4px" }}>
            <TreeItem2IconContainer {...getIconContainerProps()}>
              <TreeItem2Icon status={status} />
              {!children ? <NumbersIcon sx={{ fontSize: "20px" }} /> : null}
            </TreeItem2IconContainer>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                gap: 1,
                alignItems: "center",
              }}
            >
              <TreeItem2Checkbox {...getCheckboxProps()} />
              <TreeItem2Label {...getLabelProps()} sx={{ fontSize: "14px" }} />
            </Box>
            <TreeItem2DragAndDropOverlay {...getDragAndDropOverlayProps()} />
          </TreeItem2Content>
          {children && (
            <TreeItem2GroupTransition {...getGroupTransitionProps()} />
          )}
        </TreeItem2Root>
      </TreeItem2Provider>
    );
  }
);

type SidebarProps = {
  topicId: string;
};
const Sidebar: FC<SidebarProps> = (props) => {
  const [icon, setIcon] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (props.topicId) {
      getIcon(props.topicId);
    } else {
      setIcon(undefined);
    }
  }, [props.topicId]);

  async function getIcon(id: string) {
    const doc = await services.getMenuById(id);

    if (doc) {
      setIcon(doc.src);
    }
  }

  return (
    <Root>
      <Box
        sx={(theme) => ({
          // padding: theme.spacing(2),
          background: `url(${ImageBlackboard})`,
          height: "80px",
          backgroundSize: "auto 100%",
          position: "relative",
          overflow: "hidden",
        })}
      >
        {/* 运动图标 */}
        {icon ? (
          <motion.div
            key={icon}
            transition={{ duration: 1 }}
            initial={{ transform: "translateY(50px)" }}
            animate={{ transform: "translateY(0px)" }}
          >
            <motion.div
              transition={{
                duration: 5,
                ease: "linear",
                times: [0, 0.25, 0.5, 0.75, 1],
                repeat: Infinity,
              }}
              animate={{
                transform: [
                  "translateY(0px)",
                  "translateY(-2px)",
                  "translateY(0px)",
                  "translateY(2px)",
                  "translateY(0px)",
                ],
              }}
            >
              <motion.div
                transition={{
                  duration: 15,
                  ease: "easeInOut",
                  times: [0, 0.25, 0.5, 0.75, 1],
                  repeat: Infinity,
                }}
                animate={{
                  transform: [
                    "rotateZ(0)",
                    "rotateZ(6deg)",
                    "rotateZ(0)",
                    "rotateZ(-6deg)",
                    "rotateZ(0)",
                  ],
                }}
              >
                <Box
                  sx={(theme) => {
                    const color = alpha(theme.palette.primary.dark, 0.9);
                    return {
                      position: "absolute",
                      top: "15px",
                      left: "28px",
                      borderRadius: "25px",
                      height: "54px",
                      width: "54px",
                      backgroundImage: `url(${icon})`,
                      backgroundColor: color,
                      backgroundSize: "44px 44px",
                      backgroundPosition: "5px 5px",
                      backgroundRepeat: "no-repeat",
                      "::after": {
                        content: "''",
                        position: "absolute",
                        bottom: "-6px",
                        left: "22px",
                        height: 0,
                        width: 0,
                        borderTop: `6px solid transparent`,
                        borderLeft: `6px solid transparent`,
                        borderRight: `6px solid transparent`,
                        borderBottom: `8px solid ${color}`,
                      },
                    };
                  }}
                ></Box>
              </motion.div>
            </motion.div>
          </motion.div>
        ) : null}

        <Box
          sx={{
            position: "absolute",
            height: "100%",
            width: "70%",
            top: "0",
            right: "0",
            fontSize: "16px",
            fontWeight: 900,
            color: "#d2d2d2",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              left: "35px",
              top: "17px",
              transform: "rotate(5deg)",
            }}
          >
            欢
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "86px",
              top: "16px",
              transform: "rotate(2deg)",
            }}
          >
            迎
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "24px",
              top: "42px",
              transform: "rotate(-5deg)",
            }}
          >
            新
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "65px",
              top: "40px",
              transform: "rotate(-5deg)",
            }}
          >
            同
          </Box>
          <Box
            sx={{
              position: "absolute",
              left: "106px",
              top: "39px",
              transform: "rotate(-3deg)",
            }}
          >
            学
          </Box>
        </Box>
      </Box>
      <Divider />
      <Box
        sx={(theme) => ({
          paddingBottom: theme.spacing(2),
        })}
      >
        <RichTreeView
          defaultExpandedItems={MUI_X_PRODUCTS.map((item) => item.id)}
          items={MUI_X_PRODUCTS}
          slots={{ item: CustomTreeItem }}
          isItemDisabled={(item) => item.id === "4-1"}
        />
      </Box>
    </Root>
  );
};

export default Sidebar;
