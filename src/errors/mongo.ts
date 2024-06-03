import { DatabaseError } from './base';

export class MongoFindError extends DatabaseError {
    constructor(message: string, options = {}) {
        super(message);
    }

    get statusCode() {
        return 500;
    }
}

export class MongoUpdateError extends DatabaseError {
    constructor(message: string, options = {}) {
        super(message);
    }

    get statusCode() {
        return 500;
    }
}

export class MongoRemoveError extends DatabaseError {
    constructor(message: string, options = {}) {
        super(message);
    }

    get statusCode() {
        return 500;
    }
}

export class MongoInsertError extends DatabaseError {
    constructor(message: string, options = {}) {
        super(message);
    }

    get statusCode() {
        return 500;
    }
}