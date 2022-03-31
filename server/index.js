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

  let currCommand = null
  let nextCommand = null
  let running = false;
  let state = await State.findById('6245baade6617fd8b0e9fcd2') //get this state
  let currPos = {x:state.state[0].length/2,y:state.state.length/2} //set pointer to middle of the screen
  socket.emit('sendState',{state,currPos})

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
  const focus = async () => {
    if(state.state[currPos.y][currPos.x].focused) return
    socket.emit('sendState',{state,currPos,message:`Focusing (${currPos.x}, ${currPos.y})`})
    running = true;
    await sleep(3000)
    state.state[currPos.y][currPos.x].focused=true
    socket.emit('sendState',{state,currPos,message:`Focused (${currPos.x}, ${currPos.y}). Capturing`})
    state.save()
    console.log('focused ',[currPos.x,currPos.y])
  }
  const capture = async () => {
    if(state.state[currPos.y][currPos.x].captured) return
    await sleep(2000)
    state.state[currPos.y][currPos.x].captured=true
    state.save()
    socket.emit('sendState',{state,currPos,message:`Captured (${currPos.x}, ${currPos.y})`})
    console.log('captured ',[currPos.x,currPos.y])
    running=false
  }

  const runCommand = async (command) => {
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
    socket.emit('sendState',{state,currPos})
    await focus()
    await capture()
    console.log(nextCommand)
    currCommand = nextCommand
    nextCommand=null
  }

  socket.on("newCommand",async (command) => {
    try{
      if(running){
        nextCommand = command
      } else {
        currCommand = command
        while(currCommand){
          await runCommand(currCommand)
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
