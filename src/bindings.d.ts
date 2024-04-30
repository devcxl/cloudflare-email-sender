export type Bindings = {
  ACCESS_TOKEN: string;
  SENDER_EMAIL: string;
  SENDER_NAME : string;
};

declare global {
  function getMiniflareBindings(): Bindings;
}
