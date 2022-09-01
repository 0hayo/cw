import { Reducer } from "redux";

const DEFAULT_AUTH_INFO: AuthReducer = {
  token: "",
  emp_no: "",
  user_name: "SingleUser",
  display_name: "User",
  id_number: "",
  roles: [{ role: "telegrapher", name: "报务员" }],
  group: { group_id: "10001", group_name: "报务班组" },
};

const reducer: Reducer<AuthReducer, PayloadAction<AuthReducer>> = (
  state = DEFAULT_AUTH_INFO,
  action
) => {
  switch (action.type) {
    case "auth/set":
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};

export default reducer;
