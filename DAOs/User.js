const bcrypt = require('bcrypt');

class User {
    constructor(db) {
        this.db = db;
    }

    register(info) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(info.password, 10, (err, hash) => {
                if (err) {
                    reject(err);
                    return;
                }

                console.log(`pw ${info.password} hash ${hash}`);

                this.db.query('INSERT INTO user (email, password) VALUES (?, ?)',
                    [info.email, hash],
                    (err, results) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(results);
                    });
            });
        });
    }

    login(creds) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT id, password FROM user WHERE email = ?',
                [creds.email],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (results[0]) {
                        let hash = results[0].password;
                        bcrypt.compare(creds.password, hash, (err, bool) => {
                            if (err) {
                                reject(err);
                                return; 
                            }

                            bool ? resolve(results[0].id) : resolve(0);
                        });
                    } else {
                        resolve(0);
                    }
                });
        });
    }

    logout(info) {
        console.log('User logged out!');
    }
}

module.exports = User