import store, { persistor } from "store";
import React, { FC } from "react";
import { ConfigProvider } from "antd";
import locale from "antd/es/locale/zh_CN";
import { CookiesProvider } from "react-cookie";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

export const McProvider: FC = ({ children }) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate persistor={persistor}>
        <CookiesProvider>
          <ConfigProvider locale={locale}>{children}</ConfigProvider>
        </CookiesProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default McProvider;
