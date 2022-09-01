export const focus = (id: string): void => {
  const dom = document.getElementById(id);
  if (dom) {
    dom.focus();
  }
};

export const value = (id: string): string => {
  const dom = document.getElementById(id);
  if (dom && dom instanceof HTMLInputElement) {
    return dom.value;
  }
  return "";
};

export const clean = (id: string): void => {
  const dom = document.getElementById(id);
  if (dom && dom instanceof HTMLInputElement) {
    dom.value = undefined;
  }
};
