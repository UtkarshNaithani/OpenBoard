//to start the server -> npm run serve 
//backend work
const express = require("express"); //will get Access
const socket = require("socket.io");

const app = express(); //application Initialize and server ready

//to display index.html without it the browser won't know
app.use(express.static("public"));

let port = 5500;
let server = app.listen(port,()=>{
    console.log("Listening to port " + port);
})

let io = socket(server); //server passed to socket

//Whenever frontend is connected to the server,it will tell us if the connection is made
io.on("connection",(socket)=>{
    console.log("Made Connection");
    
    //Received data 
    socket.on("beginPath",(data)=>{ //data from canvas.js mousemove
            //Transfer data to all connectors
             io.sockets.emit("beginPath",data);
    })

    socket.on("drawStroke",(data)=>{
        io.sockets.emit("drawStroke",data);
    })

    socket.on("redoUndo",(data)=>{
        io.sockets.emit("redoUndo",data);
    })
})
  