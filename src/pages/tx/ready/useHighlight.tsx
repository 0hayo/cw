import { IForm } from "./typing";
import { Dispatch, useCallback, SetStateAction } from "react";
import { index2field } from "misc/util";

const regexp = /^\d{4}$/;

const useHighlight = (
  setForm: Dispatch<SetStateAction<IForm>>
): ((text: string, count: number, offset: number) => void) => {
  const highlight = useCallback(
    (text: string, count: number, offset: number) => {
      if (text.indexOf("IEC") > 0 && text.length < 20) {
        return;
      }
      if (text.indexOf("WK") > 0 && text.indexOf("NR") > 0) {
        return;
      }
      const sent = text.replace("P *", "P*").substr(0, count);
      const array = sent.split(" ");
      console.log(array);
      /** 表示当前正在发送的单词或某组 */
      const len = array.length;
      let role: "head" | "body" = "head";
      /** 正在发送的单词或组在电文中的域位置 */
      let field = "";
      /** 正在发送的单词或组在电文中的索引位置 */
      let index = -1;
      setForm(form => {
        //从后往前，依次判断：body(*), 表头内容(RMKS, CK, NR)
        let charIdx = "*";
        // if (sent.indexOf("P") >= 0 && text.indexOf("RPT")<0 && text.indexOf("GA")<0 ) {
        if (sent.indexOf("P*") >= 0) {
          if (sent.indexOf("1P") >= 0) {
            charIdx = "1P*";
          }
          if (sent.indexOf("2P") >= 0) {
            charIdx = "2P*";
          }
          if (sent.indexOf("3P") >= 0) {
            charIdx = "3P*";
          }
          for (let i = 1; i < 500; i++) {
            if (sent.indexOf(i + "P") >= 0) {
              charIdx = i + "P*";
            }
          }

          // if (sent.indexOf(";") > 0) {
          //     let idx1 = sent.lastIndexOf("P*");
          //     let idx2 = sent.lastIndexOf(";");
          //     if (idx1 > idx2) {
          //         charIdx = sent.substr(idx2 + 2, idx1 - idx2);
          //     }
          //
          //
          // } else {
          //     let idx1 = sent.lastIndexOf("P*");
          //     // const  t1 = sent.substr(0,idx1);
          //     let idx2 = sent.lastIndexOf(" ", idx1);
          //     charIdx = sent.substr(idx2 + 1, idx1 - idx2 + 1);
          // }
          // console.log("charIdx", charIdx);
        }
        console.log("charIdx11", charIdx);
        const charx = charIdx;
        // console.log("array:", array);
        if (array.indexOf(charx) >= 0) {
          //遇到第一个*表示正文开始
          role = "body";
          // const anchor = array.indexOf(charIdx) + 2; //第一个*出现的位置
          // const anchor = charIdx === charIdx ? array.indexOf(charIdx) + 1 : array.indexOf(charIdx); //第一个*出现的位置
          // const anchor = charIdx === charIdx ? array.indexOf(charIdx) + 1 : array.indexOf(charIdx); //第一个*出现的位置
          // const anchor = array.indexOf(charx) + 1;
          const anchor = array.indexOf(charx);
          console.log("charIdx22", anchor);
          //从发送字符串（数组）中提取所有已发送完成的电报正文（ regex = /^\d{4}$/ ）
          //用以判断现在发送到哪一组
          const codes = array.filter((it, i) => regexp.test(it) && i > anchor);
          const clen = codes.length;
          // console.log("charIdx33", codes,clen);
          if (clen >= 0) {
            index = clen - 1 + offset;
            // index = clen + offset;

            console.log("indexindexindex", index);
            // for (let i = 0; i < 100; i++) {
            // if (array.length < 110 && !form.autoFlag) {
            //   // index = index;
            //
            // } else
            // alert(form.autoFlag);
            // if (form.autoFlag === 1)
            let n1 = 1;
            let nn1 = 0;
            // {
            for (let i = 1; i < 500; i++) {
              if (sent.indexOf(i + "P*") >= 0) {
                // idxPage = 2;
                // index = (text.length <= 512 && text.indexOf("NR")<0) || form.autoFlag === 0 ? index : index + (i - 1) * 100;
                // index = (text.length <= 512) && form.autoFlag === 0 ? index : index + (i - 1) * 100;
                // index = index + i * 100;
                n1 = i;

                // if (text.indexOf("RPT") > 0 && text.indexOf("GA") > 0) {
                //   index = index - offset;
                // }
                // if (text.indexOf("MSG") > 0 && text.indexOf("GA") > 0) {
                //   index = index - offset;
                // }
              }
            }

            // if (sent.indexOf("P*") > 0) {
            //     let regex = new RegExp("P", "g"); // 使用g表示整个字符串都要匹配
            //     let result = sent.match(regex);          //match方法可在字符串内检索指定的值，或找到一个或多个正则表达式的匹配。
            //     n1 = !result ? 0 : result.length;
            //     console.log("n1", n1);
            //     // n1 = parseInt(charx.replace("P*", ""));
            // }
            // }

            // console.log("nn1=",nn1);
            // console.log("indexOf2=",index);
            let ipn = 0;
            for (let i = 1; i < 500; i++) {
              if (sent.indexOf(i + "P") >= 0) {
                // if (nn1 >= 2)
                // {
                ipn = i;
                // break;
                // }
              }
            }
            console.log("ipn=", ipn);
            if (n1 !== 1) {
              if (form.autoFlag === 0) {
                let num = 0;
                for (let i = 1; i < 500; i++) {
                  if (sent.indexOf(i + "P") >= 0) {
                    num = num + 1;
                    // if (nn1 >= 2)
                    // {
                    // nn1 = nn1 + 1;
                    nn1 = i;
                    // }
                  }
                }
                // nn1 = num;
                console.log("index111:", index);
                console.log("offset:", offset);
                if (text.indexOf("RPT") > 0 && text.indexOf("GA") > 0) {
                  index = index + (ipn - 2 + nn1) * 100 - offset + 1;
                } else if (text.indexOf("MSG") > 0 && text.indexOf("GA") > 0) {
                  index = index + (ipn + (nn1 - 2)) * 100 - offset + 1;
                } else {
                  index = index + (nn1 - 1) * 100 - offset;
                  // index = index - offset;
                  // index = index ;
                }
                console.log("index222:", index);
                // if (text.length > 512)
                // {
                //   index = index + (n1 - 1) * 100;
                // }
              } else {
                // if(text.length > 512)
                // {
                index = index + (n1 - 1) * 100;
                // }
                // else
                // {
                //
                // }
              }
              // index =  (form.autoFlag === 0) || text.length <= 512 ? index : index + (n1 - 1) * 100;
            }

            // index = text.length <= 512 || text.indexOf("NR") > 0 ? index : index + (n1 - 1) * 100;

            // index = (text.length <= 512) && form.autoFlag === 0 ? index : index + (n1 - 1) * 100;

            if (form.head["CK"].value === index + "") {
              index = index - 1;
            }
            // console.log("array:", form.head["CK"].value);
            // console.log("index:", index);
            if (index === 499) {
              // index = 401;
            }
            // console.log("array:", form.head["CK"].value);
            // console.log("index:", index);
            field = index2field(index, form.type, role);
            console.log("field:", field);
          }
        } else if (array.indexOf("RMKS") >= 0) {
          const anchor = array.indexOf("RMKS");
          if (len > anchor) {
            field = "RMKS";
          }
        } else if (array.indexOf("CK") >= 0) {
          const anchor = array.indexOf("CK");
          if (len - anchor > 5) {
            field = "TIME";
          } else if (len - anchor > 4) {
            field = "DATE";
          } else if (len - anchor > 3) {
            field = "CLS";
          } else if (len - anchor >= 2) {
            field = "CK";
          }
          // form.type
        } else if (array.indexOf("NR") >= 0) {
          const anchor = array.indexOf("NR");
          if (form.type !== "EX") {
            if (len >= anchor) {
              field = "NR";
            }
          } else {
            if (len - anchor > 2) {
              field = "TIME";
            } else if (len >= anchor) {
              field = "NR";
            }
          }
        }
        //重发部分报头
        else if (array.indexOf("TIME") >= 0) {
          const anchor = array.indexOf("TIME");
          if (len >= anchor) {
            field = "TIME";
          }
        } else if (array.indexOf("DATE") >= 0) {
          const anchor = array.indexOf("DATE");
          if (len >= anchor) {
            field = "DATE";
          }
        } else if (array.indexOf("CLS") >= 0) {
          const anchor = array.indexOf("CLS");
          if (len >= anchor) {
            field = "CLS";
          }
        }
        form[role][field] = {
          ...form[role][field],
          value: form[role][field]?.value!,
          state:
            form[role][field]?.state === "none" || !form[role][field]?.state
              ? "pass"
              : form[role][field]?.state,
        };
        // let nowPage = 1;
        if (role === "body" && form.ui.autoPage && index > 0) {
          // const hlightPage = Math.ceil(index / 100);

          let idxPage = 1;

          for (let i = 1; i < 500; i++) {
            if (sent.indexOf(i + "P") >= 0) {
              // idxPage = 2;
              idxPage = i;
              // nowPage = i;
            }
          }

          // if (sent.indexOf("1P") >= 0) {
          //   idxPage = 1;
          // }
          // if (sent.indexOf("2P") >= 0) {
          //   idxPage = 2;
          //   // index = index + 100;
          // }
          // if (sent.indexOf("3P") >= 0) {
          //   idxPage = 3;
          //   index = index + 200;
          // }
          const hlightPage = idxPage;
          if (hlightPage !== form.page) {
            form.page = hlightPage;
          }
        }
        return { ...form };
      });
    },
    [setForm]
  );

  return highlight;
};

export default useHighlight;
