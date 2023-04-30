module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('recordinfo').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            recordinfo: result
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// message board routes ===============================================================

app.post('/recordinfo', (req, res) => {
  db.collection('recordinfo').insertOne({name: req.body.name, album: req.body.album, artist: req.body.artist, link: req.body.link, image: req.body.image, cost: req.body.cost}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/profile')
  })
})



app.put('/recordinfo/budget', (req, res) => {

  console.log(req.body.budget, req.user.local.budget, req.user.local.email)
  db.collection('users').findOneAndUpdate(
    
    { 'local.email': req.user.local.email },
    { $set: { 'local.budget': req.body.budget } },
    { upsert: true },
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error updating budget');
      } else {
        res.send(result);
      }
    }
  );
});

app.put('/recordinfo/budget', (req, res) => {
  db.collection('users').findOneAndUpdate(
    { 'local.email': req.user.local.email, 'local.budget': req.body.budget  },
    { $set: { 'local.budget': req.body.budget } },
    { returnOriginal: false, sort: { _id: -1 }, upsert: true },
    (err, result) => {
      if (err) return res.send(err);
      res.send(result);
    }
  );
});

    app.delete('/recordinfo', (req, res) => {
      db.collection('recordinfo').findOneAndDelete({name: req.body.name, album: req.body.album}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
