import React, { useEffect, useState } from 'react';

const Notification = (props) => {
    const [exit, setExit] = useState(false)
    const [width, setWidth] = useState(0)
    const [intervalId, setIntervalId] = useState(null)

    const handleStartTimer = () => {
        const id = setInterval(() => {
            setWidth((prev) => {
                if (prev < 100) {
                    return prev + 0.5
                }
                clearInterval(id)
                return prev
            })
        }, 20)
        setIntervalId(id)
    }

    const handlePauseTimer = () => {
        clearInterval(intervalId)
    }

    const handleCloseNotification = () => {
        handlePauseTimer()
        setExit(true)
        setTimeout(() => {
            props.dispatch({
                type: "REMOVE_NOTIFICATION",
                id: props.id
            })
        }, 400)
    }

    const openLink = () => {
        window.open(props.link, "_blank")
    }

    useEffect(() => {
        if (width == 100){
            handleCloseNotification()
        }
    }, [width])

    useEffect(() => {
        handleStartTimer()
    }, [])

    return (
        <div 
            onMouseEnter={handlePauseTimer} 
            onMouseLeave={handleStartTimer} 
            onClick={props.link != "" ? openLink : undefined} 
            className={`notification-item ${
                props.type === "SUCCESS" ? "success" : props.type === "ERROR" ? "error" : "neutral"
            } ${exit ? "exit" : ""} `}
        >
            <p>{props.message}</p>
            <div className='bar' style={{ width: `${width}%` }}></div>
        </div>
    )
}

export default Notification