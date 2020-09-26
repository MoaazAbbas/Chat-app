const socket = io()

// Elements 

const $messageForm = document.querySelector('form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


// templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML  

// options 

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})


// auto scrolling

const autoScroll = () => {
    // new message element
    const $newMessage = $messages.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    //visable height
    const visableHeight = $messages.offsetHeight
    //Height of the message Container
    const containerHeight = $messages.scrollHeight
    // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visableHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}




socket.on('message',(message) => {
    console.log(message)
    
    const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})  

socket.on('locationMessage',(message)=> {
    console.log(message)
    const html = Mustache.render(locationTemplate,{
        username: message.username,
        url: message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
 
$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (deliver) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        console.log(deliver)
    })
})

socket.emit('locationMessage', '')

$sendLocationButton.addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        alert('Your Browser doesnot support getting location')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        const {latitude,longitude} = position.coords
        socket.emit('sendLocation', {lat:latitude, long:longitude},(certin)=> {
            $sendLocationButton.removeAttribute('disabled')
            console.log(certin)
        })
    })
})

socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = "/"
    }
})
