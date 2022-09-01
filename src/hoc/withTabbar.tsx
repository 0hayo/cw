import React, { useEffect, ComponentType } from "react";
import { useDispatch } from "react-redux";
import { tabbar } from "store/actions/ui";

const withTabbar = <P extends {}>(comp: ComponentType<P>) => {
  return (active: TabbarValue): ComponentType<P> => {
    const Wrapper: ComponentType<P> = props => {
      const dispatch = useDispatch();
      useEffect(() => {
        dispatch(tabbar(active));
      }, [dispatch]);
      return React.createElement(comp, props);
    };
    return Wrapper;
  };
};

export const tabName = (tabCode: TabbarValue): string => {
  switch (tabCode) {
    case "home":
      return "控制台";
    case "workbench":
      return "工作台";
    case "telegram":
      return "办报";
    case "rx":
      return "收报";
    case "tx":
      return "发报";
    case "regular":
      return "整报校报";
    case "setting":
      return "系统设置";
    case "files":
      return "报文管理";
    default:
      return "";
  }
};

export default withTabbar;
