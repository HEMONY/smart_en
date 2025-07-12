// types/telegram.d.ts
declare global {
  interface Window {
    Telegram: {
      Login: {
        auth: (options: {
          bot_id: string;
          request_access?: boolean;
        }, callback: (data: any) => void) => void;
      };
    };
  }
}

export {};
