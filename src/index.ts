import cors from 'cors';
import { config } from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import HttpError from './common/http.error';
import UserRouter from './modules/auth/auth.router';

config();
const PORT = process.env.PORT || 5000;

async function main() {
  const app = express();
  app.use(morgan('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  app.get('/', (req: Request, res: Response) => {
    return res.json('ok');
  });

  app.use('/api/user', UserRouter);
  // app.use("/api/file", FileRouter);
  // app.use("/api/auth", AuthRouter);

  // catch 404 err
  app.use((req: Request, res: Response, next: NextFunction) => {
    const err = new HttpError('Not Found!');
    err.status = 404;
    next(err);
  });

  // Exception Filter
  app.use((err: { status: number; message: any }, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    return res.status(status).send({
      data: null,
      message: err.message || 'Something went wrong',
    });
  });

  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    console.log(`http://127.0.0.1:${PORT}`);
  });
}

main();
