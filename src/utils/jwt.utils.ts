import { config } from 'dotenv';
import jwt from 'jsonwebtoken';
config();

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

export const generateToken = (data: any) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      {
        data: data,
      },
      JWT_SECRET_KEY,
      {
        algorithm: 'HS256',
        expiresIn: JWT_EXPIRES_IN,
      },
      (error, token) => {
        if (error) {
          console.error(error);
          return reject(error);
        }
        resolve(token);
      },
    );
  });
};
export const verifyToken = (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET_KEY, (error: any, decoded: any) => {
      if (error) {
        console.error(error);
        return reject(error);
      }
      resolve(decoded);
    });
  });
};
