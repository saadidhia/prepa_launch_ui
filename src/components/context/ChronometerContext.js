import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'
import { bearerAuth } from '../../apis/AuthApi'
import { instance } from '../../apis/adminApi';


const ChronometerContext = createContext();

export const ChronometerProvider = ({ children }) => {

    const Auth = useAuth()
    const user = Auth.getUser()
    const [time, setTime] = useState(0);       // Elapsed time in milliseconds
    const [isRunning, setIsRunning] = useState(false);
    const [chronometerId, setChronometerId] = useState(null); // Added chronometerId state


    const fetchStatus = async () => {
        console.log("Starting Chronometer...");
     //   console.log("IDDDDDDDDDDDDDDDDDD", chronometerId)
       let chronometerId= localStorage.getItem("chronometerId")
         console.log("IDDDDDDDDDDDDDDDDDD", chronometerId)
        if (!chronometerId || chronometerId=== null) return; // Do nothing if chronometerId is not set
        try {
            const response = await instance.get(`/api/v1/chronometer/status/${chronometerId}`, { headers: {
                'Authorization': bearerAuth(user),
                'Content-type': 'application/json'
              }});
            
            const { running, elapsedTime, startTime } = response.data;
            console.log("status "+JSON.stringify(response.data, null, 2));


            setIsRunning(running);
            if (running) {
                // If the timer is running, calculate the current elapsed time
                console.log("running ...." + running)
                const currentElapsedTime = Date.now() - startTime + elapsedTime;
                setTime(currentElapsedTime);
            } else {
                setTime(elapsedTime);
            }
        } catch (error) {
            console.error("Failed to fetch timer status:", error);
        }
        console.log("FREEEE PALESTINE")
    };

    // Initialize timer status when the app loads
    useEffect(() => {
        fetchStatus();
    }, []);

    // Start the timer
    const startTimer = async (chronometerRequest) => {
        try {
            const  response = await instance.post('/api/v1/chronometers/start',chronometerRequest,  {
                headers: {
                  'Authorization': bearerAuth(user),
                  'Content-type': 'application/json'
                }});
               console.log("chrono "+JSON.stringify(response.data, null, 2));
            const newChronometerId = response.data.id; // Assuming API returns the chronometerId

            setChronometerId(newChronometerId);
            localStorage.setItem("chronometerId", newChronometerId)
            setIsRunning(true);
            setTime(0);
        } catch (error) {
            console.error("Failed to start timer:", error);
        }
    };

    // Stop the timer
    const stopTimer = async () => {
      
        let chronometerId=localStorage.getItem("chronometerId")
        if (!chronometerId || chronometerId=== null) return; // Do nothing if chronometerId is not set
        try {
            await instance.post(`/api/v1/chronometers/stop/${chronometerId}`,null,{
                headers: {
                  'Authorization': bearerAuth(user),
                  'Content-type': 'application/json'
                }});
            setIsRunning(false);
            localStorage.removeItem("chronometerId")
        } catch (error) {
            console.error("Failed to stop timer:", error);
        }
    };

    // Reset the timer
    const resetTimer = async () => {
        try {
            await instance.post('/api/v1/chronometers/reset');
            setIsRunning(false);
            setTime(0);
        } catch (error) {
            console.error("Failed to reset timer:", error);
        }
    };

    // Update time locally if the timer is running
    useEffect(() => {
        let intervalId;
        if (isRunning) {
            intervalId = setInterval(() => {
                setTime((prevTime) => prevTime + 1000); // Increment by 1 second
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isRunning]);

    return (
        <ChronometerContext.Provider value={{ time, isRunning, startTimer, stopTimer, resetTimer }}>
            {children}
        </ChronometerContext.Provider>
    );
};

export const useChronometer = () => useContext(ChronometerContext);


///////////////////////// PAUSE TO DO