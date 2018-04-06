const fetch = require('node-fetch');

class RSAPI {
    constructor(address) {
        this.url = `http://${address}`;
    }

    getSimilarMoviesById(imdb_id) {
        return fetch(`${this.url}:5002/similarToMovie?id=${imdb_id}`, {
            headers: {
                Token: '5UP3R53CR37'
            }
        })
            .then(res => res.json())
            .catch(err => console.log(err))
    }
}

module.exports = RSAPI;