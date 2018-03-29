const fetch = require('node-fetch');

class OMDb {
    constructor(key) {
        this.url = `http://www.omdbapi.com/?apikey=${key}&`;
    }

    getMovieById(imdb_id) {
        return fetch(`${this.url}i=${imdb_id}`)
            .then(res => res.json())
            .catch(err => console.log(err))
    }

    getMovieByTitle(title) {
        return fetch(`${this.url}t=${urlencode(title)}`)
            .then(res => res.json())
            .catch(err => console.log(err))
    }
}

module.exports = OMDb;