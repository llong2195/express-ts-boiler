import { Router } from 'express';
import { findAll } from './auth.controller';

const UserRouter = Router();
UserRouter.get('/', findAll);

export default UserRouter;
