import React,{ createContext, useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config";

export const currencyList = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];
export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchCurrency = async () => {
        try {
            const token = localStorage.getItem("token"); 
            if (!token) {
            console.error("No token found");
            return;
            }
            const response = await axios.get(`${API_BASE_URL}/currency`,{
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
            });
            const userCurrency = currencyList.find(c => c.code === response.data.currency);
            setCurrency(userCurrency);
        } 
        catch (error) {
            console.error("Error fetching currency:", error);
        }
        finally {
            setLoading(false);
        }
        };
        fetchCurrency();
    }, []);

    const changeCurrency = async (newCurrency) => {
        setCurrency(newCurrency);
        try {
        const token = localStorage.getItem("token"); 
        if (!token) {
            console.error("No token found. User not authenticated.");
            return;
        }
        await axios.put(`${API_BASE_URL}/currency`, 
            { currency: newCurrency.code },
            { 
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true 
            });
        } catch (error) {
        console.error("Error updating currency:", error);
        }
    };
    if (loading) return <p>Loading currency...</p>;
    return (
        <CurrencyContext.Provider value={{ currency, changeCurrency, currencyList }}>
        {children}
        </CurrencyContext.Provider>
    );
};
