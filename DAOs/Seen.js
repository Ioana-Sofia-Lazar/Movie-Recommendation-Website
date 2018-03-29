class Seen {
    constructor(db) {
        this.db = db;
    }

    getListById(user_id) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT movie_id, rating FROM seen WHERE user_id = ?',
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

    addToSeen(info) {
        return new Promise((resolve, reject) => {
            this.db.query('INSERT INTO seen (user_id, movie_id, rating) VALUES (?,?,?)',
                [info.user_id, info.movie_id, info.rating],
                (err, results) => { 
                    if (err) {
                        reject(err);
                        return;
                    }

                    results ? resolve(results) : resolve(0);
                });
        });
    }

    removeFromSeen(info) {
        return new Promise((resolve, reject) => {
            this.db.query('DELETE FROM seen WHERE user_id = ? AND movie_id = ?',
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

module.exports = Seen