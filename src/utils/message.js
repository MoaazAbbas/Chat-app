const genrateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const genrateLocation = (username, pos) => {
    return {
        username,
        url: `https://google.com/maps/@${pos.lat},${pos.long}`,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    genrateMessage,
    genrateLocation
}