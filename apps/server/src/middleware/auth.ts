import { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HttpException } from '../models/http-exception';
import { StatusCodes } from 'http-status-codes';
import { IUser } from '../models/user';
import { Document } from 'mongoose';
import { container } from 'tsyringe';
import { UserService } from '../services/user-service';

export interface AuthRequest<
    Params extends object = Record<any, any>,
    Body extends object = Record<any, any>,
    Query extends object = Record<any, any>,
> extends Request<Params, any, Body, Query> {
    token?: string | JwtPayload;
    user?: IUser & Document;
}

export const auth: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new HttpException(StatusCodes.UNAUTHORIZED, 'You must be logged in');
        }

        const [user, decoded] = await container.resolve(UserService).loadSession(token);

        (req as AuthRequest).token = decoded;
        (req as AuthRequest).user = user;

        next();
    } catch (err) {
        next(err);
    }
};
