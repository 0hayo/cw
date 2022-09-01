interface MstAction<T = any> {
  type: T;
}

interface PayloadAction<STATE> extends MstAction {
  payload: STATE;
}

interface MstResponse<T = any> {
  data?: T;
  status: number;
  message: string;
}

interface ManageResponse<T = any> {
  data?: T;
  msg: string;
  message?: string;
  status: Number;
}
