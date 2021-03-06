<template>
  <div class="modal is-active">
    <div class="modal-background"></div>
      <div class="modal-content round-corners">
        <article class="card is-centered round-corners">
          <div class="card-content">
            <img id="header-image" src = "../../assets/images/careaway-logo.png">
            <h2 id="form-title">Welcome Back!</h2>
            <div id="warning" v-show="showWarning">{{inputWarning}}</div>
            <div class="field control">
              <input class="input" type="name" v-model="username" :class="validUsername" @keyup="validUsername = checkEmpty(username)" placeholder="Username" @keyup.enter="userSignIn">
            </div>
            <div class="field control">
              <input class="input" type="password" id="password" :class="validPassword" @keyup="validPassword = checkEmpty(getPassword())" placeholder="Password" @keyup.enter="userSignIn">
            </div>
            <div class="control">
              <button class="button button-default is-fullwidth" @click = "userSignIn()">
                Sign In <i class="fas fa-sign-in-alt" id="sign-in-icon"></i>
              </button>
            </div>
            <button id="reset" class="button signin" @click = "displayReset">Forgot your Password?</button>
          </div>
        </article>
      </div>
      <button class="modal-close is-large" aria-label="close" @click="closeLogin"></button>
  </div>
</template>

<script>
import axios from 'axios'
import resetPassword from './reset-password.vue';
import cookies from 'browser-cookies';
axios.defaults.withCredentials = true;
axios.defaults.headers['Access-Control-Allow-Origin'] = 'http://localhost:8080';
  export default {
    name: 'login',
    components: {
      resetPassword,
    },
    data() {
      return {
        // User input on the login form
        username: '',
        // Data values to notify the user of an invalid input on login
        validUsername: '',
        validPassword: '',
        showWarning: false,
        inputWarning: ''
      }
    },
    methods: {
      // Redirect to MP home page
      routeMedicHome() {
        this.$router.push('MedicHome');
      },
      // Redirect to Patient home page
      routePatientHome() {
        this.$router.push('PatientHome');
      },
      routeAdminHome() {
        this.$router.push('AdminHome');
      },
      // Method to check if a field is empty.
      checkEmpty(data){
        if(data == '') {
          return 'is-danger'
        }
      },
      // Method to return the value that the user provided for the password
      getPassword() {
        return document.getElementById('password').value;
      },
      //  Method will run if the user clicks "Submit"
      userSignIn() {
        this.validUsername = this.checkEmpty(this.username);
        this.validPassword = this.checkEmpty(this.getPassword());
        // Changes values to 'is-danger' if true which will make text field red
        if(this.validUsername == 'is-danger' || this.validPassword == 'is-danger') {
          this.inputWarning = "You must provide a username and password to sign in";
          this.showWarning = true;
        } else {
            // Represent the 'this' of the outside function scope
            var self = this;
            // Create an object to hold the data that we want to send for the request to verify user at login.
            const newContact = {
              username: this.username,
              password: this.getPassword()
            }
            // Send a POST request to the following route
            axios.post(this.$store.getters.loginURL, newContact)
            // Runs after the request has been answered
            .then(function(response) {
              // If the response is successful, that means an account exists.
              if(response.data.success) {
                cookies.set('user', response.data.cookie);
                self.$login(response.data.accountType, self.username);
                // If the login credential is a patient, take this route
                if(response.data.accountType == 'patient') {
                  self.routePatientHome();
                } // If the user is a medical professional, take this route
                else if (response.data.accountType == 'medical-professional') {
                  self.routeMedicHome();
                } // If the user is a system admin, display the admin modal
                else if (response.data.accountType == 'system-admin') {
                  self.$store.dispatch('saveUsername',self.username);
                  self.routeAdminHome();
                } // If the user is an SSO-type user, direct them to provide more information
                else if(response.data.accountType =='SSO'){
                  self.$store.dispatch('saveUsername',self.username);
                  self.$store.dispatch('alternateSSORegistration');
                  self.$store.dispatch('alternateRegistration');
                }
                self.closeLogin();
              } else if(response.data.down ){
                  //show breach warning
                  self.showWarning = true;
                  self.inputWarning = 'Breach Has Been Detected, Server Shutdown';
                } else {
                 // If the credentials are bad, update the vue to prompt the user of their error
                  self.inputWarning = 'The username and password you have provided are invalid.';
                  self.showWarning = true;
              }
            })
            .catch(function(err) {
              // Prompt the user if there was an error in handling their login request
              self.inputWarning = 'Your input could not be handled at this time. Try again.';
              self.showWarning = true;
            });
        }
      },
      // Method that runs when the user clicks 'close' on the login modal
      closeLogin() {
        this.$store.dispatch('alternateLogin');
      },
      // Method that runs when the user clicks 'Forgot My Password'
      displayReset () {
        this.$store.dispatch('alternateLogin');
        this.$store.dispatch('alternateReset');
      },
    },
    computed: {
      showReset(){
        return this.$store.getters.showReset;
      },
    }
  }
</script>

<style lang = "scss">

  #form-title {
      font-size: 2em;
      font-weight: bold;
      color: $green;
      padding-bottom: 1rem;
      text-align: center;
  }

  #header-image {
    width: 40px;
  }

  #sign-in-icon {
    margin-left: 8px;
    font-size: 12px;
  }

  .sign-in {
    width: 70%;
  }

  #reset {
    color: $purple;

    &:hover {
      color: $purple-light;
    }
  }

  #warning {
    color: #FF3860;
  }

</style>
