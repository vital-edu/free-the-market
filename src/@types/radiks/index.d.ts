declare module 'radiks' {
  import { UserSession } from 'blockstack'

  function configure(newConfig: Config): void
  function getConfig(): Config;

  type Config = {
    apiServer: string;
    userSession: UserSession;
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

  class User extends Model {
    className: string;
    static schema: Schema = {
      username: {
        type: String,
        decrypted,
      },
      publicKey: {
        type: String,
        decrypted,
      },
      profile: {
        type: String,
        decrypted,
      },
      personalSigningKeyId: String,
    };
    static createWithCurrentUser(): Promise<Error> | Promise<User>;
    static currentUser(): User;
    async createSigningKey(): Promise<string>;
    static createWithCurrentUser(): Promise<Error> | Promise<void>;
    async sign(): Promise<User>;
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
    ): Promise<T[]>;
    static async findOne<T extends Model>(
      _selector: FindQuery = {},
      options: FetchOptions = { decrypt: true },
    ): Promise<T>;
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
    async decrypt(): Promise<Model>;
    update(attrs: Attrs): void;
    async sign(): Promise<Model>;
    getSigningKey(): { _id: string, privateKey: string };
    async encryptionPublicKey(): Promise<string>;
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
