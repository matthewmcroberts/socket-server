import {Config} from './types';

const config: Config = {
    mongo: {
        host: 'localhost',
        port: '27017',
        database: 'class2'
    },
    logging: {
        levels: {
            emerg: 0,
            alert: 1,
            error: 2,
            warning: 3,
            info: 4,
            debug: 5
        },
        colors: {
            emerg: "strikethrough gray",
            alert: "gray",
            error: "red",
            warning: "yellow",
            info: "blue",
            debug: "purple"
        },
        silent: true,
        level: "warning",
        file: "./logs/errors.log"
    },
    server:{
        secret: 'LSKjdfo;ieAJSIOef2',
    }
};

export default config;