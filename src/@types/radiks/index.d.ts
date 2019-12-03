declare module 'radiks' {
  import { UserSession } from 'blockstack'

  export function configure(newConfig: Config): void

  type Config = {
    apiServer: string;
    userSession: any;
  }
}
