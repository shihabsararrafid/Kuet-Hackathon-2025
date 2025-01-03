import { AuthPayload } from "./domains/interfaces/auth.interface";

interface IResponse {
  [key: string]: number | string | object | Array;
}
export {};

declare global {
  namespace Express {
    export interface Request {
      user: AuthPayload;
    }
  }
}
