import express, { Router, Request, Response, NextFunction } from "express";
import { getUserByUsername, registerNewUser } from "../mongo/user";
import { Me } from "../models/me";
import { BadRequestError } from "../errors/user";
import { logger } from '../utils/logger';
import * as bcrypt from 'bcrypt';

const router: Router = express.Router();

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {

        let username = req.body.username;
        let password = req.body.password;
        let password2 = req.body.password2;

        if(username && username.length > 0){
            if(password && password.length > 0 && password === password2){
                let newUser = await registerNewUser(username, password);
                if(newUser){
                    res.json({success: true, data: newUser});
                }
            }else{
                throw new BadRequestError("Your passwords do not match");
            }
        }else{
            throw new BadRequestError("You need to send a valid username");
        }


    } catch (err) {
        logger.log({level: "error", message: `Something went wrong while creating a new user: `, err});
        next(err);
    }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {

        let username = req.body.username;
        let password = req.body.password;

        if(username && username.length > 0){
            if(password && password.length > 0){
                let exists = await getUserByUsername(username);
                if(exists){
                    const result = await bcrypt.compare(password, exists.password);
                    console.log("res: ", result);
                    if(result){

                        let me = new Me();
                        me._id = exists._id;
                        me.username = exists.username;
                        req.session.Me = me;

                        res.json({success: true, data: exists});
                    }else{
                        throw new BadRequestError("Incorrect username or password");
                    }
                }else{
                    throw new BadRequestError("That user doesn't exist");
                }
            }else{
                throw new BadRequestError("You need to send a valid password");
            }
        }else{
            throw new BadRequestError("You need to send a valid username");
        }


    } catch (err) {
        logger.log({level: "error", message: `Something went wrong while logging in a user: `, err});
        next(err);
    }
});

router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
    try {

        req.session.destroy((err) => {});

        res.json({success: true});

    } catch (err) {
        logger.log({level: "error", message: `Something went wrong while logging a user out: `, err});
        next(err);
    }
});

export default router;