import { combineReducers } from "redux";
import ui from "./ui";
import auth from "./auth";
// import dictionary from "./dictionary";

const reducers = combineReducers({
  ui,
  auth,
  // dictionary,
});

export default reducers;
