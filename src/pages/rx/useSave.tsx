// import fse from "misc/fse";
import { IForm, setter } from "./typing";
import message from "misc/message";
import xcode from "services/xcode";
import xmeta from "services/xmeta";
import xcopy from "services/xcopy";
import xchat from "services/xchat";
import { useCallback, useMemo } from "react";
import xsession from "services/xsession";
import xregular from "services/xregular";
import xdatagram from "services/xdatagram";
import cwIForm from "pages/cw/form";
import fetch from "utils/fetch";
import { getAppType, getControlRadio, LOCAL_MACHINE_ID } from "misc/env";
import moment from "moment";
import { useLocation } from "react-router";
import qs from "query-string";
import { each } from "misc/telegram";
// import guid from "misc/guid";

const useSave = (
  setForm: setter
): ((form: IForm, onSuccess: VoidFunction, cwForm?: cwIForm) => void) => {
  const location = useLocation();
  const search = useMemo(() => qs.parse(location.search), [location.search]);
  const datagramDraftUuid = search.datagramDraftUuid as string;
  const taskUuid = search.taskUuid ? search.taskUuid : null;
  // const retpath = search.retpath  ? (search.retpath as string) : "";
  // const history = useHistory();
  // const history = useHistory();
  // alert(location.search);
  const handler = useCallback(
    async (form: IForm, onSuccess: VoidFunction, cwForm?: cwIForm) => {
      // const error = validate(form);
      // if (error) {
      //   message.failure(error);
      //   return;
      // }
      const { radioUuid } =
        getAppType() === "control" ? getControlRadio() : { radioUuid: LOCAL_MACHINE_ID };

      try {
        // alert(form.dir);
        // await fse.ensure(form.dir);
        const now = new Date().toISOString();
        // code
        // await xcode.save(form.dir, {
        //   head: form.head,
        //   body: form.body,
        // });
        // alert(datagramDraftUuid);
        // alert(form.dir);
        const uuid = datagramDraftUuid
          ? datagramDraftUuid
          : form.dir.indexOf("files") > 0
          ? form.dir.substring(form.dir.lastIndexOf("files") + 11)
          : form.dir;
        // alert(datagramDraftUuid);
        // const uuid = datagramDraftUuid ? datagramDraftUuid : guid();
        // alert("uuid=" + uuid);
        setForm(x => ({ ...x, dir: uuid }));
        // alert(form.name);
        await xdatagram.saveServer(uuid, radioUuid, form.name, 2, true, form.state, "M", 0);

        //更新报底CODE，去除校报痕迹
        const newHead = { ...form.regular.head };
        const newBody = { ...form.regular.body };
        each(newHead, (k, v) => {
          v.crude = v.value;
        });
        each(newBody, (k, v) => {
          v.crude = v.value;
        });
        await xcode.saveServer(uuid, {
          head: form.regular.head,
          body: form.regular.body,
        });
        // alert(uuid);
        // await xcode.saveRecordServer(
        //   uuid,
        //   uuid,
        //   {
        //     head: form.head,
        //     body: form.body,
        //   },
        //   {
        //     from: "recv",
        //     type: form.type,
        //     name: form.name,
        //     state: form.state,
        //     stime: form.date || now,
        //   },
        //   cwForm,
        //   "CWR"
        // );

        // regular(整报结果)
        // await xregular.save(form.dir, {
        await xregular.saveServer(uuid, {
          head: form.regular.head,
          body: form.regular.body,
        });
        // meta
        // await xmeta.save(form.dir, {
        await xmeta.saveServer(uuid, {
          from: "recv",
          type: form.type,
          name: form.name,
          state: form.state,
          stime: form.date || now,
        });
        // copy
        // await xcopy.save(form.dir, {
        await xcopy.saveServer(uuid, {
          a: {
            head: form.a.head,
            body: form.a.body,
          },
          b: {
            head: form.b.head,
            body: form.b.body,
          },
        });
        // chat
        // await xchat.save(form.dir, form.messages);
        await xchat.saveServer(uuid, form.messages);
        // session
        if (form.session) {
          // await xsession.save(form.dir, form.session);
          await xsession.saveServer(uuid, form.session);
        }
        const _taskId = taskUuid || form.taskid;
        if (_taskId) {
          // alert(form.date);
          const param = {
            datagrams: [
              {
                title: "临时任务",
                type: "2",
                uuid: uuid,
              },
            ],
            id: taskUuid,
            contactTableId: form.contactTableId,
            type: "2",
            updatedAt: moment(form.date).format("YYYY-MM-DD HH:mm:ss") + "",
            // startTime: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + "",
          };
          await fetch.put<ManageResponse>("/sysTask/update", JSON.stringify(param));

          // await fetch.put<MstResponse>("/sysTask/complete/" + radioUuid + "/" + taskUuid);
          await fetch.put<MstResponse>(`/sysTask/complete/${taskUuid}?radioUuid=${radioUuid}`);
        } else {
          // alert(form.contactTableId);
          const param = {
            datagrams: [
              {
                title: "临时任务",
                type: "2",
                state: form.state,
                uuid: uuid,
              },
            ],
            name: moment(Date.now()).format("YYYY年MM月DD日") + "接收任务",
            contactTableId: form.contactTableId,
            type: "2",
            updatedAt: moment(form.date).format("YYYY-MM-DD HH:mm:ss") + "",
            startTime: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss") + "",
          };
          const { data } = await fetch.post<ManageResponse>(
            "/sysTask/insert",
            JSON.stringify(param)
          );

          setForm(x => ({ ...x, taskid: data.data?.id }));

          //更新接收状态
          // await fetch.put<MstResponse>("/sysTask/complete/" + radioUuid + "/" + data.data.id);
          await fetch.put<MstResponse>(`/sysTask/complete/${data.data.id}?radioUuid=${radioUuid}`);
        }

        // success
        // alert(2);
        // history.push("/home");
        setForm(x => ({
          ...x,
          saved: true,
        }));
        onSuccess();
      } catch (ex) {
        message.failure("保存收报错误", ex.message || ex.toString());
      }
    },
    [datagramDraftUuid, taskUuid, setForm]
  );

  return handler;
};

export default useSave;
