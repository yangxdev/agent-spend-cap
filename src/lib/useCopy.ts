import { useRef, useState, type RefObject } from 'react';

export interface CopyApi {
  status: string;
  copy: (text: string, done: string) => Promise<void>;
  preRef: RefObject<HTMLPreElement | null>;
}

/** Clipboard writes with a status line. When the clipboard is unavailable, the text in `preRef` is selected instead. */
export function useCopy(): CopyApi {
  const [status, setStatus] = useState('');
  const preRef = useRef<HTMLPreElement>(null);

  function selectText() {
    const pre = preRef.current;
    if (!pre) return;
    const range = document.createRange();
    range.selectNodeContents(pre);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  async function copy(text: string, done: string) {
    try {
      await navigator.clipboard.writeText(text);
      setStatus(done);
    } catch {
      selectText();
      setStatus('Clipboard unavailable. The text is selected: press Ctrl+C or Cmd+C.');
    }
  }

  return { status, copy, preRef };
}
