import {ObjectId} from 'mongodb';

export class User {
    _id: ObjectId = new ObjectId();
    username: string = "";
    password: string = "";
    createdAt: Date = new Date();
    updatedAt: Date = new Date();
}