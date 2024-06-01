export type Bindings = {
  ACCESS_TOKEN: string;
  SENDER_EMAIL: string;
  SENDER_NAME : string;
  DKIM_DOMAIN: string;
  DKIM_SELECTOR:  string;
  DKIM_PRIVATE_KEY: string;
};

declare global {
  function getMiniflareBindings(): Bindings;
}
