import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Route, Redirect, RouteProps } from "react-router-dom";

const PrivateRoute: FC<RouteProps> = ({ component: Component, ...rest }) => {
  const auth = useSelector<StoreReducer, AuthReducer>(state => state.auth);

  return (
    <Route
      {...rest}
      render={props =>
        auth.token && Component ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: props.location,
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
