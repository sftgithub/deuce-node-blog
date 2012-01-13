var mongoose     = require('mongoose'),
    mongooseAuth = require('mongoose-auth');

// Github user schema
var Schema   = mongoose.Schema,
    ObjectId = Schema.ObjectId;
    
var UserSchema = new Schema({
  isLoggedIn: { type: Boolean, default: false }
}),
    User;

UserSchema.plugin(mongooseAuth, {
  everymodule: {
    everyauth: {
      User: function() {
        return User;
      },
      // Custom Logout Function to update isLoggedIn
      handleLogout: function (req, res) {
        var errors = [];

        if (req.user) {
          req.user.isLoggedIn = false;
          req.user.save(function (err, user) {
            if (err) errors.push(err.message || err);
          });
        }

        req.logout();
        res.writeHead(303, { 'Location': this.logoutRedirectPath() });
        res.end();
      }
    }
  },

  twitter: {
    everyauth: {
      myHostname: 'http://local.host:3000',
      consumerKey: 'nRXegDklkkbY5OOFnmThag',
      consumerSecret: '4Ndh9WosIwKN6glDWLMUwBdsFyy3E4kZp6THrPurg',
      redirectPath: '/'
    }
  },

  github: {
    everyauth: {
      myHostname: 'http://local.host:3000',
      appId: '057051d9a1afc75fba6d',
      appSecret: 'ab560e867fa23c0b408ba7fdfc9bed77a9596c6c',
      redirectPath: '/'
    }
  },

  password: {
    loginWith: 'email',
      extraParams: {
        name: {
          first: String,
          last: String
        }
      },
      
    everyauth: {
      getLoginPath: '/login',
      postLoginPath: '/login',
      loginView: 'login.jade',
      getRegisterPath: '/register',
      postRegisterPath: '/register',
      registerView: 'register.jade',
      loginSuccessRedirect: '/',
      registerSuccessRedirect: '/',
      loginLocals: {
        title: 'Login'
      },
      registerLocals: {
        title: 'Register'
      },

      // Custom Authenticate Function to Update isLoggedIn
      authenticate: function (login, password) {
        var promise
          , errors = [];
        if (!login) errors.push('Missing login.');
        if (!password) errors.push('Missing password.');
        if (errors.length) return errors;

        promise = this.Promise();
        this.User()().authenticate(login, password, function (err, user) {
          if (err) {
            errors.push(err.message || err);
            return promise.fulfill(errors);
          }
          if (!user) {
            errors.push('Failed login.');
            return promise.fulfill(errors);
          }

          // Update isLoggedIn
          user.isLoggedIn = true;

          // Save the Update
          user.save(function (err, user) {
            promise.fulfill(user);
          });

        });
        return promise;
      }
    }
  }
})

// Create the user
User = mongoose.model('auth-users', UserSchema);