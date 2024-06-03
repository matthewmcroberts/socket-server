import { Server } from "socket.io";
import { logger } from "../utils/logger";
import { createNewChat, getAllChats, getChatById, getChatMessagesById } from "../mongo/chat";
import { Request } from "express";

function handleSocketEvents(io: Server) {
    io.on("connection", (socket) => {
        logger.log({ level: "debug", message: "A socket connected to the server" });

        const req = socket.request as Request;

        socket.use((__, next) => {
            req.session.reload((err) => {
                if (err) {
                    logger.log({ level: "error", message: `An error occured while reloading the session: ${err}` });
                    socket.emit("error", { status: "401", message: "You are not authenticated" });
                    socket.disconnect();
                } else {
                    next();
                }
            });
        });

        socket.on("ping", (params: any) => {

            const me = req.session;

            logger.log({ level: "debug", message: `This is our current session: ${me}` });

            socket.emit("pong", { "data": "I got your ping" });
        });

        socket.on("request_chats", async (params: any) => {
            const chats = await getAllChats();

            socket.emit("update_chats", { "data": chats });
        });

        socket.on("request_chat_messages", async (params: any) => {
            const chatId = params && params.chatId ? params.chatId : undefined;
            if (chatId) {
                const messages = getChatMessagesById(chatId);
                socket.emit("update_chat_messages", { "data": messages });
            } else {
                //We need to handle the error where the chatId doesn't exist
                socket.emit("error", { status: "400", message: "You need to send down a valid chatId" });
            }
        });

        socket.on("join_chat", async (params: any) => {
            try {
                const chatId = params && params.chatId ? params.chatId : undefined;
                const me = req.session.Me;

                if (me) {
                    if (chatId) {
                        const exists = await getChatById(chatId);
                        if (exists) {
                            socket.join(chatId);

                            socket.emit("request_clientside_chat_messages", { data: chatId });
                            socket.to(chatId).emit("update_successful_join", { data: { username: me.username } });
                        } else {
                            //The chatId was not valid
                            socket.emit("error", { status: "400", message: "A chat with that id does not exist" });
                        }
                    } else {
                        //We need to do some error handling here
                        socket.emit("error", { status: "400", message: "You need to send a valid chatId" });
                    }
                } else {
                    //Something went wrong with authentication for the session
                    socket.emit("error", { status: "401", message: "You are not authenticated" });
                    socket.disconnect();
                }

            } catch (err) {
                logger.log({ level: "error", message: "Something went wrong while joining a chat" });
            }
        });

        socket.on("leave_chat", async (params: any) => {
            try {
                const chatId = params && params.chatId ? params.chatId : undefined;
                const me = req.session.Me;

                if (me) {
                    if (chatId) {
                        const exists = await getChatById(chatId);
                        if (exists) {
                            socket.leave(chatId);

                            io.to(chatId).emit("update_successful_leave", { data: { username: me.username } });
                        } else {
                            //The chatId was not valid
                            socket.emit("error", { status: "400", message: "A chat with that id does not exist" });
                        }
                    } else {
                        //We need to do some error handling here
                        socket.emit("error", { status: "400", message: "You need to send a valid chatId" });
                    }
                } else {
                    //Something went wrong with authentication for the session
                    socket.emit("error", { status: "401", message: "You are not authenticated" });
                    socket.disconnect();
                }

            } catch (err) {
                logger.log({ level: "error", message: "Something went wrong while leaving a chat" });
            }
        });

        socket.on("create_chat", async (params: any) => {
            try {
                const name = params && params.name ? params.name : undefined;

                if (name) {
                    const created = await createNewChat(name);

                    if (created) {
                        io.emit("request_clientside_chats", { "id": created._id });
                    } else {
                        //Something went wrong while creating a new chat
                        socket.emit("error", { status: "500", message: "Something went wrong with the server while creating a new chat" });
                    }
                } else {
                    //The name didn't exist
                    socket.emit("error", { status: "400", message: "You need to send up a valid name" });
                }

            } catch (err) {
                logger.log({ level: "error", message: "Something went wrong while creating a new chat" });
            }
        });

        socket.on("currently_typing", async (params: any) => {
            try {
                const me = req.session.Me;
                if (me) {
                    const chatId = params && params.chatId ? params.chatId : undefined;
                    if (chatId) {
                        io.to(chatId).emit("update_currently_typing", { data: { username: me.username + " is typing" } });
                    } else {
                        socket.emit("error", { status: "400", message: "You must send down a valid chatid" })
                    }
                } else {
                    socket.emit("error", { status: "401", message: "You are not authenticated" });
                }
            } catch (err) {
                logger.log({ level: "error", message: "Something went wrong checking who was typing." })
            }
        });

        socket.on("send_message", async (params: any) => {
            try {
                const me = req.session.Me;
                if (me) {
                    const chatId = params && params.chatId ? params.chatId : undefined;
                    const message = params && params.message ? params.message : undefined;
                    if (chatId) {
                        io.to(chatId).emit("request_sent_message", { data: { username: me.username, message: message } });
                    } else {
                        socket.emit("error", { status: "400", message: "You must send down a valid chatid" })
                    }
                } else {
                    socket.emit("error", { status: "401", message: "You are not authenticated" });
                }
            } catch (err) {
                logger.log({ level: "error", message: "Something went wrong checking who was typing." })
            }
        });

        socket.on("request_connected_users", async (params: any) => {
            try {
                const me = req.session.Me;
                if (me) {
                    const chatId = params && params.chatId ? params.chatId : undefined;
                    if (chatId) {
                        const clients = await io.in(chatId).fetchSockets();
                        const connectedClients = [];
                        console.log("list of clients: ", clients);
                        console.log("outside");
                        for (const client in clients) {
                            console.log("inside");
                            console.log(client);
                            connectedClients.push(client);
                        }
                        io.to(chatId).emit("update_connected_users", { data: { clients: connectedClients } });
                    } else {
                        socket.emit("error", { status: "400", message: "You must send down a valid chatid" })
                    }
                } else {
                    socket.emit("error", { status: "401", message: "You are not authenticated" });
                }
            } catch (err) {
                logger.log({ level: "error", message: "Something went wrong checking who was typing." })
            }
        });

    });
}

export default handleSocketEvents;