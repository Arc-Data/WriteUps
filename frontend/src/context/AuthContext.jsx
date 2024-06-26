import { createContext, useEffect, useState } from "react";
import axios from "../axios";
import { jwtDecode } from "jwt-decode"
import { useNavigate } from "react-router-dom";

const AuthContext = createContext()

export default AuthContext;

export const AuthProvider = ({children}) => {
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken') ? localStorage.getItem('authToken') : null)
    const [user, setUser] = useState(() => localStorage.getItem('authToken') ? jwtDecode(localStorage.getItem('authToken')).user : null)
    const [loading, setLoading] = useState(true)

    const navigate = useNavigate()

    const loginUser = async (data) => {
        try {
            const response = await axios.post(`/api/auth/login/`, data)
            const token = response.data.access_token
            const tokenData = jwtDecode(token)

            setUser(tokenData.user)
            setAuthToken(token)
            
            localStorage.setItem('authToken', token)

            navigate('/')
        } catch (error) {
            console.log("An error occured while logging in: ", error)
        }
    }

    const updateTokenOnUserUpdate = (token) => {
        const tokenData = jwtDecode(token)
        
        setUser(tokenData.user)
        setAuthToken(token)

        localStorage.setItem('authToken', token)

        navigate(`/profile/${tokenData.user.id}`)
    }

    const updateToken = async () => {
        const response = await axios.post('/api/auth/refresh/', null, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })

        if (response.status == 200) {
            const token = response.data.access_token
            const tokenData = jwtDecode(token)

            setAuthToken(response.data.access_token)
            setUser(tokenData.user)

            localStorage.setItem('authToken', token)
        } else {
            logoutUser()
        }

        if (loading) {
            setLoading(false)
        }
    }

    const logoutUser = () => {
        setAuthToken(null)
        setUser(null)
        localStorage.removeItem('authToken')
    }

    const registerUser = async (data) => {
        try {
            const response = await axios.post('/api/auth/register/', data)
            const token = response.data.access_token 
            const tokenData = jwtDecode(token)

            setUser (tokenData.user)
            setAuthToken(token)
            
            localStorage.setItem('authToken', token)

            navigate('/')
        }
        catch (error) {
            console.log("An error occured while registering user: ", error)
        }
    }

    const contextData = {
        loginUser,
        registerUser,
        logoutUser,
        updateToken,
        updateTokenOnUserUpdate,
        authToken,
        user,
    }

    useEffect(() => {
        const checkTokenExpiryAndRefresh = async () => {
            if (authToken) {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000);
                const decodedToken = jwtDecode(authToken)

                if (decodedToken.exp && currentTimeInSeconds + 120 > decodedToken.exp) {
                    try {
                        console.log("Token near timeout. Updating...")
                        await updateToken()
                        console.log("Token successfully updated.")
                    } catch (error) {
                        console.log("Token expired. Logging out...")
                        logoutUser()
                    }
                }
            }

            setLoading(false)
        }

        checkTokenExpiryAndRefresh();
        const threeMinutes = 1000 * 60 * 3
        const intervalId = setInterval(checkTokenExpiryAndRefresh, threeMinutes)
    
        return () => clearInterval(intervalId)
    }, [authToken, updateToken, updateTokenOnUserUpdate, logoutUser])

    return (
        <AuthContext.Provider value={contextData}>
            {loading ? null : children}
        </AuthContext.Provider>
    )
}