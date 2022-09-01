import { Reducer } from "redux";

const reducer: Reducer<Dictionary, PayloadAction<Dictionary>> = (
  state = {},
  action
) => {
  switch (action.type) {
    case "dictionary/set":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
