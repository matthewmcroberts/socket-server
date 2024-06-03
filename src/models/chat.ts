import { ObjectId } from "mongodb";

export class Chat {
    _id: ObjectId = new ObjectId();
    name: string = "";
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export class ChatWithMessage{
    _id: ObjectId = new ObjectId();
    name: string = "";
    lastMessage: Message = new Message();
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}

export class Message {
    _id: ObjectId = new ObjectId();
    userId: ObjectId = new ObjectId();
    chatId: ObjectId = new ObjectId();
    message: string = "";
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}