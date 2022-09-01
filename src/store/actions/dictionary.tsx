import { ThunkAction } from "redux-thunk";
import fetch from "utils/fetch";

export const getAllDictionary = (): ThunkAction<
  any,
  any,
  any,
  PayloadAction<Partial<Dictionary>>
> => {
  return async dispatch => {
    const { data } = await fetch.get<MstResponse>("/dict/getAllDict");
    const payload = {};
    data.data &&
      data.data.map(it => {
        payload[it.type] = it.dictDataList;
        return it;
      });
    dispatch({
      type: "dictionary/set",
      payload: payload,
    });
  };
};
