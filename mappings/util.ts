import { hexToString, u8aToString } from "@polkadot/util";
import SDK from '@zeitgeistpm/sdk'
import { RedisClient, createClient, ClientOpts } from 'redis'
import CID from "cids";
import all from "it-all";
import { concat, toString } from "uint8arrays";
import ipfsClient from "ipfs-http-client";

export class Cache {
  private static _instance: Cache
  private client: RedisClient

  constructor(redisOptions: ClientOpts) {
      this.client = createClient(redisOptions)
  }

  public static async init() {
      if (!this._instance) {
          console.log('Connecting to Redis DB...')
          this._instance = new Cache({
              host: 'host.docker.internal',
              port: 6379,
              connect_timeout: 3600000,
              retry_strategy: (options) => {
                  return 2000
              },
          })
      }
      return this._instance
  }

  private makeKey(prefix: string, key: string) {
      return `${prefix}_${key}`
  }

  async setMeta(key: string, value: string): Promise<void> {
      return new Promise((resolve, reject) => {
          const cacheKey = this.makeKey('meta',key)
          this.client.set(cacheKey, value, (err: any) => {
              if (err) {
                  reject(err)
              } else {
                  resolve()
              }
          })
      })
  }

  async setFee(key: string, value: string): Promise<void> {
      return new Promise((resolve, reject) => {
          const cacheKey = this.makeKey('fee', key)
          this.client.set(cacheKey, value, (err: any) => {
              if (err) {
                  reject(err)
              } else {
                  resolve()
              }
          })
      })
  }

  async getMeta(key: string): Promise<string | null> {
      return new Promise((resolve, reject) => {
          const cacheKey = this.makeKey('meta',key)
          this.client.get(cacheKey, (err: any, data: string | PromiseLike<string | null> | null) => {
              if (err) {
                  reject(err)
              } else {
                  resolve(data)
              }
          })
      })
  }

  async getFee(key: string): Promise<string | null> {
      return new Promise((resolve, reject) => {
          const cacheKey = this.makeKey('fee',key)
          this.client.get(cacheKey, (err: any, data: string | PromiseLike<string | null> | null) => {
              if (err) {
                  reject(err)
              } else {
                  resolve(data)
              }
          })
      })
  }
}

export class IPFS {
  private client: any;

  constructor() {
    this.client = ipfsClient({
      url: "https://ipfs.zeitgeist.pm",
    });
  }

  async add(content: string, hashAlg = "sha3-384"): Promise<CID> {
    const { cid } = await this.client.add({ content }, { hashAlg });
    return cid;
  }

  async read(partialCid: string): Promise<string> {
    // Old way - backwards compatibility is fun
    if (partialCid.slice(2, 6) !== "1530") {
      const str = hexToString(partialCid);
      return toString(concat(await all(this.client.cat(str))));
    }

    // New way
    const cid = new CID("f0155" + partialCid.slice(2));
    const data = await all(this.client.cat(cid)) as any[];
    return data.map(u8aToString).reduce((p, c) => p + c);
  }
}

export class Tools {
  private static sdk: SDK

  private static async init(): Promise<SDK> {
    console.log(`Initializing SDK`)
    this.sdk = await SDK.initialize(process.env['WS_NODE_URL'] ?? 'wss://bsr.zeitgeist.pm')
    return this.sdk
  }

  static async getSDK() {
    if (!this.sdk) {
      return this.init()
    } 
    if (!this.sdk.api.isConnected) {
      this.sdk.api.connect()
    }
    return this.sdk
  }
}