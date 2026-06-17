const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

// middleware
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// In-memory task storage

let tasks = [
    {
        id: "1",
        title: "Initial task",
        description: "Welcome to your Kanban board! This is a sample task to get you started.",
        status: "To Do",
        priority: "High",
        category: "Feature",
        attachments: []
    }
];


// validateTask function
const VALID_STATUSES = ["To Do", "In Progress", "Done"];
const VALID_PRIORITIES = ["Low", "Medium", "High"];
const VALID_CATEGORIES = ["Bug", "Feature", "Enhancement"];


/**
 * validateTask - Validates a task object for required fields and valid values.
 * @param {Object} task - The task object to validate.
 * @param {boolean} isNew - Whether this is a new task (true) or an update (false).
 * @return {string|null} - Returns an error message if validation fails, or null if valid.
 */

function validateTask(task, requireTitle = true) {
    if (!task || typeof task !== "object") return "Invalid task data";
    if (requireTitle && (!task.title || typeof task.title !== "string" || !task.title.trim())) {
        return "Task title is required";
    }
    if (task.status && !VALID_STATUSES.includes(task.status)) {
        return `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`;
    }
    if (task.priority && !VALID_PRIORITIES.includes(task.priority)) {
        return `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(", ")}`;
    }
    if (task.category && !VALID_CATEGORIES.includes(task.category)) {
        return `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`;
    }
    return null;
}



//websocket connection
io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);


    socket.emit("sync:task", tasks);


    // Creating a new task
    socket.on("create:task", (task) => {
        const error = validateTask(task);
        if (error) {
            socket.emit("error", error);
            return;
        }
        const newtask = {
            id: Date.now().toString(),
            title: task.title.trim(),
            description: task.description || "",
            status: task.status || "To Do",
            priority: task.priority || "Medium",
            category: task.category || "Feature",
            attachments: task.attachments || [],
        };
        tasks.push(newtask);
        socket.emit("task:created", newtask);
    });

    // upgrade task
    socket.on("task:update", (updatedTask) => {
        if (!updatedTask || !updatedTask.id) {
            socket.emit("error", { event: "task:update", message: "Task ID is required" });
            return;
        }
        const error = validateTask(updatedTask, false);
        if (error) {
            socket.emit("error", { event: "task:update", message: error });
            return;
        }
        const index = tasks.findIndex((t) => t.id === updatedTask.id);
        if (index === -1) {
            socket.emit("error", { event: "task:update", message: "Task not found" });
            return;
        }
        tasks[index] = { ...tasks[index], ...updatedTask };
        io.emit("task:updated", tasks[index]);
    });

    // move task between collumns
    socket.on("task:move", ({ taskId, newStatus }) => {
        if (!taskId || !newStatus) {
            socket.emit("error", { event: "task:move", message: "taskId and newStatus are required" });
            return;
        }

        if (!VALID_STATUSES.includes(newStatus)) {
            socket.emit("error", {
                event: "task:move",
                message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
            });
            return;
        }

        let movedTask;
        tasks = tasks.map((task) => {
            if (task.id === taskId) {
                movedTask = { ...task, status: newStatus };
                return movedTask;
            }
            return task;
        });

        if (movedTask) {
            io.emit("task:moved", movedTask);
        } else {
            socket.emit("error", { event: "task:move", message: "Task not found" });
        }
    });

    // delete task
    socket.on("task:delete", (taskId) => {
        if (!taskId) {
            socket.emit("error", { event: "task:delete", message: "Task ID is required" });
            return;
        }

        const existed = tasks.some((t) => t.id === taskId);
        if (!existed) {
            socket.emit("error", { event: "task:delete", message: "Task not found" });
            return;
        }

        tasks = tasks.filter((task) => task.id !== taskId);
        io.emit("task:deleted", taskId);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
    res.json({ status: "ok", taskCount: tasks.length });
});

// Serve frontend build files in production if they exist
const fs = require('fs');
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}







const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = { app, server, io };