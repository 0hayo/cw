import { startsWith, unset } from "lodash";

export interface Bus {
  on: (name: string, callback: (...args: any) => void) => () => void;
  off: (name: string, callback: (...args: any) => void) => void;
  emit: (name: string, ...args: any) => void;
  dump: () => void;
  remove: (uuid: string) => void;
}

const make = (): Bus => {
  const hash: {
    [key: string]: Array<(...args: any) => void>;
  } = {};

  const on = (name: string, callback: (...args: any) => void): (() => void) => {
    const queue = hash[name] || [];
    if (!hash[name]) {
      hash[name] = [...queue, callback];
    }
    return () => off(name, callback);
  };

  const off = (name: string, callback: (...args: any) => void) => {
    const queue = hash[name] || [];
    hash[name] = queue.filter(it => it !== callback);
  };

  const remove = (prefix: string) => {
    Object.keys(hash).map(it => {
      if (startsWith(it, prefix)) {
        unset(hash, it);
      }
      return it;
    });
  };

  const dump = () => {
    console.debug("BUS>>>>>>>>>>", hash);
  };

  const emit = (name: string, ...args: any) => {
    const queue = hash[name] || [];
    queue.forEach(fn => fn(...args));
  };

  return {
    on,
    off,
    emit,
    dump,
    remove,
  };
};

export default make;
