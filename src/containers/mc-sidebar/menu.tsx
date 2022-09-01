import "./menu.less";
import React, { FC } from "react";
import classnames from "classnames";

interface IProps {
  icon: TabbarValue;
  active: boolean;
  onClick: VoidFunction;
}

const Menu: FC<IProps> = props => {
  const classes = classnames("mc-sidebar-menu", {
    [`mc-sidebar-menu__${props.icon}`]: !props.active,
    [`mc-sidebar-menu__${props.icon}--active`]: props.active,
  });
  return (
    <div className={classes} onClick={props.onClick}>
      {props.children}
    </div>
  );
};

export default Menu;
