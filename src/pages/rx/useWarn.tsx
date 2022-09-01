import { maxWarnCount } from "misc/env";
import { each, keys, size } from "misc/telegram";
import { useCallback, Dispatch, SetStateAction } from "react";
import { isEmpty, min, unset } from "lodash";
import { IForm } from "./typing";

const regexp = /^\d*$/;

const useWarn = (
  setForm: Dispatch<SetStateAction<IForm>>
): ((head: McTelegramHash, body: McTelegramHash) => boolean) => {
  const getPoorRatios = (word: McTelegramWord, role: string): number[] => {
    //值为空的优先处理
    // console.log("word=", word);
    if (!word.value || word.value === "") {
      return [-1000, -1000, -1000, -1000, -1000, -1000];
    }
    //不是数字的次优先处理
    if (role === "body" && !regexp.test(word.value)) {
      return new Array(word.value.length).fill(-1000);
    }
    //长度不为4的再其次
    if (role === "body" && word.value.length !== 4) {
      return new Array(word.value.length).fill(-500);
    }

    // const ratio = word.ratio;
    // const poorRatios = ratio ? ratio.filter(x => x <= ratioWarnThreshold) : [];
    return [];
  };

  /** 标记电文中信号概率(ratio)低于设定阈值的电文的警告标记，
   * 1.最多标记“maxWarnCount”个电文
   * 2.warn被标记为true的电文在UI上会用特定背景色高亮显示
   * 3.修改过的电文不会被标记
   * 如果有电文被标记，则返回true，否则返回false
   */
  const markWarn = useCallback((head: McTelegramHash, body: McTelegramHash): boolean => {
    const worst: McTelegramHash = {}; //用于记录信号最差的几组电文

    const compare = (hash: McTelegramHash, role: string, avg: number) => {
      each(hash, (k, v) => {
        v.warn = false; //先把所有的电文都重置为不警告
        //以平均概率为基准，重新计算所有概率
        if (v.ratio) {
          const newRatios: number[] = [];
          for (let r of v.ratio) {
            let newRatio = (r * 100) / (avg * 0.8);
            newRatio = newRatio > 100 ? 100 : newRatio;
            newRatios.push(newRatio);
          }
          v.ratio = newRatios;
        }
        const poorRatios = getPoorRatios(v, role);
        const modified = v.value !== v.crude;
        if (!isEmpty(poorRatios) && !modified) {
          //未达到数量限制，直接记录下来
          if (size(worst) < maxWarnCount) {
            worst[k] = v;
            return;
          }
          const better: string[] = []; //用于记录比较之下概率稍“好”一点的
          each(worst, (kw, vw) => {
            const xPoor: number[] = getPoorRatios(vw, role);
            if (xPoor.length < poorRatios.length) {
              better.push(kw);
            } else if (xPoor.length === poorRatios.length) {
              if (min(xPoor)! > min(poorRatios)!) {
                better.push(kw);
              }
            }
          }); //end each
          if (better.length > 0) {
            //移除已存在的worst[key](只移除第一个即可)
            const key = better[0];
            unset(worst, key);
            //将ratio更差的报文组放进去
            worst[k] = v;
          }
        }
      });
    };

    /**
     * 计算平均概率
     */
    let sum: number = 0;
    let count: number = 0;
    each(head, (k, v) => {
      if (v.ratio) {
        for (let r of v.ratio) {
          sum += r;
          count++;
        }
      }
      return v;
    });
    each(body, (k, v) => {
      if (v.ratio) {
        for (let r of v.ratio) {
          sum += r;
          count++;
        }
      }
      return v;
    });
    const avg: number = sum / count;
    // console.log("----------avg ratio is:", avg);

    compare(head, "head", avg);
    compare(body, "body", avg);
    const worstKeys = keys(worst);
    let hasWarn = false;
    if (worstKeys.length > 0) {
      hasWarn = true;
      each(head, (k, v) => {
        if (worstKeys.some(x => x === k)) {
          head[k] = { ...head[k], value: v.value, warn: true };
        }
      });
      each(body, (k, v) => {
        if (worstKeys.some(x => x === k)) {
          body[k] = { ...body[k], value: v.value, warn: true };
        }
      });
    }
    // setForm(x => ({
    //   ...x,
    //   ui: {
    //     ...x.ui,
    //     warn: hasWarn,
    //   },
    // }));
    return hasWarn;
  }, []);

  return markWarn;
};

export default useWarn;
