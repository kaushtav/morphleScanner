import {useEffect, useState, useRef} from "react";
import socketIOClient from "socket.io-client";

const useSocket = () => {
    const socketRef = useRef();
    const [state, setState] = useState([])
    const [message, setMessage] = useState('')
    const [currPos, setCurrPos] = useState({x:0,y:0})

    useEffect(() =>{
        socketRef.current = socketIOClient("http://localhost:4000");
        socketRef.current.on("sendState",(data) =>{
            console.log(data.state.state[data.currPos.y][data.currPos.x])
            setState(data.state.state)
            setCurrPos(data.currPos)
            setMessage(data.message)
        })
        return ()=>{
            socketRef.current.disconnect();
        }
    },[]);

    const sendCommand = (command) =>{
        socketRef.current.emit("newCommand", command)
    }
    return {message, state, currPos, sendCommand};
}

export default useSocket;