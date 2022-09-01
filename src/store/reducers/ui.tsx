import { Reducer } from "redux";

const reducer: Reducer<UIReducer, PayloadAction<UIReducer>> = (
  state = {
    loading: 0,
    tabbar: false,
    message: null,
  },
  action
) => {
  switch (action.type) {
    case "ui/update":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
