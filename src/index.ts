import express, {Request, Response, NextFunction} from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import session from 'express-session';

import user from './core/routes/user';
import chat from './core/routes/chat';
import {Me} from './core/models/me';
import config from './core/config';
import { UserError } from './core/errors/base';

import Socket from 'socket.io';

import winston from "winston";
import { logger } from "./core/utils/logger";
import handleSocketEvents from './core/socketio/sockethandler';

import cors from 'cors';


interface IMainOptions{
    port: number;
    env: string;
}

declare module 'express-session' {
    interface SessionData {
        Me: Me
    }
}

export async function main(options: IMainOptions){

    try{

    
        if(options.env === "development"){
            winston.addColors(config.logging.colors);
        }else{
            logger.add(new winston.transports.File({filename: config.logging.file, level: config.logging.level}));
        }

    const app = express();

    app.use(bodyParser.json({limit: '5mb'}));
    app.use(bodyParser.urlencoded({extended: false, limit: '5mb'}));

    const sess = session({ secret: config.server.secret, resave: false, saveUninitialized: false, cookie: { secure: false, httpOnly: true, sameSite: 'none', maxAge: 6000000 }});

    app.set("trust proxy", 1);

    app.use(sess);
	
	app.use(cors({
		origin: ["*","http://localhost:3000", "http://10.3.0.16:3000"],
		methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
		credentials: true
	}));

    app.use('/user', user);
    app.use('/chat', chat);
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        if(err instanceof UserError){
            res.status(err.statusCode).send({message: err.message});
        }else{
            res.status(500).send("A server error occured");
        }

        logger.log({level: "error", message: `There was a problem with a server request: ${err.message}`});       
    });

    const server = http.createServer(app);

    const io = new Socket.Server(server);

    io.engine.use(sess);

    handleSocketEvents(io);

    server.listen(options.port);

    }catch(err){
        throw err;
    }

}

if(require.main === module){
    const PORT = 7000;
    const ENV = process.env.NODE_ENV ?? "development";
    
    main({port: PORT, env: ENV}).then(() => {logger.log({level: "debug", message: "The server started successfully"})}).catch((err) => {logger.log({level: "emerg", message: `Something bad happened with the server: ${err}`})});
}