// Import stylesheets
import './style.css';
// Firebase App (the core Firebase SDK) is always required
import { initializeApp } from 'firebase/app';

// Add the Firebase products and methods that you want to use
import { getAuth, EmailAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, addDoc, collection, query, orderBy, onSnapshot, doc, setDoc, where } from 'firebase/firestore';

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

      // Subscribe to the guestbook collection
      subscribeGuestBook();
      // Subscribe to the user's RSVP
      subscribeCurrentRSVP(user);
    } else {
      startRsvpButton.textContent = 'RSVP';
      // hide guestbook for non-logged-in users
      guestbookContainer.style.display = 'none';

      // Unsubscribe from the guestbook collection
      unsubscribeGuestbook();

      // Unsubscribe from the RSVP colleciton
      unsubscribeCurrentRSVP();
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

  // Listen for RSVP responses
  rsvpYes.onclick = async () => {
    // Get a reference to the user's document in the attendees collection
    const userRef = doc(db, 'attendees', auth.currentUser.uid);

    // If they RSVP'd yes, save a document with attending: true
    try {
      await setDoc(userRef, {
        attending: true
      });
    } catch (e) {
      console.error(e);
    }
  };

  rsvpNo.onclick = async () => {
    const userRef = doc(db, 'attendees', auth.currentUser.uid);
    try {
      await setDoc(userRef, {
        attending: false
      });
    } catch (e) {
      console.error(e);
    }
  };

  const attendingQuery = query(
    collection(db, 'attendees'), 
    where('attending', '==', true)
  );

  const unsubscribe = onSnapshot(attendingQuery, snap => {
    const newAttendeeCount = snap.docs.length;
    numberAttending.innerHTML = newAttendeeCount + ' people going';
  });
}
main();

// Listen for guestbook updates
function subscribeGuestBook() {
  const q = query(collection(db, 'guestbook'), orderBy('timestamp', 'desc'));
  guestnookListener = onSnapshot(q, snaps => {
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

  // unsubscribe from guestbook updates
  function unsubscribeGuestbook() {
    if (guestbookListener != null){
      guestbookListener();
      guestbookListener = null;
    }
  }

// Listen for attendee list
function subscribeCurrentRSVP(user) {
  const ref = doc(db, 'attendees', user.uid);
  rsvpListener = onSnapshot(ref, dock => {
    if (doc && doc.data()) {
      const attendingResponse = doc.data().attending;

      // Update css classes for buttons
      if (attendingResponse) {
        rsvp.className = 'clicked';
        rsvpNo.className = '';
      } else {
        rsvpYes.className = '';
        rsvpNo.className = 'clicked';
      }
    }
  });
}

function unsubscribeCurrentRSVP() {
  if (rsvpListener != null) {
    rsvpListener();
    rsvpListener = null;
  }
  rsvpYes.className = '';
  rsvpNo.className = '';
}
