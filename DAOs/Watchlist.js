class Watchlist {
    constructor(db) {
        this.db = db;
    }

    getListById(user_id) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT movie_id FROM watchlist WHERE user_id = ?',
                [user_id],
                (err, results) => { 
                    if (err) {
                        reject(err);
                        return;
                    }

                    results ? resolve(results) : resolve(0);
                });
        });
    }

    userHasMovie(info) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT movie_id FROM watchlist WHERE user_id = ? and movie_id = ?',
                [info.user_id, info.movie_id],
                (err, results) => { 
                    if (err) {
                        reject(err);
                        return;
                    }

                    results[0] ? resolve(true) : resolve(false);
                });
        });
    }

    addToWatchlist(info) {
        return new Promise((resolve, reject) => {
            this.db.query('INSERT INTO watchlist (user_id, movie_id) VALUES (?,?)',
                [info.user_id, info.movie_id],
                (err, results) => { 
                    if (err) {
                        reject(err);
                        return;
                    }

                    results ? resolve(results) : resolve(0);
                });
        });
    }

    removeFromWatchlist(info) {
        return new Promise((resolve, reject) => {
            this.db.query('DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?',
                [info.user_id, info.movie_id],
                (err, results) => { 
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    results ? resolve(results) : resolve(0);
                });
        });
    }
}

module.exports = Watchlist;