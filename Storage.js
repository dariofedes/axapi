const token = {
    _token: null,
    get token() {
        return this._token
    },
    set token(token) {
        this._token = token
    }
}

module.exports = token