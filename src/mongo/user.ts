import { MongoInsertError } from '../errors/mongo';
import { BadRequestError } from '../errors/user';
import {User} from '../models/user';
import {getDb} from '../utils/mongohelper';
import * as bcrypt from 'bcrypt';

export const registerNewUser = async (username: string, password: string): Promise<User> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<User>('users');

            bcrypt.hash(password, 10, async (err, hash) => {
                const newUser = new User();
                newUser.username = username;
                newUser.password = hash;
                newUser.createdAt = new Date();
                newUser.updatedAt = new Date();

                const result = await collection.insertOne(newUser);

                if (result.acknowledged) {
                    newUser._id = result.insertedId;
                    resolve(newUser);
                } else {
                    //reject(false);
                    throw new MongoInsertError("Something went wrong while inserting a new user");
                }
            });

        }catch(err){
            reject(err);
        }
    });
};

export const getUserByUsername = async (username: string): Promise<User> => {
    return new Promise(async (resolve, reject) => {
        try{
            let db = await getDb();
            const collection = await db.collection<User>('users');

            const user = await collection.findOne({username});

            if(user){
                resolve(user);
            }else{
                throw new BadRequestError("A user with that username does not exist");
            } 

        }catch(err){
            reject(err);
        }
    });
};