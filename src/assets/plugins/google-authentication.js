
$tools.loadScript("assets/ext/util/apis.google.com.platform.js", () => {
    window.plugins.auth = {

        onSuccessfulSignIn: function (googleUser) {
            let profile = googleUser.getBasicProfile();
            console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
            console.log('Name: ' + profile.getName());
            console.log('Image URL: ' + profile.getImageUrl());
            console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
            ide.setUser({
                id: profile.getId(),
                firstName: profile.getGivenName(),
                lastName: profile.getFamilyName(),
                email: profile.getEmail(),
                imageUrl: profile.getImageUrl()
            });
            ide.synchronize();
        },

        start: function () {
            ide.setAuthentication(true);
            gapi.load('auth2', function () {
                console.info("initializing Google OAuth2")
                gapi.auth2.init({
                    client_id: "1021494562283-h7veq0cka8ejqtrah7renf5phm213fdo.apps.googleusercontent.com"
                }).then(googleAuth => {
                        console.info("google auth success", googleAuth.isSignedIn.get());
                        if (googleAuth.isSignedIn.get()) {
                            window.plugins.auth.onSuccessfulSignIn(googleAuth.currentUser.get());
                        }
                    },
                    () => {
                        console.info("google auth not succeeded");
                    });
            });
        },

        stop: function () {
            ide.setAuthentication(false);
        },

        signIn: function () {
            gapi.auth2.getAuthInstance().signIn().then(googleUser => {
                    window.plugins.auth.onSuccessfulSignIn(googleUser);
                }
            );
        }
    };

    ide.pluginLoaded('googleAuthentication');


});

