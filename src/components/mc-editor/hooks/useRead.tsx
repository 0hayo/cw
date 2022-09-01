import { useState, useEffect, useContext, useCallback, MouseEventHandler } from "react";
import McEditorContext from "../context";

interface IProps {
  role: string;
  index: number;
  field: string;
}

const useRead = (
  props: IProps
): {
  active: boolean;
  handleClick: MouseEventHandler<HTMLDivElement>;
  handleDblClick: MouseEventHandler<HTMLDivElement>;
  handleMouseSelect: MouseEventHandler<HTMLDivElement>;
  handleMouseOut: MouseEventHandler<HTMLDivElement>;
  handleContextMenu: MouseEventHandler<HTMLDivElement>;
} => {
  const { role, index, field } = props;
  const [active, setActive] = useState(false);
  const { bus, uuid, range } = useContext(McEditorContext);

  /** 单击事件 */
  const handleClick: MouseEventHandler<HTMLDivElement> = useCallback(
    event => {
      if (event.shiftKey) {
        bus.emit(`mc-${uuid}:${role}:shift+click`, index, field);
      } else {
        bus.emit(`mc-${uuid}:${role}:click`, index, field);
      }
    },
    [bus, uuid, role, index, field]
  );

  /** 右键点击事件 */
  const handleContextMenu: MouseEventHandler<HTMLDivElement> = useCallback(
    event => {
      if (field !== "FROM" && field !== "TO" && field !== "SIGN") {
        bus.emit(`mc-${uuid}:${role}:contextMenu`, index, field);
      }
    },
    [bus, uuid, role, index, field]
  );

  /** 双击事件 */
  const handleDblClick: MouseEventHandler<HTMLDivElement> = useCallback(
    () => bus.emit(`mc-${uuid}:${role}:dblclick`, index, field),
    [bus, uuid, role, index, field]
  );

  /** 拖动选择多组，以及触发誊抄悬停高亮 */
  const handleMouseSelect: MouseEventHandler<HTMLDivElement> = useCallback(
    event => {
      if (role === "body" && event.buttons === 1) {
        if (range.dx === index) {
          bus.emit(`mc-${uuid}:${role}:click`, index, field);
        } else if (index > range.dx) {
          if (range.dy < range.dx) {
            bus.emit(`mc-${uuid}:${role}:shift+click`, index, field);
          } else {
            range.dy = index;
            bus.emit(`mc-${uuid}:${role}:shift+click`, index, field);
          }
        } else if (index < range.dx) {
          //暂不支持反方向选择
        }
      } else {
        bus.emit(`mc-${uuid}:${role}:mousemove`, index, field, true);
      }
    },
    [bus, uuid, role, index, field, range]
  );

  const handleMouseOut: MouseEventHandler<HTMLDivElement> = useCallback(
    event => {
      bus.emit(`mc-${uuid}:${role}:mousemove`, index, field, false);
    },
    [bus, uuid, role, index, field]
  );

  /** 选中状态 */
  useEffect(() => {
    setActive(range.role === role && range.dx <= index && range.dy >= index);
  }, [index, role, range]);

  return {
    active,
    handleClick,
    handleDblClick,
    handleMouseSelect,
    handleMouseOut,
    handleContextMenu,
  };
};

export default useRead;
