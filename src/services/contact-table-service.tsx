import fetch from "utils/fetch";
import { isNumber, trim } from "lodash";

/**
 * 联络文件表接口服务
 */
const ContactTableService = {
  /**
   * 获取所有联络文件表信息
   * @returns
   */
  getAllContactTables: async (): Promise<ISysContactTable[]> => {
    const response = await fetch.get("sysContactTable/list");
    const data: ISysContactTable[] = response.data;
    return data;
  },

  getContactTable: async (contactTableId: string): Promise<ISysContactTable> => {
    const result = await fetch.get(`sysContactTable/get/${contactTableId}`);
    return result.data.data;
  },

  /** 获取指定联络文件表下所有台站信息 */
  getContactStations: async (contactTableId: string): Promise<ITelegramCode[]> => {
    const result = await fetch.get(`/sysTelegramCode/telegram_code/${contactTableId}`);
    return result.data.data;
  },

  /** 获取指定联络文件表中本台信息 */
  getOwnStationInfo: async (contactTableId: string): Promise<ITelegramCode> => {
    const result = await fetch.get(`/sysTelegramCode/telegram_code/${contactTableId}`);
    if (result.data.data) {
      return result.data.data.find(x => x.nativeFlag === "0");
    }
    return null;
  },

  getMaskCodeList: async (contactTableId: number): Promise<IMaskCode[]> => {
    const response = await fetch.get(`sysMaskCode/contact_table/${contactTableId}`);
    const data: IMaskCode[] = response.data?.data;
    return data;
  },

  /** 将真码字符串转换为伪码字符串 */
  translateToMaskCode: (maskCodeList: IMaskCode[], realCode: string): IMaskCodeTransResult => {
    if (!maskCodeList || maskCodeList.length === 0) {
      return {
        success: false,
        error: "真伪码转换表为空或未设置",
        realCode: realCode,
        maskCode: "",
      };
    }
    //将真伪码转换表转为MAP结构
    const codeMap = {};
    maskCodeList.map(m => (codeMap[m.realCode] = m.pseudocode));

    //真码为空则原样返回
    if (!trim(realCode)) {
      return { success: true, realCode: realCode, maskCode: realCode };
    }

    const trainedChars: string[] = [];
    const originChars: string[] = realCode.split("");
    originChars.map(c => {
      if (parseInt(c)) {
        const maskChar = codeMap[c];
        if (!maskChar) {
          return {
            success: false,
            error: `真码'${c}' 没有对应的伪码`,
            realCode: realCode,
            maskCode: "",
          };
        }
        trainedChars.push(maskChar);
      } else {
        trainedChars.push(c);
      }
      return c;
    });
    const trainedStr = trainedChars.join("");
    return { success: true, realCode: realCode, maskCode: trainedStr };
  },

  /** 将伪码字符串转换为真码字符串 */
  translateToRealCode: (maskCodeList: IMaskCode[], maskCode: string): IMaskCodeTransResult => {
    if (!maskCodeList || maskCodeList.length === 0) {
      return {
        success: false,
        error: "真伪码转换表为空或未设置",
        realCode: "",
        maskCode: maskCode,
      };
    }
    //将真伪码转换表转为MAP结构
    const codeMap = {};
    maskCodeList.map(m => (codeMap[m.pseudocode] = m.realCode));

    //伪码为空则原样返回
    if (!trim(maskCode)) {
      return { success: true, realCode: maskCode, maskCode: maskCode };
    }

    const trainedChars: string[] = [];
    const originChars: string[] = maskCode.split("");
    originChars.map(c => {
      if (isNumber(c)) {
        const realChar = codeMap[c];
        if (!realChar) {
          return {
            success: false,
            error: `伪码'${c}'没有对应的真码`,
            realCode: "",
            maskCode: maskCode,
          };
        }
        trainedChars.push(realChar);
      } else {
        trainedChars.push(c);
      }
      return c;
    });
    const trainedStr = trainedChars.join("");
    return { success: true, realCode: trainedStr, maskCode: maskCode };
  },
};

export default ContactTableService;
