declare module 'radiks' {
  import { UserSession } from 'blockstack'

  export function configure(newConfig: Config): void
  export function getConfig(): Config;

  type Config = {
    apiServer: string;
    userSession: any;
  }

  type Schema = {
    [key: string]: SchemaAttribute | string | Record<string, any> | any[] | number | boolean;
  }

  type SchemaAttribute = {
    type: string | Record<string, any> | any[] | number | boolean;
    decrypted?: boolean;
  }

  class User {
    className: string;
    schema: Schema;
    static createWithCurrentUser(): Promise<Error> | Promise<User>
  }

  class Model {
    static schema: Schema;
    static defaults: any = {};
    static className?: string;
    static emitter?: EventEmitter;
    schema: Schema;
  }
}
