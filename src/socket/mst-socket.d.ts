interface MstSocket {
  send: (cmd: Command) => void;
  register: (uuid: string) => void;
  unregister: (uuid: string) => void;
  connect: () => void;
}
