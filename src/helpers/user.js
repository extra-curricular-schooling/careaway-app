// import the Vuex store
import store from '../store/store';
import Swal from 'sweetalert2';
// User state mangagement plugin for the CareAway Treatment Planner
const User = {};
User.install = function(Vue, options) {
    Vue.prototype.$logout = function() {
      // Clears the authenticated username 
      this.$store.dispatch('deauthenticatedUsername', '');
      // Clears the medical code
      this.$store.dispatch('medicalCode', '');
      // Clears the authenticated role
      this.$store.dispatch('signOut', '');

      setTimeout (Swal({
        title: "Logged out", 
        text: "You have been logged out of the system and will be redirected to the CareAway Homepage", 
        type: "success" 
      }) , 500)
    } 

    Vue.prototype.$login = function(accountType, userName) {
      // Sets the authenticated user role
      this.$store.dispatch('signIn', accountType);
      // Sets the authenticated username
      this.$store.dispatch('authenticatedUsername', userName);
    }

    Vue.prototype.$regCheck = function(inputFields) {
      // Checks to see if each element in the array has a value of 'is-success'
      return inputFields.every((field) => {return field == 'is-success'})
    }
}

export default User