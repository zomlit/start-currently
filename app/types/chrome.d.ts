declare namespace chrome {
  export namespace runtime {
    export interface MessageSender {
      id?: string;
      tab?: chrome.tabs.Tab;
      frameId?: number;
      url?: string;
      origin?: string;
    }

    export interface LastError {
      message: string;
    }

    export const lastError: LastError | undefined;

    export function sendMessage(
      extensionId: string,
      message: any,
      callback?: (response: any) => void
    ): void;

    export const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void
      ): void;
      removeListener(callback: Function): void;
    };
  }
}

declare global {
  interface Window {
    chrome?: typeof chrome;
  }
}

export {};
