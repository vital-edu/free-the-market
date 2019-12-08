declare module 'radiks' {
  import { UserData } from 'blockstack/lib/auth/authApp';
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
    _id?: string,
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
    ): Promise<T | undefined>;
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

  interface Member {
    username: string,
    inviteId: string
  }

  interface UserGroupAttrs extends Attrs {
    name?: string | any,
    gaiaConfig: Record<string, any> | any,
    members: any[] | any,
  }

  const defaultMembers: Member[] = [];

  class UserGroup extends Model {
    privateKey?: string;
    static schema: Schema = {
      name: String,
      gaiaConfig: Object,
      members: {
        type: Array,
      },
    }
    static defaults: {
      members: defaultMembers,
    }
    static async find(id: string): UserGroup
    async create(): UserGroup
    async makeGroupMembership(username: string): Promise<GroupInvitation>
    static myGroups(): Promise<List<UserGroup>>
    publicKey(): string
    async encryptionPublicKey(): string
    encryptionPrivateKey(): string
    static modelName(): 'UserGroup'
    getSigningKey() {
      const { userGroups, signingKeys } = userGroupKeys();
      const id = userGroups[this._id];
      const privateKey = signingKeys[id];
      return {
        privateKey,
        id,
      };
    }
  }

  interface GroupInvitationAttrs extends Attrs {
    userGroupId?: string | Record<string, any>,
    signingKeyPrivateKey?: string | Record<string, any>,
  }

  class GroupInvitation extends Model {
    static className = 'GroupInvitation';
    userPublicKey: string;
    static schema: Schema = {
      userGroupId: String,
      signingKeyPrivateKey: String,
      signingKeyId: String,
    }
    static defaults = {
      updatable: false,
    }
    static async makeInvitation(
      username: string,
      userGroup: UserGroup,
    ): GroupInvitation
    activate(): GroupMembership
    async encryptionPublicKey(): string
    encryptionPrivateKey(): string
  }

  interface UserGroupKeys {
    userGroups: {
      [userGroupId: string]: string,
    },
    signingKeys: {
      [signingKeyId: string]: string
    }
  }

  class GroupMembership extends Model {
    static className = 'GroupMembership';
    static schema = {
      userGroupId: String,
      username: {
        type: String,
        decrypted: true,
      },
      signingKeyPrivateKey: String,
      signingKeyId: String,
    }

    static async fetchUserGroups(): Promise<UserGroupKeys>
    static async cacheKeys(): void
    static async clearStorage(): void
    static userGroupKeys(): UserGroupKeys
    async encryptionPublicKey(): string
    encryptionPrivateKey(): string
    getSigningKey(): {
      signingKeyId?: string,
      signingKeyPrivateKey?: string
    } | {
      _id: signingKeyId,
      privateKey: signingKeyPrivateKey,
    }
    async fetchUserGroupSigningKey(): {
      signingKeyId?: string
    } | {
      _id,
      signingKeyId,
    }
  }

  function valueToString(value: any, clazz: any): any
  function stringToValue(value: string, clazz: any): any
  async function decryptObject(encrypted: any, model: Model): Model
  async function encryptObject(model: Model): Model
  function clearStorage(): void
  function userGroupKeys(): {
    [key: string]: string,
    userGroups: {},
    signingKeys: {},
    personal: {},
  }
  function addPersonalSigningKey(signingKey: string): void
  function addUserGroupKey(userGroup: UserGroup): void
  function requireUserSession(): UserSession
  function loadUserData(): null | UserData
}
