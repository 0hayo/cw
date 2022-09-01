import { focus } from "misc/dom";
import McEditorContext from "../context";
import {
  useContext,
  useCallback,
  ChangeEventHandler,
  KeyboardEventHandler,
  useState,
  FocusEventHandler,
} from "react";

const kRegex = /^[\d\sa-z/A-Z—-]*$/i;

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
  handleBlur: FocusEventHandler<HTMLInputElement>;
  active: boolean;
} => {
  const { role, index, field, allowSpace } = props;
  const { bus, uuid } = useContext(McEditorContext);
  const [active, setActive] = useState(false);

  /** 修改事件 */
  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    event => {
      const value = event.target.value;
      if (kRegex.test(value)) {
        bus.emit(
          `mc-${uuid}:${role}:change`,
          field,
          value.toUpperCase()
          // .replace(/0/g, "⁰")
          // .replace(/1/g, "¹")
          // .replace(/2/g, "²")
          // .replace(/3/g, "³")
          // .replace(/4/g, "⁴")
          // .replace(/5/g, "⁵")
          // .replace(/6/g, "⁶")
          // .replace(/7/g, "⁷")
          // .replace(/8/g, "⁸")
          // .replace(/9/g, "⁹")
        );
      }
    },
    [bus, uuid, role, field]
  );

  /** 按键事件 */
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    event => {
      if (allowSpace) {
        return;
      }
      // 退格
      if (event.shiftKey && event.keyCode === 32) {
        event.preventDefault();
        event.stopPropagation();
        focus(`mc-${uuid}--${role}--${index - 1}`);
        return;
      }
      // 进格
      if (event.keyCode === 9 || event.keyCode === 32) {
        event.preventDefault();
        event.stopPropagation();
        focus(`mc-${uuid}--${role}--${index + 1}`);
        return;
      }
    },
    [uuid, role, index, allowSpace]
  );

  const handleBlur: FocusEventHandler<HTMLInputElement> = useCallback(
    event => {
      setActive(false);
      // bus.emit(`mc-${uuid}:${role}:blur`);
      let value = event.target.value;
      //减号
      if (value.indexOf("-") >= 0) {
        value = value.replace("-", "TO");
        value = value.replace(/[-]*/g, "");
        bus.emit(`mc-${uuid}:${role}:change`, field, value.toUpperCase());
      }
      //中划线
      if (value.indexOf("—") >= 0) {
        value = value.replace("—", "TO");
        value = value.replace(/[—]*/g, "");
        bus.emit(`mc-${uuid}:${role}:change`, field, value.toUpperCase());
      }
      return;
    },
    [bus, uuid, role, field]
  );

  return {
    handleChange,
    handleKeyDown,
    handleBlur,
    active,
  };
};

export default useEdit;
