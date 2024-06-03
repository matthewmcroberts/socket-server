export interface Config{
    mongo: {
        host: string,
        port: string,
        database: string
    },
    logging: {
        levels: {},
        colors: {},
        silent: boolean,
        level: string,
        file: string
    },
    server:{
        secret: string,
    }
}