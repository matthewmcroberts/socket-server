import express, { Router, Request, Response, NextFunction } from "express";
import { createNewChat, createNewMessage, getAllChats, getChatById, getChatMessagesById, removeExistingChat, removeMessagesByChatId, updateChatNameById } from "../mongo/chat";
import { Me } from "../models/me";
import { BadRequestError, UnauthorizedError } from "../errors/user";
import { logger } from '../utils/logger';
import { isLoggedIn } from "../middleware/auth";
import { ServerError } from "../errors/base";

const router: Router = express.Router();

router.post('/create', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {

        let name = req.body.name;

        if(name && name.length > 0){
            const chat = await createNewChat(name);
            if(chat){
                res.json({success: true, data: chat});
            }
        }else{
            throw new BadRequestError("You need to provide a name for the chat");
        }

    } catch (err) {
        logger.log({level: "error", message: `Something went wrong while creating a new chat: `, err});
        next(err);
    }
});

router.delete('/remove', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {

        let chatId = req.body.chatId;

        if(chatId && chatId.length > 0){
            const exists = await getChatById(chatId);
            if(exists){
                const remove = await removeExistingChat(chatId);
                if(remove){
                    const removeMessages = await removeMessagesByChatId(chatId);
                    if(removeMessages){
                        res.json({success: true, data: exists});
                    }
                }
            }else{
                throw new BadRequestError("A chat with that id does not exist");
            }
        }else{
            throw new BadRequestError("You need to provide a name for the chat");
        }

    } catch (err) {
        logger.log({level: "error", message: `Something went wrong while removing a chat by id: `, err});
        next(err);
    }
});

router.post('/send', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {

        const me = req.session.Me;
        const chatId = req.body.chatId;
        const message = req.body.message;

        if(me){
            if(chatId && chatId.length > 0){
                if(message && message.length > 0){
                    const create = await createNewMessage(me._id,chatId,message);
                    if(create){
                        res.json({success: true, data: create});
                    }
                }else{
                    throw new BadRequestError("You need to send a valid message");
                }
            }else{
                throw new BadRequestError("You need to send a valid chatId");
            }
        }else{
            throw new UnauthorizedError("You are not logged in");
        }

    } catch (err) {
        logger.log({level: "error", message: `Something went wrong while creating a new chat: `, err});
        next(err);
    }
});

router.put('/update', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {

        const chatId = req.body.chatId;
        const name = req.body.name;

        if(chatId && chatId.length > 0){
            if(name && name.length > 0){
                const update = await updateChatNameById(chatId,name);
                if(update){
                    res.json({success: true, data: update});
                }
            }else{
                throw new BadRequestError("You need to send a valid name");
            }
        }else{
            throw new BadRequestError("You need to send a valid chatId");
        }

    } catch (err) {
        logger.log({level: "error", message: `Something went wrong while updating a chat's name: `, err});
        next(err);
    }
});

router.get('/get/all', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {

        const chats = await getAllChats();

        console.log("attempted to get chats");

        if(chats){
            res.json({success: true, data: chats});
        }else{
            throw new ServerError("Something went wrong while getting all chats");
        }

    } catch (err) {
        logger.log({level: "error", message: `Something went wrong while getting all chats: `, err});
        next(err);
    }
});

router.get('/get/messages', isLoggedIn, async (req: Request, res: Response, next: NextFunction) => {
    try {

        const id = req.query.chatId?.toString() || undefined;

        if(id){
            const messages = await getChatMessagesById(id);

            if(messages){
                res.json({success: true, data: messages});
            }else{
                throw new ServerError(`Something went wrong while getting all messages for the chat id: ${id}`);
            }
        }else{
            throw new BadRequestError("You must provide a valid chat id");
        }

    } catch (err) {
        logger.log({level: "error", message: `Something went wrong while getting all chat messages: `, err});
        next(err);
    }
});

export default router;