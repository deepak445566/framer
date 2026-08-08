import {Server} from "socket.io";

let io;

export const initSocket=(server)=>{
  io = new Server(server,{
    cors:{
      origin:"*"
    }
  })

io.on("connection",(socket)=>{
  console.log("User Connected:",socket.id);

  socket.on("joinConversation",(conversationId)=>{
    socket.join(`conversation-${conversationId}`);
  });

  socket.on("disconnect",()=>{
    console.log("User Disconnected");
  })
});

return io;

}

export const getIO = ()=>io;