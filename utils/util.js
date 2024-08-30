function getTknFromHeader(requestToken) {
    return requestToken.authorization?.split(" ")[1];
}

module.exports = {
    getTknFromHeader
}