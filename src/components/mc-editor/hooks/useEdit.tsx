import { focus, value } from "misc/dom";
import McEditorContext from "../context";
import {
  useContext,
  useCallback,
  ChangeEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  FocusEventHandler,
  useEffect,
  useState,
} from "react";

const kRegex = /^[\d\sa-z/A-Z~?—-]*$/i;

interface IProps {
  role: string;
  index: number;
  field: string;
  allowSpace: boolean;
}

const useEdit = (
  props: IProps
): {
  handleChange: ChangeEventHandler<HTMLInputElement>;
  handleKeyDown: KeyboardEventHandler<HTMLInputElement>;
  handleClick: MouseEventHandler<HTMLInputElement>;
  handleFocus: FocusEventHandler<HTMLInputElement>;
  handleBlur: FocusEventHandler<HTMLInputElement>;
  handleMouseSelect: MouseEventHandler<HTMLDivElement>;
  handleMouseOut: MouseEventHandler<HTMLDivElement>;
  active: boolean;
} => {
  const { role, index, field, allowSpace } = props;
  const { bus, uuid, range } = useContext(McEditorContext);
  const [active, setActive] = useState(false);

  /** 修改事件 */
  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      const value = event.target.value;
      if (kRegex.test(value)) {
        bus.emit(`mc-${uuid}:${role}:change`, field, value.toUpperCase());
      }
    },
    [bus, uuid, role, field]
  );

  /** 按键事件 */
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    event => {
      // console.debug("event key, shift=", event.shiftKey, ", key=", event.keyCode);
      if (allowSpace && event.keyCode !== 13) {
        return;
      }
      // 退格(Shift + Space, Shift + Left)
      if (event.shiftKey && (event.keyCode === 32 || event.keyCode === 9 || event.keyCode === 37)) {
        event.preventDefault();
        event.stopPropagation();
        focus(`mc-${uuid}--${role}--${index - 1}`);
        return;
      }
      // 进格(Space, Tab, Shift + Right)
      if (event.keyCode === 9 || event.keyCode === 32 || (event.shiftKey && event.keyCode === 39)) {
        event.preventDefault();
        event.stopPropagation();
        const id = `mc-${uuid}--${role}--${index + 1}`;
        // const next = document.getElementById(id);
        // if (!next) {
        //   bus.emit(`mc-${uuid}:${role}:insertRow`);
        // }
        focus(id);
        return;
      }
      // 退行(Shift + Enter)
      if (event.shiftKey && event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
        if (role === "body" && index === 0) {
          focus(`mc-${uuid}--head--7`);
        } else {
          const prev = Math.floor((index - 10) / 10) * 10;
          focus(`mc-${uuid}--${role}--${prev}`);
        }
        return;
      }
      // 进行(Enter)
      if (event.keyCode === 13) {
        event.preventDefault();
        event.stopPropagation();
        if (role === "head" && field === "RMKS") {
          //如果是报头最后一格（RMKS），回车跳转到报文第一格
          focus(`mc-${uuid}--body--0`);
        } else {
          const next = Math.floor((index + 10) / 10) * 10;
          focus(`mc-${uuid}--${role}--${next}`);
        }
        return;
      }
      // 上移光标(Up)
      if (event.keyCode === 38) {
        event.preventDefault();
        event.stopPropagation();
        const next = index - 10;
        focus(`mc-${uuid}--${role}--${next}`);
        return;
      }
      // 下移光标(Shift + Down)
      if (event.keyCode === 40) {
        event.preventDefault();
        event.stopPropagation();
        const next = index + 10;
        focus(`mc-${uuid}--${role}--${next}`);
        return;
      }
      //向前删除内容后跳到前一格（backspace）
      if (event.keyCode === 8) {
        event.stopPropagation();
        const _value = value(`mc-${uuid}--${role}--${index}`);
        if (!_value || _value === "") {
          bus.emit(`mc-${uuid}:${role}:cleanCell`);
          focus(`mc-${uuid}--${role}--${index - 1}`);
        }
        return;
      }
      // 加格子(shift + +)
      if (event.shiftKey && event.keyCode === 187) {
        event.preventDefault();
        event.stopPropagation();
        bus.emit(`mc-${uuid}:${role}:insertCell`);
        focus(`mc-${uuid}--${role}--${index + 1}`);
        return;
      }
      // 减格子(shift + -)
      if ((event.shiftKey && event.keyCode === 229) || (event.shiftKey && event.keyCode === 189)) {
        event.preventDefault();
        event.stopPropagation();
        bus.emit(`mc-${uuid}:${role}:deleteCell`);
        focus(`mc-${uuid}--${role}--${index}`);
        return;
      }
      // 加行(shift + ] )
      if (event.shiftKey && event.keyCode === 221) {
        event.preventDefault();
        event.stopPropagation();
        bus.emit(`mc-${uuid}:${role}:insertRow`);
        const next = ((index % 100) % 10) + 10;
        focus(`mc-${uuid}--${role}--${next}`);
        return;
      }
      // 减格子(shift + [ )
      if (event.shiftKey && event.keyCode === 219) {
        event.preventDefault();
        event.stopPropagation();
        bus.emit(`mc-${uuid}:${role}:deleteRow`);
        focus(`mc-${uuid}--${role}--${index}`);
        return;
      }
    },
    [bus, uuid, role, index, field, allowSpace]
  );

  const handleClick: MouseEventHandler<HTMLInputElement> = useCallback(
    event => {
      if (event.shiftKey) {
        bus.emit(`mc-${uuid}:${role}:shift+click`, index, field);
      } else {
        bus.emit(`mc-${uuid}:${role}:click`, index, field);
      }
      return;
    },
    [bus, uuid, role, index, field]
  );

  const handleFocus: FocusEventHandler<HTMLInputElement> = useCallback(
    event => {
      bus.emit(`mc-${uuid}:${role}:focus`, index, field);
      return;
    },
    [bus, uuid, role, index, field]
  );

  const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    event => {
      setActive(false);
      // bus.emit(`mc-${uuid}:${role}:blur`);
      let value = event.target.value;
      //减号
      if (value.indexOf("-") >= 0) {
        value = value.replaceAll("-", "TO");
        value = value.replaceAll(/[-]*/g, "");
        bus.emit(`mc-${uuid}:${role}:change`, field, value.toUpperCase());
      }
      //中划线
      if (value.indexOf("—") >= 0) {
        value = value.replaceAll("—", "TO");
        value = value.replaceAll(/[—]*/g, "");
        bus.emit(`mc-${uuid}:${role}:change`, field, value.toUpperCase());
      }
      return;
    },
    [bus, uuid, role, field]
  );

  /** 拖动选择多组，以及悬停高亮 */
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

  useEffect(() => {
    setActive(range.role === role && range.dx <= index && range.dy >= index);
  }, [index, role, range]);

  return {
    handleChange,
    handleKeyDown,
    handleClick,
    handleFocus,
    handleBlur,
    handleMouseSelect,
    handleMouseOut,
    active,
  };
};

export default useEdit;
