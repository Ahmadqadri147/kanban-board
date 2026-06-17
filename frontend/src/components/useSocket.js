import io from 'socket.io-client'
import { useState, useEffect, useCallback, useRef } from 'react'

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3000' : '');

export function useSocket() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    const [connected, setConnected] = useState(false)
    const [error, setError] = useState(null)
    const socketRef = useRef()

    useEffect(() => {
        const socket = io(SOCKET_URL);
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            setError(null);
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socket.on('connect_error', () => {
            setConnected(false);
            setError('Unable to connect to server');
        });

        socket.on('sync:task', (initialTasks) => {
            setTasks(initialTasks);
            setLoading(false);
        });

        socket.on('task:created', (task) => {
            setTasks((prev) => [...prev, task]);
        });

        socket.on('task:updated', (updatedTask) => {
            setTasks((prev) =>
                prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
        });

        socket.on('task:moved', (movedTask) => {
            setTasks((prev) =>
                prev.map((t) => (t.id === movedTask.id ? movedTask : t))
            );
        });

        socket.on('task:deleted', (taskId) => {
            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        });

        socket.on('error', (err) => {
            setError(err.message || err);
            setTimeout(() => setError(null), 5000);
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('sync:task');
            socket.off('task:created');
            socket.off('task:updated');
            socket.off('task:moved');
            socket.off('task:deleted');
            socket.off('error');
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);


    const createTask = useCallback((task) => {
        if (socketRef.current) socketRef.current.emit('create:task', task);
    }, []);

    const updateTask = useCallback((task) => {
        if (socketRef.current) socketRef.current.emit('task:update', task);
    }, []);

    const moveTask = useCallback((taskId, newStatus) => {
        if (socketRef.current) socketRef.current.emit('task:move', { taskId, newStatus });
    }, []);

    const deleteTask = useCallback((taskId) => {
        if (socketRef.current) socketRef.current.emit('task:delete', taskId);
    }, []);

    return {
        tasks,
        loading,
        connected,
        error,
        createTask,
        updateTask,
        moveTask,
        deleteTask,
    };
}

export { io, SOCKET_URL };
export default useSocket;
