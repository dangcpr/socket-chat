const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);

let users = []

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.emit('success', { message: socket.id });

    socket.on('join', (user) => {
        if (!user || user == '') {
            socket.emit('join-success', {
                message: "Thất bại"
            })
            return;
        }
        console.log('socket ' + socket.id + ' is user: ' + user);

        socket.emit('join-success', {
            message: user
        })

        users.push({
            id: socket.id,
            user: user
        })

        console.log(users)

        
        socket.on('send-message', (data) => {
            console.log(data);
            for(i = 0; i < users.length; i++) {
                console.log(users[i].user);
                if(data.receive == users[i].user || data.sender == users[i].user) {
                    console.log(data);
                    socket.nsp.to(users[i].id).emit('receive-message', {
                        message: data.message,
                        sender: data.sender,
                        senderID: socket.id
                    })
                }
                
            }
        })
    })

    socket.on('disconnect', () => {
        console.log('user ' + socket.id + ' disconnected');
        users = users.filter(user => user.id != socket.id)
        console.log(users)
    })
});

app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
})
  
server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});