import fetch from "utils/fetch";

let dictionary: Dictionary = {};

const DictionaryService = {
  load: async (): Promise<Dictionary> => {
    dictionary = {};
    const { data } = await fetch.get("/dict/getAllDict");
    const result = data.data;
    result &&
      result.map(it => {
        const dictList = it.dictDataList;
        const dictItems: DictionaryItem[] = [];
        dictList &&
          dictList.map(x => {
            const dictItem: DictionaryItem = {
              uuid: x.uuid,
              type: it.type,
              title: x.title,
              value: x.value,
              sort: x.sortOrder,
              status: x.status,
              delete: x.delFlag,
              desc: x.description,
            };
            dictItems.push(dictItem);
            return x;
          });
        dictionary[it.type] = dictItems;
        return it;
      });
    console.debug("loaded all dictionary=======:", dictionary);
    return dictionary;
  },

  getTitle: (type: string, code: string): string => {
    const _code = code + "";
    const dictList = dictionary[type];
    let title = "";
    if (!dictList) return "";
    dictList.map(it => {
      if (it.value === _code) {
        title = it.title;
      }
      return it;
    });
    return title;
  },

  getDesc: (type: string, code: string): string => {
    const _code = code + "";
    const dictList = dictionary[type];
    let desc = "";
    if (!dictList) return "";
    dictList.map(it => {
      if (it.value === _code) {
        desc = it.desc;
      }
      return it;
    });
    return desc;
  },

  getDictItems: (type: string): DictionaryItem[] => {
    return dictionary[type];
  },
};

export default DictionaryService;

DictionaryService.load();
