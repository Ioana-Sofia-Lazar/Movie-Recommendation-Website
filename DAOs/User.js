class User {
    constructor(db) {
        this.db = db;
    }

    register(info) {
        console.log('User registered!');
    }

    login(creds) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT id FROM user WHERE email = ? AND password = ?',
                [creds.email, creds.password],
                (err, results) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(results[0].id);
                });

        });
    }

    logout(info) {
        console.log('User logged out!');
    }
}

module.exports = User