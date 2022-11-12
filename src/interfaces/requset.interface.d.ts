declare namespace Express {
  interface Request {
    userId: string;
    token: string;
    tokenExp: number;
  }
}
