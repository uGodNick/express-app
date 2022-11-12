import jwt from "jsonwebtoken";

import { User } from "../interfaces/user.interface";
import { Tokens } from "../interfaces/token.interface";
import { userQueries } from "../sql/user.sql";
import { Connector } from "../utils/connector.util";
import { genSalt, hash, compare } from "bcryptjs";
import { Redis } from "utils/redis.util";

export class UserService {
  private connector: Connector;
  private refreshTokenSecret: string;
  private accessTokenSecret: string;
  private redis: Redis;

  constructor(
    connector: Connector,
    redis: Redis,
    refreshTokenSecret: string,
    accessTokenSecret: string
  ) {
    this.connector = connector;
    this.refreshTokenSecret = refreshTokenSecret;
    this.accessTokenSecret = accessTokenSecret;
    this.redis = redis;
  }

  public signUpUser = async (dto: User): Promise<Tokens | null> => {
    const salt = await genSalt(10);
    await this.connector.execute(userQueries.createUser, [
      dto.id,
      await hash(dto.password, salt),
    ]);

    return await this.signInUser(dto);
  };

  public getUser = async (id: string): Promise<User | undefined> => {
    const data = await this.connector.execute<User[]>(userQueries.getUser, [
      id,
    ]);
    return data.length ? data[0] : undefined;
  };

  public signInUser = async (dto: User): Promise<Tokens | null> => {
    const user = await this.getUser(dto.id);
    if (!user) {
      return null;
    }

    if (!(await compare(dto.password, user.password))) {
      return null;
    }

    return this.generateTokens(user.id);
  };

  public updateToken = async (refreshToken: string): Promise<Tokens | null> => {
    return await new Promise<Tokens | null>((resolve, reject) => {
      jwt.verify(
        refreshToken,
        this.refreshTokenSecret,
        async (err, payload) => {
          if (err || !payload) {
            resolve(null);
          } else {
            const { userId } = payload as jwt.JwtPayload;
            resolve(userId);
          }
        }
      );
    });
  };

  private generateTokens = async (userId: string): Promise<Tokens> => {
    const accessToken = jwt.sign(
      {
        userId,
      },
      this.accessTokenSecret,
      {
        expiresIn: "10m",
      }
    );

    const refreshToken = jwt.sign(
      {
        userId,
      },
      this.refreshTokenSecret,
      { expiresIn: "1d" }
    );
    return {
      accessToken,
      refreshToken,
    };
  };

  public inDenyList = async (token: string): Promise<string | null> => {
    return await this.redis.get(`bl_${token}`);
  };

  public logout = async (token: string, tokenExp: number): Promise<void> => {
    const token_key = `bl_${token}`;
    await this.redis.set(token_key, token);
    await this.redis.expireAt(token_key, tokenExp);
  };
}
