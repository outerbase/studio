interface KeyMatcherProps {
  ctrl?: boolean;
  key?: string;
  shift?: boolean;
}

export default class KeyMatcher {
  protected key: KeyMatcherProps;

  constructor(props: KeyMatcherProps) {
    this.key = props;
  }

  static capture(e: KeyboardEvent | React.KeyboardEvent) {
    const isCtrlKey = e.ctrlKey || e.metaKey;

    let key: string | undefined = e.key;

    if (key === "Shift") key = undefined;
    if (key === "Control") key = undefined;

    return new KeyMatcher({
      ctrl: isCtrlKey,
      shift: e.shiftKey,
      key,
    });
  }

  match(e: KeyboardEvent | React.KeyboardEvent<HTMLDivElement>) {
    let isMatched = true;
    const isCtrlKey = e.ctrlKey || e.metaKey;

    if (this.key.ctrl && !isCtrlKey) {
      isMatched = false;
    }

    if (this.key.key && e.key !== this.key.key) {
      isMatched = false;
    }

    if (this.key.shift && !e.shiftKey) {
      isMatched = false;
    }

    return isMatched;
  }

  toJson(): KeyMatcherProps {
    return { ...this.key };
  }

  toString() {
    const isMac = navigator.userAgent.toLowerCase().indexOf("mac") > -1;
    return [
      this.key.ctrl ? (isMac ? "⌘" : "Ctrl") : undefined,
      this.key.shift ? "Shift" : undefined,
      this.key?.key?.toUpperCase(),
    ]
      .filter(Boolean)
      .join(" + ");
  }

  toCodeMirrorKey() {
    const isMac = navigator.userAgent.toLowerCase().indexOf("mac") > -1;
    return [
      this.key.ctrl ? (isMac ? "Cmd" : "Ctrl") : undefined,
      this.key.shift ? "Shift" : undefined,
      this.key?.key,
    ]
      .filter(Boolean)
      .join("-");
  }
}

export const KEY_BINDING = {
  run: new KeyMatcher({ ctrl: true, key: "Enter" }),
  copy: new KeyMatcher({ ctrl: true, key: "c" }),
  paste: new KeyMatcher({ ctrl: true, key: "v" }),
  format: new KeyMatcher({ ctrl: true, shift: true, key: "i" }),
  commit: new KeyMatcher({ ctrl: true, key: "s" }),
  discard: new KeyMatcher({ ctrl: true, shift: true, key: "Delete" }),
};
