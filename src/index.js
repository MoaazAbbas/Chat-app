const path     = require('path')
const http     = require ('http')
const express  = require('express')
const socketio = require('socket.io')
const {genrateMessage, genrateLocation} = require('./utils/message')
const {addUser, removeUser, fetchUser, fetchUserInRoom} = require('./utils/users')

const app    = express()
const server = http.createServer(app)
const io     = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))



io.on('connection', (socket) => {
    
    socket.on('join',({username, room}, callback) => {
        const {error, user} = addUser({
            id: socket.id,
            username,
            room
        })
        if(error){
         return  callback(error)
        }

        socket.join(user.room)
        socket.emit('message',genrateMessage('Admin',"Welcome"))
        socket.broadcast.to(user.room).emit('message', genrateMessage('Admin',`${user.username} has joined!`))

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: fetchUserInRoom(user.room)
        })

    callback()

    })

    socket.on('sendMessage',(message, callback) => {
        const {username,room} = fetchUser(socket.id)
        io.to(room).emit('message',genrateMessage(username, message))
        callback('Message Delivered')
    })
    socket.on('sendLocation',(position, callback) => {
        const user = fetchUser(socket.id)
        io.to(user.room).emit("locationMessage",genrateLocation(user.username, position))
        callback('Location Sent')
    })



    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message',genrateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: fetchUserInRoom(user.room)
            })
        }
    })
})


server.listen(port, () => {
    console.log(`it is working on port${port}`)
})