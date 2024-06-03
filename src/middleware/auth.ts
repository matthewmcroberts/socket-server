import { Router, Request, Response, NextFunction } from "express";
import {UnauthorizedError} from '../errors/user';
import { logger } from "../utils/logger";

export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
    try{

        const me = req.session.Me;

        if(me && me.username.length >= 0){
            next();
        }else{
            throw new UnauthorizedError("You are not logged in");
        }

    }catch(err: any){
        req.session.destroy((err) => {});
        logger.log({level: "error", message: "There was a problem with a user's session: ", err});
        next(err);
    }
};

