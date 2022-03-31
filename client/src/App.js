import './App.css';
import {useEffect, useState} from "react";
import useSocket from "./socket";

function App() {
    const {message, currPos, state, sendCommand} = useSocket()
    const upPress = useKeyPress("ArrowUp", sendCommand);
    const downPress = useKeyPress("ArrowDown", sendCommand);
    const leftPress = useKeyPress("ArrowLeft", sendCommand);
    const rightPress = useKeyPress("ArrowRight", sendCommand);
  return (
    <div className="App">
        <div className={'state'}>
            {state.map((row,indexY)=>{
                return(
                    <div className={'row'} key={indexY}>
                    {row.map((box,indexX)=> {
                        const {focused, captured} = box
                        const current = currPos.x===indexX&&currPos.y===indexY
                        return(
                            <div key={indexX} className={`box ${focused ? 'focused' : ''} ${captured ? 'captured' : ''} ${current ? 'current' : ''} `}/>
                        )
                    })}
                    </div>
                )
            })}
        </div>
        <h3>{message}</h3>
    </div>
  );
}

function useKeyPress(targetKey, sendCommand) {
    const [keyPressed, setKeyPressed] = useState(false);
    function downHandler({key}) {
        if (key === targetKey) {
            setKeyPressed(true);
        }
    }
    const upHandler = ({key}) => {
        if (key === targetKey) {
            setKeyPressed(false);
            sendCommand(key)
        }
    };
    useEffect(() => {
        window.addEventListener("keydown", downHandler);
        window.addEventListener("keyup", upHandler);
        return () => {
            window.removeEventListener("keydown", downHandler);
            window.removeEventListener("keyup", upHandler);
        };
    }, []);
    return keyPressed;
}


export default App;
