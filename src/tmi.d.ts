declare module 'tmi.js' {
  export interface Client {
    connect(): Promise<[string, number]>;
    disconnect(): Promise<[string, number]>;
    on(event: string, listener: Function): void;
  }

  export interface ClientOptions {
    channels: string[];
  }

  export default {
    Client: new (opts: ClientOptions) => Client
  };
}
