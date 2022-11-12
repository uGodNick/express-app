import { createClient } from "redis";

export class Redis {
  public redisClient: ReturnType<typeof createClient> | undefined;
  constructor() {}

  public connect = async () => {
    try {
      this.redisClient = createClient({
        url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      });

      this.redisClient.on("error", (error: any) => {
        console.log(error);
      });
      this.redisClient.on("connect", () => {
        console.log("Redis connected!");
      });

      await this.redisClient.connect();
    } catch (error) {
      console.error("[redis.client][connect][Error]: ", error);
      throw new Error("failed to connect to redis");
    }
  };

  public set = async (key: any, value: any): Promise<void> => {
    try {
      if (!this.redisClient) {
        throw new Error("Redis was not connected.");
      }

      await this.redisClient.set(key, value);
    } catch (error) {
      console.error("[redis.client][set][Error]: ", error);
      throw new Error("failed to set redis key");
    }
  };

  public get = async (key: any): Promise<string | null> => {
    try {
      if (!this.redisClient) {
        throw new Error("Redis was not connected.");
      }

      return await this.redisClient.get(key);
    } catch (error) {
      console.error("[redis.client][get][Error]: ", error);
      throw new Error("failed to get redis key");
    }
  };

  public expireAt = async (key: any, exp: any): Promise<void> => {
    try {
      if (!this.redisClient) {
        throw new Error("Redis was not connected.");
      }

      await this.redisClient.expireAt(key, exp);
    } catch (error) {
      console.error("[redis.client][expireAt][Error]: ", error);
      throw new Error("failed to set key expireAt");
    }
  };
}
