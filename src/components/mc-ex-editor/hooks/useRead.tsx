import {
  useState,
  useEffect,
  useContext,
  useCallback,
  MouseEventHandler,
} from "react";
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

  /** 双击事件 */
  const handleDblClick: MouseEventHandler<HTMLDivElement> = useCallback(
    () => bus.emit(`mc-${uuid}:${role}:dblclick`, index, field),
    [bus, uuid, role, index, field]
  );

  /** 选中状态 */
  useEffect(() => {
    setActive(range.role === role && range.dx <= index && range.dy >= index);
  }, [role, index, range]);

  return {
    active,
    handleClick,
    handleDblClick,
  };
};

export default useRead;
