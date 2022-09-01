export enum MceMenu {
  None = 0,
  /** 前菜单 */
  Prefix = 2,
  /** 后菜单 */
  Suffix = 4,
  /** 替换誊抄内容 */
  Replace = 1,
  /** 报文编辑菜单 */
  Edit = 8,
  /** 整报校报菜单 */
  RegularPre = 32,
  RegularSuf = 16,
}

export enum MceFlag {
  None = 0,
  /** 显示概率 */
  Ratio = 2,
  /** 显示符号 */
  State = 4,
}

export interface MceRange {
  dx: number;
  dy: number;
  role: "none" | "head" | "body";
  menu: boolean;
}

export interface MceInstance {
  on(name: "head:mark", callback: (field: string) => void): void;
  on(name: "head:send", callback: (field: string) => void): void;
  on(name: "head:replace", callback: (field: string, editor: "a" | "b") => void): void;

  on(name: "body:mark", callback: MceClickHandler): void;
  on(name: "body:send", callback: (dx: number, dy: number) => void): void;
  on(name: "body:send-old", callback: (dx: number, dy: number) => void): void;
  on(name: "body:replace", callback: (dx: number, dy: number, editor: "a" | "b") => void): void;

  on(name: "head:click", callback: MceClickHandler): void;
  on(name: "head:contextMenu", callback: MceClickHandler): void;
  on(name: "body:click", callback: MceClickHandler): void;
  on(name: "body:contextMenu", callback: MceClickHandler): void;
  on(name: "head:dblclick", callback: MceClickHandler): void;
  on(name: "body:dblclick", callback: MceClickHandler): void;
  on(name: "body:shift+click", callback: MceClickHandler): void;

  on(name: "head:focus", callback: MceClickHandler): void;
  on(name: "body:focus", callback: MceClickHandler): void;
  // on(name: "body:blur", callback: MceClickHandler): void;

  on(name: "body:insertCell", callback: MceClickHandler): void;
  on(name: "body:deleteCell", callback: MceClickHandler): void;
  on(name: "body:cleanCell", callback: MceClickHandler): void;
  on(name: "body:insertRow", callback: MceClickHandler): void;
  on(name: "body:deleteRow", callback: MceClickHandler): void;
  on(name: "body:deleteFront", callback: MceClickHandler): void;
  on(name: "body:deleteBehind", callback: MceClickHandler): void;

  on(name: "body:regularInsert", callback: MceClickHandler): void;
  on(name: "body:regularDelete", callback: (index: number, splitIdx: number) => void): void;
  on(name: "body:regularMerge", callback: (index: number, splitIdx: number) => void): void;
  on(name: "body:regularSplit", callback: (index: number, splitIdx: number) => void): void;
  on(name: "body:regularPlay", callback: MceClickHandler): void;

  on(
    name: "head:mousemove",
    callback: (index: number, field: string, movein: boolean) => void
  ): void;
  on(
    name: "body:mousemove",
    callback: (index: number, field: string, movein: boolean) => void
  ): void;

  on(name: "head:change", callback: (field: string, value: string) => void): void;

  on(name: "body:change", callback: (field: string, value: string) => void): void;
}

export type MceClickHandler = (index: number, field: string) => void;
