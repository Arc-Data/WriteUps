import { useContext, useEffect, useState } from "react"
import AuthContext from '../context/AuthContext'
import useNotificationManager from "../hooks/useNotificationManager"
import Spinner from '../components/Spinner'
import axios from "../axios"
import dayjs from "../utils/dayjs"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsis } from "@fortawesome/free-solid-svg-icons"

const Notifications = () => {
    const { authToken } = useContext(AuthContext)
    const { notifications, loading, getNotifications } = useNotificationManager(authToken)

    const handleClick = async () => {
        try {
            const response = await axios.post('/api/notifications/test', null, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            })

        }
        catch (error) {
            console.log("An error occured: ", error)
        }
    }

    useEffect(() => {
        getNotifications()
    }, [])


    if (loading) {
        return (
            <Spinner />
        )
    }

    return (
        <div>
            <button className="px-2 py-2 rounded hover:cursor-pointer bg-primary" onClick={handleClick}>Test Button</button>
            {notifications.map(notification => {
                return (
                    <div 
                        className="flex items-center gap-4 px-2 py-4 mt-2 bg-gray-700 border border-transparent rounded shadow hover:cursor-pointer bg-opacity-20" key={notification.id}>
                        <div></div>
                        <img src={notification.user.image} className="object-cover w-10 h-10 rounded-full"/>
                        <p className="flex-1">{notification.data.message}</p>
                        <div className="text-right">
                            <p className="text-xs">{dayjs(notification.created_at).fromNow()}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default Notifications