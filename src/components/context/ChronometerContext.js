import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bearerAuth } from '../../apis/AuthApi';
import { instance } from '../../apis/adminApi';

const ChronometerContext = createContext();

export const ChronometerProvider = ({ children }) => {
    const Auth = useAuth();
    const user = Auth.getUser();
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [chronometerId, setChronometerId] = useState(null);
    const [isPaused, setIsPaused] = useState(false);

    const fetchStatus = async () => {
        const chronometerId = localStorage.getItem("chronometerId");
        const storedElapsedTime = localStorage.getItem("elapsedTime");

        if (!chronometerId) return;

        try {
            const response = await instance.get(`/api/v1/chronometers/status/${chronometerId}`, {
                headers: {
                    'Authorization': bearerAuth(user),
                    'Content-type': 'application/json'
                }
            });

            const { pause, running, elapsedTime, startTime } = response.data;
            setIsRunning(running);
            setIsPaused(pause);
            setChronometerId(chronometerId);

            if (running && !pause) {
                const currentElapsedTime = Date.now() - startTime + elapsedTime;
                setTime(currentElapsedTime);
            } else {
                setTime(storedElapsedTime ? parseInt(storedElapsedTime, 10) : elapsedTime);
            }
        } catch (error) {
            console.error("Failed to fetch timer status:", error);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const startTimer = async (chronometerRequest) => {
        try {
            const response = await instance.post('/api/v1/chronometers/start', chronometerRequest, {
                headers: {
                    'Authorization': bearerAuth(user),
                    'Content-type': 'application/json'
                }
            });
            const newChronometerId = response.data.id;

            setChronometerId(newChronometerId);
            localStorage.setItem("chronometerId", newChronometerId);
            setIsRunning(true);
            setIsPaused(false);
            setTime(0);
            localStorage.removeItem("elapsedTime");
        } catch (error) {
            console.error("Failed to start timer:", error);
        }
    };

    const stopTimer = async () => {
        const chronometerId = localStorage.getItem("chronometerId");
        if (!chronometerId) return;

        try {
            await instance.post(`/api/v1/chronometers/stop/${chronometerId}`, null, {
                headers: {
                    'Authorization': bearerAuth(user),
                    'Content-type': 'application/json'
                }
            });
            setIsRunning(false);
            setIsPaused(false);
            setTime(0);
            localStorage.removeItem("chronometerId");
            localStorage.removeItem("elapsedTime");
        } catch (error) {
            console.error("Failed to stop timer:", error);
        }
    };

    const pauseTimer = async () => {
        const chronometerId = localStorage.getItem("chronometerId");
        if (!chronometerId) return;

        try {
            await instance.put(`/api/v1/chronometers/${chronometerId}/pause`, null, {
                headers: {
                    'Authorization': bearerAuth(user),
                    'Content-type': 'application/json'
                }
            });
            setIsPaused(true);
            localStorage.setItem("elapsedTime", time.toString());
        } catch (error) {
            console.error("Failed to pause timer:", error);
        }
    };

    const resumeTimer = async () => {
        const chronometerId = localStorage.getItem("chronometerId");
        if (!chronometerId) return;

        try {
            await instance.put(`/api/v1/chronometers/${chronometerId}/resume`, null, {
                headers: {
                    'Authorization': bearerAuth(user),
                    'Content-type': 'application/json'
                }
            });
            setIsPaused(false);
            setIsRunning(true);

            const storedElapsedTime = localStorage.getItem("elapsedTime");
            if (storedElapsedTime) {
                setTime(parseInt(storedElapsedTime, 10));
            }
        } catch (error) {
            console.error("Failed to resume timer:", error);
        }
    };

    useEffect(() => {
        let intervalId;
        if (isRunning && !isPaused) {
            intervalId = setInterval(() => {
                setTime((prevTime) => prevTime + 1000);
            }, 1000);
        }
        return () => clearInterval(intervalId);
    }, [isRunning, isPaused]);

    return (
        <ChronometerContext.Provider value={{ time, isRunning, isPaused, startTimer, stopTimer, pauseTimer, resumeTimer }}>
            {children}
        </ChronometerContext.Provider>
    );
};

export const useChronometer = () => useContext(ChronometerContext);
