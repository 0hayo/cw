import lodash from "lodash";

/** 获取最大下标 */
export const max = (data: McTelegramHash): number => {
  return Math.max(-1, ...keys(data).map(key => parseInt(key)));
};

/** 获取最小下标 */
export const min = (data: McTelegramHash): number => {
  return Math.min(-1, ...keys(data).map(key => parseInt(key)));
};

/** 获取所有下标 */
export const keys = (data: McTelegramHash): string[] => {
  return Object.keys(data);
};

/** 获取报文长度 */
export const size = (data: McTelegramHash): number => {
  return keys(data).length;
};

/** 遍历整个报文 */
export const each = (data: McTelegramHash, func: (key: string, val: McTelegramWord) => void) => {
  keys(data).forEach(key => {
    const item = data[key];
    if (item) {
      func(key, item);
    }
  });
};

/** 根据页面删除 */
export const drop = (data: McTelegramHash, page: number): McTelegramHash => {
  const dy = page * 100 - 1;
  const dx = page * 100 - 100;
  const next: McTelegramHash = {};

  each(data, (k, v) => {
    const ix = parseInt(k);
    if (ix < dx) {
      next[ix] = v;
    }
    if (ix > dy) {
      next[ix - 100] = v;
    }
  });

  return next;
};

/** 从指定位置开始，将报文向前或后移动offset个位置，
 * 注意：向前移动将覆盖前边的报文！
 */
export const move = (data: McTelegramHash, start: number, offset: number): McTelegramHash => {
  const next: McTelegramHash = {};
  each(data, (k, v) => {
    const ix = parseInt(k);
    if (ix >= start) {
      next[ix + offset] = v;
    } else {
      next[ix] = v;
    }
  });
  if (offset < 0) {
    for (var i = start; i < start - offset; i++) {
      if (!data[i]) {
        next[i + offset] = undefined;
        delete next[i + offset];
      } else {
        next[i + offset] = data[i];
      }
    }
  }

  return next;
};

/** 从指定位置开始，使用字符串数组覆盖本组以及后续报文 */
export const cover = (data: McTelegramHash, start: number, newData: string[]) => {
  const next: McTelegramHash = {};
  //先将指定位置之前的电文放入新电文Hash
  each(data, (k, v) => {
    const ix = parseInt(k);
    if (ix < start) {
      next[ix] = v;
    }
  });
  //将数组内容生成新电文放入
  for (var i = 0; i < newData.length; i++) {
    const newCode: McTelegramWord = {
      value: newData[i],
    };
    next[i + start] = newCode;
  }

  return next;
};

/**删除一组电文(包括空电文)，后续电文会前移 */
export const remove = (data: McTelegramHash, index: number): McTelegramHash => {
  const next: McTelegramHash = {};
  each(data, (k, v) => {
    const ix = parseInt(k);
    if (ix < index) {
      next[ix] = v;
    } else if (ix > index) {
      next[ix - 1] = v;
    }
  });
  return next;
};

//------------整报系列方法--------------
/** 在指定的一组电文前插入一组空电文（仅限body） */
export const regularInsert = (data: McTelegramHash, index: number): McTelegramHash => {
  if (index % 100 === 99) return data;
  const next: McTelegramHash = {}; //新的body电文
  each(data, (k, v) => {
    const ix = parseInt(k);
    if (ix < index) {
      //之前的组保留
      next[ix] = v;
    } else if (ix === index) {
      //在index位置复制之前的组，并清空内容(但保留音频位置信息)
      const pre = data[index - 1]; //取前一组，复制其音频偏移量和长度
      next[ix] = {
        ...pre,
        value: "",
        crude: "",
        state: "none",
        warn: false,
        light: false,
      };
      //检查是为本页的第99组
      const is_99 = ix % 100 === 98; //是否为倒数第二组(x99)
      if (is_99) {
        const n_99 = data[ix]!;
        const tail = data[ix + 1]!;
        //将倒数第二组和99组合并
        next[ix + 1] = _merge(n_99, tail);
      } else {
        next[ix + 1] = v;
      }
    } else if (ix > index) {
      //之后的组向后移位，但是不能超出本页，倒数第二组合并“压缩”到最后一组
      //检查是否移位后到了本页的第100组
      const is_99 = ix % 100 === 98; //是否为倒数第二组(x99)
      const is_100 = ix % 100 === 99; //是否最后一组
      if (is_99) {
        const n_99 = data[ix]!;
        const tail = data[ix + 1]!;
        //将倒数第二组和99组合并
        next[ix + 1] = _merge(n_99, tail);
      } else if (is_100) {
        //最后一组不处理，do nothing
      } else {
        next[ix + 1] = v;
      }
    }
  });
  return next;
};

