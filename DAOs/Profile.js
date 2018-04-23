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
            this.db.query('UPDATE profile SET fname = ?, lname = ?, dob = ?, gender = ?, description = ? WHERE user_id = ?',
                [info.fname, info.lname, info.dob, info.gender, info.description, info.user_id],
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