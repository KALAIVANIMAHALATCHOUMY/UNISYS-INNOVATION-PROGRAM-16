import React from 'react'
import { Typewriter, useTypewriter } from 'react-simple-typewriter'
import './typewritter.css';

export function TypeWritterEffect({text,typeUserorBot}) {
    console.log("typeUserorBot",typeUserorBot)
    const [ typeEffect ] = useTypewriter({
        // words:["React Dev", "Mobile Dev","Next js Dev"],
        words:[text],
        // loop:{},
        typeSpeed: 10,  // here reduce the value so typing will be so speed
        // autoStartDelay: 0,
        // typingDelayMillis: 50,
        cursor: true, 
        cursorStyle: '_',  // Set a custom cursor style (optional)
        // cursorBlinking: true,
        // deleteSpeed: 40,
    })

    return (
        <div>
            <p className={ typeUserorBot === 'user' ? 'user' : 'bot' }  >
             {typeEffect}
            </p>
            {/* <Typewriter
            words={[text]}
            // loop={5}
            cursor
            cursorStyle='|'
            typeSpeed={100}
            // deleteSpeed={50}
            // delaySpeed={1000}
          /> */}
        </div>
    )
}