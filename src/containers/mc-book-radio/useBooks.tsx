import { useEffect } from "react";
import message from "misc/message";
import useFetch from "hooks/useFetch";
import McCodebookService from "services/codebook-service";

const useBooks = () => {
  const [request, response, , ex] = useFetch<McFolderMeta[]>(
    McCodebookService.getCodebookList,
    []
  );
  useEffect(() => {
    request();
  }, [request]);

  useEffect(() => {
    if (ex) {
      message.failure("发生错误", ex.message || ex.toString());
    }
  }, [ex]);

  return response;
};

export default useBooks;
