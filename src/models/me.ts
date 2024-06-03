import { ObjectId } from "mongodb";

export class Me {
    _id: ObjectId = new ObjectId();
    username: string = "";
}