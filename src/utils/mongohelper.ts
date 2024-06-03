import { MongoClient, Db, ObjectId} from 'mongodb';
import config from '../config';

let mongoInstance: Db;

export const ensureObjectId = (id: ObjectId | string) => {
    if(typeof id === "string"){
        return new ObjectId(id);
    }

    return id;
}

export const getDb = async (): Promise<Db> => {
    if (!mongoInstance) {
        const connectionString = `mongodb://${config.mongo.host}:${config.mongo.port}/${config.mongo.database}`;

        const mongo = await MongoClient.connect(connectionString);
        mongoInstance = mongo.db(config.mongo.database);

        console.log(`MongoDB connection was initialized to: ${config.mongo.database}`);
    }

    return mongoInstance;
}