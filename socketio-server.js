const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store tenant socket mappings
const tenantSockets = new Map();



// Connection event handler
io.on('connection', (socket) => {
    const tenantId = socket.handshake.query.tenantId;
    
    if (tenantId) {
        tenantSockets.set(tenantId, socket.id);
        socket.tenantId = tenantId;
    }

    // Handle user login
    socket.on('user-login', (userId) => {
        socket.userId = userId;
        socket.emit('login-success', { userId });
    });

    // Handle client disconnection
    socket.on('disconnect', () => {
        if (socket.tenantId) {
            tenantSockets.delete(socket.tenantId);
        }
    });

    // Handle bigquery-job-complete event
    socket.on('bigquery-job-complete', (data) => {
        const { tenantId } = data;
        const targetSocketId = tenantSockets.get(tenantId);

        if (targetSocketId) {
            io.to(targetSocketId).emit('bigquery-job-complete', data);
        }
    });

    // Debug: Log all events
    socket.onAny((eventName, ...args) => {
        console.log(`[Socket.IO Event] ${eventName}:`, args);
    });
});

httpServer.listen(process.env.SOCKETIO_SERVER_PORT || 2323, () => {
    console.log(`Socket.IO server running on port ${process.env.SOCKETIO_SERVER_PORT || 2323}`);
});
