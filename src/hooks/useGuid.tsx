import guid from "misc/guid";
import { useState } from "react";

const useGuid = (): string => {
  const [uid] = useState(guid());
  return uid;
};

export default useGuid;
