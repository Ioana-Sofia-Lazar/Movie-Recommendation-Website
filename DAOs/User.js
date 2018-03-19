class User {
    constructor(db) {
        this.db = db;
    }
    
    register(info) { 
        console.log('User registered!'); 
    }
    
    login(creds) {
        console.log('User logged in!'); 
    }
    
    logout(info) { 
        console.log('User logged out!'); 
    }
}

module.exports = User