const fetch = require('node-fetch');

class RSAPI {
    constructor(address) {
        this.url = `http://${address}`;
    }

    getSimilarMoviesById(imdb_id, num) {
        num = num || 10;
        return fetch(`${this.url}:5002/similarToMovie?id=${imdb_id}&num=${num}`, {
            headers: {
                Token: '5UP3R53CR37'
            }
        })
            .then(res => res.json())
            .catch(err => console.log(err))
    }

    getRecommendations(ratings) {
        return fetch(`${this.url}:5002/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Token: '5UP3R53CR37'
            },
            body: JSON.stringify(ratings)
        })
            .then(res => res.json())
            .catch(err => console.log(err))
    }
}

module.exports = RSAPI;