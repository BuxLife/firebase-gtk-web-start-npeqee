// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import { getAuth, EmailAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, addDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';

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
  db = getFirestore();

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
    if (auth.currentUser) {
      // User is signed in, allow user to sign out. 
      signOut(auth);
    } else {
      // No user signed in, allow user to sign in. 
      ui.start("#firebaseui-auth-container", uiConfig);
    }
    
  });

  // Listen to the current Auth state
  onAuthStateChanged(auth, user => {
    if (user) {
      startRsvpButton.textContent = 'LOGOUT';
      // show guestbook to logged-in users
      guestbookContainer.style.display = 'block';
    } else {
      startRsvpButton.textContent = 'RSVP';
      // hide guestbook for non-logged-in users
      guestbookContainer.style.display = 'none';
    }
  });

  // Listen to the form submission
  form.addEventListener('submit', async e => {
    // Prevent the default form redirect
    e.preventDefault();
    // Wrtie a new message to the database collection "guestbook"
    addDoc(collection(db, 'guestbook'), {
      text: input.value, 
      timestamp: Date.now(), 
      name: auth.currentUser.displayName, 
      userId: auth.currentUser.uid
    });

    // Clear message input field. 
    input.value = '';
    // Return false to avoid redirect
    return false; 
  });

  // Create query for messages
  const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
  onSnapshot(q, snaps => {
    // Reset page
    guestbook.innerHTML = '';
    // Loop through documents in db
    snaps.forEach(doc => {
      // Create an HTML entry for each document and add it to the chat. 
      const entry = document.createElement('p');
      entry.textContent = doc.data().name + ':' + doc.data().text;
      guestbook.appendChild(entry);
    });
  });

}
main();
