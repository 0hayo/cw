type TabbarValue =
  | "home"
  | "none"
  | "rx"
  | "tx"
  | "telegram"
  | "files"
  | "files-draft"
  | "files-recv"
  | "files-sent"
  | "setting"
  | "setting-contact"
  | "setting-phrase"
  | "workbench"
  | "board"
  | "regular"
  | false;

interface AuthReducer {
  token: string;
  user_name: string;
  display_name: string;
  /** 证件号 */
  id_number: string;
  /** 工号 */
  emp_no: string;
  /** 用户所属角色，可多个 */
  roles: { role: string; name: string }[];
  /** 用户所属班组 */
  group?: { group_id: string; group_name: string };
}

interface NotifyMessage {
  text: string;
  variant: VariantType;
}

interface UIReducer {
  tabbar: TabbarValue;
  loading: number;
  message: NotifyMessage | null;
}

interface StoreReducer {
  ui: UIReducer;
  auth: AuthReducer;
}
