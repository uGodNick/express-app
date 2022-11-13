import jwt from "jsonwebtoken";

import { IUser } from "../interfaces/user.interface";
import { ITokens } from "../interfaces/token.interface";
import { userQueries } from "../sql/user.sql";
import { Connector } from "../utils/connector.util";
import { genSalt, hash, compare } from "bcryptjs";
import { Redis } from "utils/redis.util";

export class UserService {
  private connector: Connector;
  private redis: Redis;

  constructor(connector: Connector, redis: Redis) {
    this.connector = connector;
    this.redis = redis;
  }

  public signUpUser = async (dto: IUser): Promise<ITokens | null> => {
    const salt = await genSalt(10);
    await this.connector.execute(userQueries.createUser, [
      dto.id,
      await hash(dto.password, salt),
    ]);

    return await this.signInUser(dto);
  };

  public getUser = async (id: string): Promise<IUser | null> => {
    const data = await this.connector.execute<IUser[]>(userQueries.getUser, [
      id,
    ]);
    return data.length ? data[0] : null;
  };

  public signInUser = async (dto: IUser): Promise<ITokens | null> => {
    const user = await this.getUser(dto.id);
    if (!user) {
      return null;
    }

    if (!(await compare(dto.password, user.password))) {
      return null;
    }

    return {
      accessToken: await this.generateAccessToken(user.id),
      refreshToken: await this.generateRefreshToken(user.id),
    };
  };

  public refreshToken = async (
    refreshToken: string
  ): Promise<string | null> => {
    return await new Promise<string | null>((resolve) => {
      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!,
        async (err, payload) => {
          if (err || !payload) {
            resolve(null);
          } else {
            const { userId } = payload as jwt.JwtPayload;
            resolve(await this.generateAccessToken(userId));
          }
        }
      );
    });
  };

  private generateAccessToken = async (userId: string): Promise<string> => {
    return jwt.sign(
      {
        userId,
      },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "10m",
      }
    );
  };

  private generateRefreshToken = async (userId: string): Promise<string> => {
    return jwt.sign(
      {
        userId,
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "1d" }
    );
  };

  public inInDenyList = async (token: string): Promise<string | null> => {
    return await this.redis.get(`bl_${token}`);
  };

  public logout = async (token: string, tokenExp: number): Promise<void> => {
    const token_key = `bl_${token}`;
    await this.redis.set(token_key, token);
    await this.redis.expireAt(token_key, tokenExp);
  };
}