/** 将指定的一组电文，按照指定位置拆分为两组电文（仅限body） */
export const regularSplit = (
  data: McTelegramHash,
  index: number,
  splitIdx: number
): McTelegramHash => {
  const next: McTelegramHash = {}; //新的body电文
  each(data, (k, v) => {
    const ix = parseInt(k);
    if (ix < index) {
      //之前的组保留
      next[ix] = v;
    } else if (ix === index) {
      //在index位置复制之前的组，并清空内容(但保留音频位置信息)
      const value_1 = v.value.substr(0, splitIdx);
      const value_2 = v.value.substr(splitIdx);
      //根据拆分的字符比例，重新计算大概的音频偏移量和长度
      const proportion = v.value === "" ? 0 : splitIdx / v.value.length;
      const length_1 = v.length ? Math.ceil(v.length * proportion) : 0;
      const length_2 = v.length ? v.length - length_1 : 0;
      const offset_2 = v.offset ? v.offset + length_1 : length_1;
      next[ix] = {
        ...v,
        value: value_1,
        length: length_1,
        state: "none",
        warn: false,
        light: false,
      };
      //检查是为本页的第99组
      const is_99 = ix % 100 === 98; //是否为倒数第二组(x99)
      const part_2 = {
        ...v,
        value: value_2,
        length: length_2,
        offset: offset_2,
        warn: false,
        light: false,
      };
      if (is_99) {
        next[ix + 1] = _merge(part_2, data[ix + 1]!);
      } else {
        next[ix + 1] = part_2;
      }
    } else if (ix > index) {
      //之后的组向后移位，但是不能超出本页，倒数第二组合并到最后一组
      //检查是否移位后到了本页的第99、100组
      const is_99 = ix % 100 === 98; //是否为倒数第二组(x99)
      const is_100 = ix % 100 === 99; //是否最后一组
      if (is_99) {
        const n_99 = data[ix]!;
        const tail = data[ix + 1]!;
        //将倒数第二组和99组合并
        next[ix + 1] = _merge(n_99, tail);
      } else if (is_100) {
        //最后一组不处理，do nothing
      } else {
        next[ix + 1] = v;
      }
    }
  });
  return next;
};

/** 删除多组电文，后方电文向前移动 */
export const regularDelete = (data: McTelegramHash, dx: number, dy: number): McTelegramHash => {
  const next: McTelegramHash = {}; //新的body电文
  const x = Math.min(dx, dy);
  const y = Math.max(dx, dy);
  const count = y - x + 1;
  each(data, (k, v) => {
    const ix = parseInt(k);
    if (ix < x) {
      next[ix] = v;
    } else if (ix > y) {
      //检查是否移位后到了本页的第100组
      // const is_100 = ix % 100 === 99; //是否每页的最后一组
      // if(is_100) { //如果是最后一组，则需要进行拆分（因为最后一组有可能是合并压缩过的）

      // } else {
      //   next[ix - count] = v;
      // }
      next[ix - count] = v;
    }
  });
  return next;
};

