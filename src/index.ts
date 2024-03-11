import cors from 'cors';
import { config } from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import HttpError from './common/http.error';
import UserRouter from './modules/auth/auth.router';
import path from 'path';
import { encodeHLSWithMultipleVideoStreams } from './service/service';
import { fs } from 'zx/.';

config();
const PORT = process.env.PORT || 5000;

const staticFilesPath = path.join(__dirname, '../videos');

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

  app.use(
    express.static(staticFilesPath, {
      extensions: ['m3u8', 'ts'],
    }),
  );

  app.use(cors());

  app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
  });
  

  app.get("/convert:filename", (req: Request, res: Response, next: NextFunction) => {
    try {
      var filename = req.params.filename;
      var filePath = path.join(__dirname, "../videos/v1" + filename);
      if (!filePath) {
        return res.status(404).send('File not found!!');
      }
      encodeHLSWithMultipleVideoStreams(filePath);
    } catch (ex) {
      throw new Error(ex);
    }
  });

  app.get("/streaming/:filename", (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileName = req.params.filename;
      const filePath = path.join(__dirname, "../videos/v1" + fileName);
      console.log({ filePath });
      if (!filePath) {
        return res.status(404).send('file not found');
      }
      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chuckSize = end - start + 1;

        const file = fs.createReadStream(filePath, { start, end });
        const head = {
          'Content-Range': `bytes ${start} - ${end}/ ${fileSize}`,
          'Accept-Range': `bytes`,
          'Content-Lenght': chuckSize,
          'Cpntent-Type': 'video/m3u8',
        };
        res.writeHead(206, head);
        console.log({ head });
        file.pipe(res);
      } else {
        const head = {
          'Content-Lenght': fileSize,
          'Cpntent-Type': 'video/m3u8',
        };
        console.log({ head });
        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (error) {
      throw new Error(error);
    }
  });

  app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
    console.log(`http://127.0.0.1:${PORT}`);
  });
}

main();
