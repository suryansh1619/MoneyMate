import React, { createContext, useState, useEffect } from 'react'
import axios from "axios";
import API_BASE_URL from "../config";

export const ThemeContext= new createContext();
export function ThemeProvider({ children }) {
    const [darktheme,settheme]=useState(false);
    const [loading, setLoading] = useState(true); 
    console.log(darktheme)
    useEffect(() => {
        const fetchTheme = async () => {
            try {
                const token = localStorage.getItem("token"); 
                if (!token) {
                    console.error("No token found");
                    return;
                }
                const response = await axios.get(`${API_BASE_URL}/theme`, { 
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true 
                });
                settheme(response.data.theme === "dark");
            } 
            catch (error) {
                console.error("Error fetching theme:", error);
            }
            finally {
                setLoading(false);
            }
        };
        fetchTheme();
    }, []);
    console.log(darktheme)
    const changetheme = async () => {
        const newTheme=!darktheme ? "dark" : "light"; 
        settheme(!darktheme);
        try {
            const token = localStorage.getItem("token"); 
            if (!token) {
                console.error("No token found. User not authenticated.");
                return;
            }
            await axios.put(`${API_BASE_URL}/theme`, 
                { theme: newTheme },
                { 
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true 
                });
        } 
        catch (error) {
            console.error("Error updating theme:", error);
        }
    };
    if (loading) return <p>Loading currency...</p>;
    return (
        <ThemeContext.Provider value={{darktheme,changetheme:changetheme}}>
            {children}
        </ThemeContext.Provider>
    )
}
