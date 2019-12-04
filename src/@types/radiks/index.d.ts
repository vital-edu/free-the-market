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

  interface Attrs {
    createdAt?: number,
    updatedAt?: number,
    signingKeyId?: string,
    _id?: string
    [key: string]: any,
  }

  class User {
    className: string;
    schema: Schema;
    static createWithCurrentUser(): Promise<Error> | Promise<User>
  }

  class AttrsWithId extends Attr {
    _id: string
  }
  class Model {
    public static schema: Schema;
    public static defaults: any = {};
    public static className?: string;
    public static emitter?: EventEmitter;
    schema: Schema;
    _id: string;
    attrs: Attrs;

    static fromSchema(schema: Schema): Model;

    static async fetchList<T extends Model>(
      _selector: FindQuery = {},
      { decrypt = true }: FetchOptions = {},
    ): T[];

    static async findOne<T extends Model>(
      _selector: FindQuery = {},
      options: FetchOptions = { decrypt: true },
    ): T;

    static async findById<T extends Model>(
      _id: string,
      fetchOptions?: Record<string, any>,
    ): Promise<Model | undefined>;

    static async count(_selector: FindQuery = {}): Promise<number>;

    static fetchOwnList(_selector: FindQuery = {}): Promise<Model[]>;

    constructor(attrs: Attrs = {}): Model;

    async save(): Promise<Model> | Promise<Error>;


    encrypted(): AttrsWithId;

    saveFile(encrypted: Record<string, any>): Promise<string>;

    deleteFile(): Promise<void>;

    blockstackPath(): string;

    async fetch({ decrypt = true } = {}): Promise<Model | undefined>;

    async decrypt(): Model;

    update(attrs: Attrs): void;

    async sign(): Promise<Model>;

    getSigningKey(): { _id: string, privateKey: string };

    async encryptionPublicKey(): string;

    encryptionPrivateKey(): string;

    static modelName(): string;

    modelName(): string;

    isOwnedByUser(): boolean;

    static(_this: Model, [event]): void;

    static addStreamListener(callback: () => void): void;

    static removeStreamListener(callback: () => void): void;
    async destroy(): Promise<boolean>;

    // @abstract
    beforeSave(): void;

    // @abstract
    afterFetch(): void;
  }
}
