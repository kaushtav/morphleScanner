const socketIO = require("socket.io");
const express =require("express") ;
const bodyParser = require("body-parser");
const connectDB = require('./database/db')
const cors = require('cors')
const State = require('./models/State')
connectDB().then();

const app = express();
let http = require('http');
app.use(cors())
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Api running');
});
let port = process.env.PORT || '4000';
app.set('port', port);

let server = http.createServer(app);

const io = socketIO(server,{cors:true});

server.listen(port,() =>
    console.log(`Server listening at port ${port}`)
);
io.on("connection",async (socket) =>{
  console.log("Connection established");

  let scannerPos = null
  let nextPos = null
  let state = await State.findById('6245baade6617fd8b0e9fcd2') //get this state
  let currPos = {x:state.state[0].length/2,y:state.state.length/2} //set scanner to middle of the screen
  let message=''
  socket.emit('sendState',{state,currPos})

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  const focus = async (pos) => {
    if(state.state[pos.y][pos.x].focused) return
    message = `Focusing (${pos.x}, ${pos.y})`
    socket.emit('sendState',{state,currPos,message})
    await sleep(3000)
    state.state[pos.y][pos.x].focused=true
    state.save()
    message = `Focused (${pos.x}, ${pos.y}). Capturing`
    socket.emit('sendState',{state,currPos,message})
    console.log('focused ',[pos.x,pos.y])
  }
  const capture = async (pos) => {
    if(state.state[pos.y][pos.x].captured) return
    await sleep(2000)
    state.state[pos.y][pos.x].captured=true
    state.save()
    message = `Captured (${pos.x}, ${pos.y})`
    socket.emit('sendState',{state,currPos,message})
    console.log('captured ',[pos.x,pos.y])
  }

  const runCommand = async (pos) => {
    console.log('Running operation on ', [pos.x, pos.y])
    await focus(pos)
    await capture(pos)
  }

  socket.on("newCommand",async (command) => {
    try{
      switch (command) {
        case 'ArrowUp':
          currPos.y--;
          break;
        case 'ArrowDown':
          currPos.y++;
          break;
        case 'ArrowLeft':
          currPos.x--;
          break;
        case 'ArrowRight':
          currPos.x++;
          break;
      }
      socket.emit('sendState',{state,currPos, message})
      if(scannerPos){
        nextPos = currPos
      } else {
        scannerPos = currPos
        while(scannerPos){
          await runCommand({x:scannerPos.x,y:scannerPos.y})
          scannerPos = nextPos;
          nextPos = null
        }
      }
    }catch (e) {
      console.log("error: "+e);
    }
  });

  socket.on("disconnect",()=>{
    console.log("connection disconnected");
  });
});
