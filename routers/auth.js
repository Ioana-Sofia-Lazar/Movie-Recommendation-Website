function validate(data) {
    let errors = [];

    for (let prop in data) {
        switch (prop) {
            case 'email':
                if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(data[prop])) {
                    errors.push('Please provide a valid email address!');
                }
                break;
            case 'password':
                if (data[prop].length < 5) {
                    errors.push('Password must have at least 5 characters!');
                }
                break;
            case 'lname':
            case 'fname':
                if (data[prop].length > 45) {
                    errors.push('Names must be at most 45 characters long!');
                }
                break;
            case 'dob':
                if (!/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(data[prop])) {
                    errors.push('Please provide a valid format for the date of birth! (YYYY-MM-DD)');
                }
                break;
            case 'gender':
                if (data[prop] !== 'male' && data[prop] !== 'female' && data[prop] !== 'other') {
                    errors.push('Please choose a valid gender!');
                }
                break;
            case 'description':
                if (data[prop].length > 140) {
                    errors.push('Description must be at most 140 characters long!');
                }
                break;
        }
    }

    return errors;
}

module.exports = function (user) {
    let router = require('express').Router();

    router.get('/login', async (req, res) => {
        res.render('login');
    });

    router.post('/loginAction', async (req, res) => {
        let email = req.body.email;
        let password = req.body.password;

        let creds = {
            email: email,
            password: password
        }

        let result = 0;
        try {
            result = await user.login(creds);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }

        if (result) {
            req.session.user_id = result;
            res.redirect('/profile');
        } else {
            res.redirect("/login");
        }
    });

    router.get('/logout', (req, res) => {
        // params.userLoggedIn = false;
        // params.viewingUserWithId = false;
        if (req.session.user_id) {
            req.session.destroy();
            res.redirect('/');
        } else {
            res.redirect('/login');
        }
    });

    router.get('/signUp', (req, res) => {
        res.render('sign-up');
    });

    router.post('/register', async (req, res) => {
        let email = req.body.email;
        let password = req.body.password;
        let confirm_password = req.body.confirm_password;
        let fname = req.body.fname;
        let lname = req.body.lname;
        let dob = req.body.dob;
        let gender = req.body.gender;
        let description = "";

        let info = {
            email: email,
            password: password,
            fname: fname,
            lname: lname,
            dob: dob,
            gender: gender,
            description: description
        }

        // validation
        let errors = validate(info);

        if (errors.length > 0) {
            res.render('sign-up', {
                errors: errors
            });
            return;
        }

        console.log("~register~ " + JSON.stringify(info));
        let result = 0;

        // check if email is already in use
        try {
            result = await user.emailAlreadyInUse(email);
        } catch (err) {
            // TODO error page
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }
        console.log("~email in use~  ", result);
        if (result) {
            // already in use
            res.render('sign-up', {
                errors: ['Please choose another email!'],
                filledInfo: info
            });
        }

        try {
            result = await user.register(info);
        } catch (err) {
            res.render('error', { errorMessage: `An error occured: ${err}` });
            return;
        }
        // try to register user
        if (result) {
            req.session.user_id = result;
            // params.userLoggedIn = true;
            res.redirect('/profile');
        } else {
            // redirect back to register page
            res.render('sign-up', {
                errors: ['Registration failed! Please try again!'],
                filledInfo: info
            });
        }
    });

    return router;
};