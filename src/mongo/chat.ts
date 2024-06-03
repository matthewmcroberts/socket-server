import { AggregationCursor, ObjectId } from "mongodb";
import { MongoFindError, MongoInsertError } from "../errors/mongo";
import { Chat, ChatWithMessage, Message } from "../models/chat";
import { ensureObjectId, getDb } from "../utils/mongohelper";
import { BadRequestError } from "../errors/user";


export const createNewChat = async (name: string): Promise<Chat> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<Chat>('chats');

            const newChat = new Chat();
            newChat.name = name;
            newChat.createdAt = new Date();
            newChat.updatedAt = new Date();

            const created = await collection.insertOne(newChat);

            if(created.acknowledged){
                newChat._id = created.insertedId;
                resolve(newChat);
            }else{
                throw new MongoInsertError("Something went wrong while creating a new chat");
            }

        }catch(err){
            reject(err);
        }
    });
};

export const getChatById = async (_id: string | ObjectId): Promise<Chat> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<Chat>('chats');

            const exists = await collection.findOne({_id: ensureObjectId(_id)});

            if(exists){
                resolve(exists);
            }else{
                throw new BadRequestError("That chat does not exist");
            }

        }catch(err){
            reject(err);
        }
    });
};

export const getChatMessagesById = async (_id: string | ObjectId): Promise<Message[]> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<Message>('messages');

            const exists = await collection.find({chatId: ensureObjectId(_id)}).toArray();

            if(exists){
                resolve(exists);
            }else{
                throw new BadRequestError("That chat does not exist");
            }

        }catch(err){
            reject(err);
        }
    });
};

export const removeExistingChat = async (_id: string | ObjectId): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<Chat>('chats');

            const created = await collection.deleteOne({_id: ensureObjectId(_id)});

            if(created.acknowledged){
                resolve(true);
            }else{
                throw new MongoInsertError("Something went wrong while removing a chat by id");
            }

        }catch(err){
            reject(err);
        }
    });
};

export const removeMessagesByChatId = async (_id: string | ObjectId): Promise<boolean> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<Message>('messages');

            const created = await collection.deleteMany({chatId: ensureObjectId(_id)});

            if(created.acknowledged){
                resolve(true);
            }else{
                throw new MongoInsertError("Something went wrong while removing messages by chat id");
            }

        }catch(err){
            reject(err);
        }
    });
};

export const createNewMessage = async (userId: string | ObjectId, chatId: string | ObjectId, message: string): Promise<Message> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<Message>('messages');

            const newMessage = new Message();
            newMessage.userId = ensureObjectId(userId);
            newMessage.chatId = ensureObjectId(chatId);
            newMessage.message = message;
            newMessage.createdAt = new Date();
            newMessage.updatedAt = new Date();

            const created = await collection.insertOne(newMessage);

            if(created.acknowledged){
                newMessage._id = created.insertedId;
                resolve(newMessage);
            }else{
                throw new MongoInsertError("Something went wrong while creating a new message");
            }

        }catch(err){
            reject(err);
        }
    });
};

export const updateChatNameById = async (_id: string | ObjectId, name: string): Promise<Chat> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<Chat>('chats');

            const updated = await collection.updateOne({_id: ensureObjectId(_id)}, {$set: {name}});

            if(updated.acknowledged){
                const found = await collection.findOne({_id: ensureObjectId(_id)});
                if(found){
                    resolve(found);
                }else{
                    throw new MongoFindError("Something went wrong while updating a chat's name by id");
                }
            }else{
                throw new MongoInsertError("Something went wrong while updating a chat by id");
            }

        }catch(err){
            reject(err);
        }
    });
};

export const getAllChats = async (): Promise<ChatWithMessage[]> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<Chat>('chats');

            const chats: AggregationCursor<ChatWithMessage> = await collection.aggregate([
                {$match: {}},
                {$lookup: {
                    from: 'messages',
                    let: {id: '$_id'},
                    pipeline: [
                        {$match: {$and: [{$expr: {$eq: ["$chatId","$$id"]}},{}]}},
                        { $sort: { createdAt: -1 } },
                        {$limit: 1}
                    ],
                    as: 'latestMessage'
                }},
            ]);

            //Finish up here
            const chatList = chats.toArray();
            
            resolve(chatList);

        }catch(err){
            reject(err);
        }
    });
};