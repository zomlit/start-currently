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
      message: any,
      responseCallback?: (response: any) => void
    ): void;
    export function sendMessage(
      extensionId: string,
      message: any,
      responseCallback?: (response: any) => void
    ): void;

    export const onMessage: {
      addListener: (
        callback: (
          message: any,
          sender: MessageSender,
          sendResponse: (response?: any) => void
        ) => void
      ) => void;
      removeListener: (callback: Function) => void;
    };

    export const id: string;
  }

  export namespace tabs {
    export interface Tab {
      id?: number;
      url?: string;
    }

    export function query(queryInfo: {
      active?: boolean;
      url?: string | string[];
    }): Promise<Tab[]>;

    export function sendMessage(
      tabId: number,
      message: any,
      options?: any
    ): Promise<any>;
  }
}

declare global {
  interface Window {
    chrome?: typeof chrome;
  }
}

export { chrome };
