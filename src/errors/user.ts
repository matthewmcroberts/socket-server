import { UserError } from './base';

export class BadRequestError extends UserError {
    constructor(message: string, options = {}) {
        super(message);
    }

    get statusCode() {
        return 400;
    }
}

export class UnauthorizedError extends UserError {
    constructor(message: string, options = {}) {
        super(message);
    }

    get statusCode() {
        return 401;
    }
}

export class NotFoundError extends UserError {
    constructor(message: string, options = {}) {
        super(message);
    }

    get statusCode() {
        return 404;
    }
}