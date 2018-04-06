const fetch = require('node-fetch');

class RSAPI {
    constructor(address) {
        this.url = `http://${address}`;
    }

    getSimilarMoviesById(imdb_id) {
        return fetch(`${this.url}/similarToMovie?id=${imdb_id}`)
            .then(res => res.json())
            .catch(err => console.log(err))
    }
}

module.exports = RSAPI;