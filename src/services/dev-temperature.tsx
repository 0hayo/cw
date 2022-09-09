import fetch from "utils/fetch";

const getTemperature = async () => {
  let { data } = await fetch.get<MstResponse>("/sysRadio/getTemperature");
  return data;
};

export default getTemperature;