class Profile {
    constructor(db) {
        this.db = db;
    }

    getProfileById(user_id) {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT fname, lname, dob, photo, gender, description FROM profile WHERE user_id = ?',
                [user_id],
                (err, results) => { 
                    if (err) {
                        reject(err);
                        return;
                    }

                    results[0] ? resolve(results[0]) : resolve(0);
                });
        });
    }

    updateProfile(info) {
        return new Promise((resolve, reject) => {
            this.db.query('UPDATE profile SET fname = ?, lname = ?, dob = ?, gender = ?, description = ?, photo = ? WHERE user_id = ?',
                [info.fname, info.lname, info.dob, info.gender, info.description, info.photo, info.user_id],
                (err, results) => { 
                    if (err) {
                        reject(err);
                        return;
                    }

                    results ? resolve(results) : resolve(0);
                });
        });
    }

    getMostActiveUserProfiles() {
        return new Promise((resolve, reject) => {
            this.db.query('SELECT p.* FROM profile p JOIN (SELECT user_id, COUNT(*) AS count FROM seen GROUP BY user_id) s ON (s.user_id = p.user_id) ORDER BY s.count DESC LIMIT 9;',
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

module.exports = Profile;