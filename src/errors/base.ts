export class ApplicationError extends Error{
    get name(){
        return this.constructor.name;
    }
}

export class DatabaseError extends ApplicationError {
    get statusCode() {
        return 500;
    }
}

export class UserError extends ApplicationError {
    get statusCode() {
        return 500;
    }
}

export class ServerError extends ApplicationError {
    get statusCode() {
        return 500;
    }
}
