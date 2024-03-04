import SDK from '@zeitgeistpm/sdk';
import { RedisClient, createClient, ClientOpts } from 'redis';
import { CacheHint } from './consts';
import { isLocalEnv } from './helper';

export class Cache {
  private static _instance: Cache;
  private client: RedisClient;

  constructor(redisOptions?: ClientOpts) {
    this.client = createClient(redisOptions);
  }

  public static async init() {
    if (isLocalEnv()) this._instance = new Cache();
    if (!this._instance) {
      console.log('Connecting to Redis DB...');
      this._instance = new Cache({
        host: process.env.REDIS_HOST ?? 'redis',
        port: 6379,
        password: process.env.REDIS_PASS,
        connect_timeout: 3600000,
        retry_strategy: (options) => {
          return 2000;
        },
      });
    }
    return this._instance;
  }

  getData = async (hint: CacheHint, key: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      this.client.get(`${hint}_${key}`, (err: any, data: string | PromiseLike<string | null> | null) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  };

  setData = async (hint: CacheHint, key: string, value: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      this.client.set(`${hint}_${key}`, value, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };
}

export class Tools {
  private static sdk: SDK;

  private static async init(nodeUrl: string): Promise<SDK> {
    console.log(`Initializing SDK...`);
    this.sdk = await SDK.initialize(nodeUrl, { ipfsClientUrl: process.env.IPFS_CLIENT_URL });
    return this.sdk;
  }

  static async getSDK(nodeUrl?: string) {
    if (!this.sdk) {
      const url = nodeUrl ?? process.env.WS_NODE_URL!;
      return this.init(url);
    }
    if (!this.sdk.api.isConnected) {
      this.sdk.api.connect();
    }
    return this.sdk;
  }
}