/** 合并多组电文，后方电文向前移动 */
export const regularMerge = (data: McTelegramHash, dx: number, dy: number): McTelegramHash => {
  const next: McTelegramHash = {}; //新的body电文
  const x = Math.min(dx, dy);
  const y = Math.max(dx, dy);
  const offset = y - x;
  each(data, (k, v) => {
    const ix = parseInt(k);
    if (ix < x) {
      next[ix] = v;
    } else if (ix >= x && ix <= y) {
      const merged = next[x] ? _merge(next[x]!, v) : v;
      next[x] = merged;
    } else if (ix > y) {
      next[ix - offset] = v;
    }
  });
  return next;
};

/** 合并两组电文 */
const _merge = (a: McTelegramWord, b: McTelegramWord): McTelegramWord => {
  return {
    ...b,
    value: lodash.trim((a?.value || "") + " " + (b?.value || "")),
    offset: a?.offset,
    length: (a?.length ? a.length : 0) + (b?.length ? b.length : 0),
    warn: false,
    light: false,
    ratio: lodash.concat(a?.ratio ? a.ratio : [], b?.ratio ? b.ratio : []),
    //利用extra字段保留原始的音频长度和偏移量信息
    extra: `${a?.offset ? a.offset : 0} ${a?.length ? a.length : 0}|${b?.offset ? b.offset : 0} ${
      b?.length ? b.length : 0
    }${b?.extra ? "|" + b.extra : ""}`,
  };
};
//------------整报系列方法--------------

/** 清除录入电文中的空电文
 * flag=all时，会清除电文中所有为空的数据（包括未输入的格子和空字符 ""），并重新整理下标，形成连续的电文）
 * flag=tail时，会清除电文尾部的空字符（""）电文，但不会改变数据下标
 * flag=head时，会清除电文起始部分的空字符（""）电文，会将后续电文前移，数据下标会改变
 */
export const trim = (
  data: McTelegramHash,
  flag: "head" | "tail" | "all" = "tail"
): McTelegramHash => {
  const next: McTelegramHash = {};
  let idx = 0;
  if (flag === "all") {
    const maxIdx = max(data);
    for (let i = 0; i <= maxIdx; i++) {
      const v = data[i];
      if (v && v.value && v.value !== "") {
        next[idx++] = v;
      }
    }
    return next;
  }
  if (flag === "head") {
    const minIdx = min(data);
    each(data, (k, v) => {
      const ix = parseInt(k);
      next[ix - minIdx] = v;
    });
    return next;
  }
  if (flag === "tail") {
    const maxIdx = max(data);
    for (let i = maxIdx; i >= 0; i--) {
      const v = data[i];
      if (v && v.value && v.value === "") {
        data[i] = undefined;
        delete data[i];
        continue;
      } else if (v && v.value !== "") {
        break;
      }
    }
    return data;
  }
  return data;
};

/** 拼接成字符串 */
export const join = (data: McTelegramHash, char = ""): string => {
  return Object.keys(data)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(x => value(data[x]))
    .join(char);
};

/** 去除BODY中的无效报文 */
export const correctBody = (data: McTelegramHash): McTelegramHash => {
  const newData: McTelegramHash = {};
  data &&
    Object.keys(data).map(key => {
      try {
        const idx = parseInt(key);
        if (idx >= 0) {
          newData[key] = data[key];
        }
      } catch (e) {
        console.log("报文内容错误-索引不是整数：", key);
      }
      return key;
    });

  return newData;
};

/** 电文数组索引转电文位置(xPyW) */
export const position = (index: number): string => {
  const start = index === -1 ? 0 : index;
  const page = Math.ceil((start + 1) / 100);
  const position = (start + 1) % 100 === 0 ? 100 : (start + 1) % 100;
  return `${page}P${position}W`;
};

export const empty = (data: McTelegramHash): boolean => join(data) === "";
export const value = (data: McTelegramWord | undefined) => (data ? data.value : "");
