import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    
    // CRITICAL: Use a single ref for the interval to prevent duplicates
    const intervalRef = useRef(null);
    
    // CRITICAL: Track if we're currently fetching to prevent race conditions
    const isFetchingRef = useRef(false);

    /**
     * Clear the current interval - prevents multiple intervals running
     */
    const clearCurrentInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    /**
     * Parse ISO 8601 duration format (PT1H2M3S) to milliseconds
     */
    const parseDuration = (duration) => {
        if (typeof duration !== 'string' || !duration.startsWith('PT')) {
            return typeof duration === 'number' ? duration : 0;
        }
        
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?/);
        if (!match) return 0;

        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseFloat(match[3]) : 0;

        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    };

    /**
     * Fetch current chronometer status from server
     */
    const fetchStatus = async () => {
        // Prevent concurrent fetches
        if (isFetchingRef.current) return;
        
        const storedChronometerId = localStorage.getItem("chronometerId");
        if (!storedChronometerId) return;

        isFetchingRef.current = true;

        try {
            const response = await instance.get(`/api/v1/chronometers/status/${storedChronometerId}`, {
                headers: {
                    'Authorization': bearerAuth(user),
                    'Content-type': 'application/json'
                }
            });

            const { pause, running, elapsedTime } = response.data;
            
            setChronometerId(storedChronometerId);
            setIsRunning(running);
            setIsPaused(pause);

            // Parse elapsed time (handle both ISO 8601 duration and milliseconds)
            const elapsedMs = parseDuration(elapsedTime);
            
            // CRITICAL FIX: Only set time from server, don't add anything to it
            // The interval will handle incrementing from here
            setTime(elapsedMs);

        } catch (error) {
            console.error("Failed to fetch timer status:", error);
        } finally {
            isFetchingRef.current = false;
        }
    };

    /**
     * Initialize: Load saved chronometer on mount
     */
    useEffect(() => {
        fetchStatus();

        // Refetch when page becomes visible or focused
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchStatus();
            }
        };
        const handleFocus = () => {
            fetchStatus();
        };
        
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            clearCurrentInterval();
        };
    }, []);

    /**
     * Start a new chronometer
     */
    const startTimer = async (chronometerRequest) => {
        // Prevent starting if already running
        if (isRunning) {
            console.warn("Timer is already running");
            return;
        }

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

            return response.data; // caller can read monitoringSessionId from here
        } catch (error) {
            console.error("Failed to start timer:", error);
            return null;
        }
    };

    /**
     * Stop the chronometer
     */
    const stopTimer = async () => {
        const storedChronometerId = localStorage.getItem("chronometerId");
        if (!storedChronometerId) return null;

        try {
            // CRITICAL: Clear interval immediately before API call
            clearCurrentInterval();

            const response = await instance.put(`/api/v1/chronometers/stop/${storedChronometerId}`, null, {
                headers: {
                    'Authorization': bearerAuth(user),
                    'Content-type': 'application/json'
                }
            });
            
            // Reset all state
            setIsRunning(false);
            setIsPaused(false);
            setTime(0);
            setChronometerId(null);
            localStorage.removeItem("chronometerId");
            localStorage.removeItem("elapsedTime");
            
            return response.data;
        } catch (error) {
            console.error("Failed to stop timer:", error);
            
            // Clear state even if API fails
            clearCurrentInterval();
            setIsRunning(false);
            setIsPaused(false);
            setTime(0);
            setChronometerId(null);
            localStorage.removeItem("chronometerId");
            localStorage.removeItem("elapsedTime");
            
            return null;
        }
    };

    /**
     * Pause the chronometer
     */
    const pauseTimer = async () => {
        const storedChronometerId = localStorage.getItem("chronometerId");
        if (!storedChronometerId) return;

        try {
            // CRITICAL: Clear interval when pausing
            clearCurrentInterval();

            await instance.put(`/api/v1/chronometers/${storedChronometerId}/pause`, null, {
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

    /**
     * Resume the chronometer
     */
    const resumeTimer = async () => {
        const storedChronometerId = localStorage.getItem("chronometerId");
        if (!storedChronometerId) return;

        try {
            await instance.put(`/api/v1/chronometers/${storedChronometerId}/resume`, null, {
                headers: {
                    'Authorization': bearerAuth(user),
                    'Content-type': 'application/json'
                }
            });
            
            setIsPaused(false);
            setIsRunning(true);
            localStorage.removeItem("elapsedTime");
        } catch (error) {
            console.error("Failed to resume timer:", error);
        }
    };

    /**
     * CRITICAL: Interval management - this is where the time increments
     * This effect runs whenever isRunning or isPaused changes
     */
    useEffect(() => {
        // Always clear any existing interval first
        clearCurrentInterval();

        // Only start interval if running and not paused
        if (isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                // CRITICAL: Simple increment by 1000ms (1 second)
                // This is the ONLY place where we add to the time
                setTime((prevTime) => prevTime + 1000);
            }, 1000);
        }

        // Cleanup when component unmounts or dependencies change
        return () => {
            clearCurrentInterval();
        };
    }, [isRunning, isPaused]);

    return (
        <ChronometerContext.Provider value={{ 
            time, 
            isRunning, 
            isPaused, 
            chronometerId,
            startTimer, 
            stopTimer, 
            pauseTimer, 
            resumeTimer 
        }}>
            {children}
        </ChronometerContext.Provider>
    );
};

export const useChronometer = () => {
    const context = useContext(ChronometerContext);
    if (!context) {
        throw new Error('useChronometer must be used within a ChronometerProvider');
    }
    return context;
};