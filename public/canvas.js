

let canvas = document.querySelector("canvas");
canvas.width= window.innerWidth;
canvas.height=window.innerHeight;

let pencilColor= document.querySelectorAll(".pencil-color");
let pencilWidthElem=document.querySelector(".pencil-width");
let eraserWidthElem=document.querySelector(".eraser-width");
let download=document.querySelector(".download");
let redo=document.querySelector(".redo");
let undo=document.querySelector(".undo");


let penColor="red";
let eraserColor="white";
let penWidth=pencilWidthElem.value;
let eraserWidth=eraserWidthElem.value;

let undoRedoTracker = []; //data
let track = 0; //action to perform


let mouseDown=false;

//API
let tool=canvas.getContext("2d");

tool.strokeStyle="penColor";
tool.width="penWidth";

//mousedown -> start new path, mousemove -> pathfill
canvas.addEventListener("mousedown",(e)=>{
    mouseDown=true;
   
    let data={
        x:e.clientX,
        y:e.clientY
    }
    socket.emit("beginPath",data);  //data will go the server
   })

canvas.addEventListener("mousemove",(e)=>{

        if(mouseDown){
                let data={
                    x:e.clientX,
                    y:e.clientY,
                    color:eraserFlag?eraserColor:penColor,
                    width:eraserFlag?eraserWidth:penWidth
                }

                socket.emit("drawStroke",data);

        }
       
    
})

canvas.addEventListener("mouseup",(e)=>{
    mouseDown=false;

    let url=canvas.toDataURL();
    undoRedoTracker.push(url);
    track=undoRedoTracker.length-1;
})

undo.addEventListener("click",(e)=>{
    if(track>0) track--;

    let data={
        trackValue:track,
        undoRedoTracker //[]->data
    }
    socket.emit("redoUndo",data);
    // undoRedoCanvas(trackObj);
})

redo.addEventListener("click",(e)=>{
        if(track < undoRedoTracker.length-1) track++;
        let data={
            trackValue:track,
            undoRedoTracker //[]->data
        }
        socket.emit("redoUndo",data);
        // undoRedoCanvas(trackObj);
})

function undoRedoCanvas(trackObj){
    track=trackObj.trackValue;
    undoRedoTracker=trackObj.undoRedoTracker;
    let url=undoRedoTracker[track]; //on mouseup
    let img= new Image(); //img reference
    img.src=url;
    img.onload=(e)=>{
        tool.drawImage(img,0,0,canvas.width,canvas.height);
    }

}

function beginPath(strokeobj){
    tool.beginPath(); //new graphic/drawing
    tool.moveTo(strokeobj.x,strokeobj.y); //starting path
}

function drawStroke(strokeobj){
    tool.strokeStyle=strokeobj.color;
    tool.lineWidth=strokeobj.width;
    tool.lineTo(strokeobj.x,strokeobj.y); //ending path
    tool.stroke(); //fill path
}


pencilColor.forEach((colorElem)=>{
    colorElem.addEventListener("click",(e)=>{
        let color=colorElem.classList[0]; //color at 1st index only
        penColor=color;
        tool.strokeStyle=penColor;
    })
})

pencilWidthElem.addEventListener("change",(e)=>{
    penWidth=pencilWidthElem.value;
    tool.lineWidth=penWidth;
})

eraserWidthElem.addEventListener("change",(e)=>{
    eraserWidth=eraserWidthElem.value;
    tool.lineWidth=eraserWidth;
})

eraser.addEventListener("click",(e)=>{
    if(eraserFlag){
        tool.strokeStyle=eraserColor;
        tool.lineWidth=eraserWidth;
    }
    else{
        tool.strokeStyle=penColor;
        tool.lineWidth=penWidth;
    }
})

//download
download.addEventListener("click",(e)=>{
let url=canvas.toDataURL();

    let a = document.createElement("a");
    a.href= url;
    a.download=("board.jpg");
    a.click();
})


//When server will send the data to all connectors,it will again receive itself
socket.on("beginPath",(data)=>{
    //data - > data from server
    beginPath(data);

})

socket.on("drawStroke",(data)=>{
    drawStroke(data);
})

socket.on("redoUndo",(data)=>{
    undoRedoCanvas(data);
})