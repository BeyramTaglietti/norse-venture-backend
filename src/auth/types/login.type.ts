import { Token } from './token.type';

export type LoginResponse = Token & {
  user: {
    id: number;
    email: string;
    username: string;
    profilePicture: string | null;
    updatedAt: Date;
  };
};
