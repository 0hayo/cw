import { ThunkAction } from "redux-thunk";

export const load = (
  count: number
): ThunkAction<
  any,
  { ui: UIReducer },
  any,
  PayloadAction<Partial<UIReducer>>
> => {
  return async (dispatch, getState) => {
    const state = getState();
    const loading = state.ui.loading + count;

    dispatch({
      type: "ui/update",
      payload: {
        loading: loading > 0 ? loading : 0,
      },
    });
  };
};

export const tabbar = (
  active: TabbarValue
): ThunkAction<any, any, any, PayloadAction<Partial<UIReducer>>> => {
  return async dispatch => {
    dispatch({
      type: "ui/update",
      payload: {
        tabbar: active,
      },
    });
  };
};
