// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import { getAuth, EmailAuthProvider} from 'firebase/auth';
import {} from 'firebase/firestore';

import * as firebaseui from 'firebaseui';



// Document elements
const startRsvpButton = document.getElementById('startRsvp');
const guestbookContainer = document.getElementById('guestbook-container');

const form = document.getElementById('leave-message');
const input = document.getElementById('message');
const guestbook = document.getElementById('guestbook');
const numberAttending = document.getElementById('number-attending');
const rsvpYes = document.getElementById('rsvp-yes');
const rsvpNo = document.getElementById('rsvp-no');

let rsvpListener = null;
let guestbookListener = null;

let db, auth;

async function main() {
  // Web App's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyALfRAz3176FDpGVgRse7rP-n780ygyzJ0",
    authDomain: "fir-web-codelab-cff6e.firebaseapp.com",
    projectId: "fir-web-codelab-cff6e",
    storageBucket: "fir-web-codelab-cff6e.appspot.com",
    messagingSenderId: "687879305182",
    appId: "1:687879305182:web:be322c3f22bd195e020f4f"
  };

  // Initialize Firebase
  initializeApp(firebaseConfig);
  auth = getAuth();
  
  // FirebaseUI config
  const uiConfig = {
    credentialHelper: firebaseui.auth.CredentialHelper.NONE,
    signInOptions: [
      // Email / Password Provider.
      EmailAuthProvider.PROVIDER_ID,
    ],
    callbacks: {
      signInSuccessWithAuthResult: function (authResult, redirectUrl) {
        // Handle sign-in.
        // Return false to avoid redirect.
        return false;
      },
    },
  };
  // Initialize the FirebaseUI widget using Firebase. 
  const ui = new firebaseui.auth.AuthUI(auth);

  // Listen to RSVP button clicks
  startRsvpButton.addEventListener("click", () => {
    ui.start("#firebaseui-auth-container", uiConfig);
  });
}
main();
