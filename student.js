import { auth, db } from './firebase-init.js';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const toggleAuthBtn = document.getElementById('toggle-auth');
const authBtn = document.getElementById('auth-btn');
const logoutBtn = document.getElementById('logout-btn');
const authErrorEl = document.getElementById('auth-error');

const generateSection = document.getElementById('generate-section');
const getTokenBtn = document.getElementById('generate-btn');
const feeTypeSelect = document.getElementById('fee-type');
const tokenCard = document.getElementById('token-card');

const myTokenEl = document.getElementById('my-token');
const tokenStatusEl = document.getElementById('token-status');
const queuePosEl = document.getElementById('queue-pos');
const estWaitEl = document.getElementById('est-wait');
const progressBar = document.getElementById('queue-progress');

let isLogin = true;
let currentUser = null;
let currentTokenUnsub = null;
let queueUnsub = null;

// --- AUTH LOGIC ---

toggleAuthBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    authBtn.textContent = isLogin ? 'Log In' : 'Sign Up';
    toggleAuthBtn.textContent = isLogin ? 'New student? Create an account' : 'Already have an account? Log In';
    document.getElementById('signup-fields').classList.toggle('hidden', isLogin);
    authErrorEl.textContent = ''; // Clear errors
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');
});

function displayAuthError(code) {
    let msg = "An error occurred.";
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    switch (code) {
        case 'auth/invalid-email':
        case 'auth/user-not-found':
        case 'auth/invalid-credential':
            msg = "Incorrect email or password.";
            emailInput.classList.add('input-error');
            break;
        case 'auth/wrong-password':
            msg = "Incorrect password.";
            passwordInput.classList.add('input-error');
            break;
        case 'auth/email-already-in-use':
            msg = "Email is already registered.";
            emailInput.classList.add('input-error');
            break;
        case 'auth/weak-password':
            msg = "Password should be at least 6 characters.";
            passwordInput.classList.add('input-error');
            break;
        case 'auth/too-many-requests':
            msg = "Too many failed attempts. Try again later.";
            break;
        default:
            msg = "Login failed: " + code;
    }
    authErrorEl.textContent = msg;
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    // Basic validation
    authErrorEl.textContent = '';
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
            // Optionally updateProfile with name
        }
    } catch (error) {
        console.error(error.code);
        displayAuthError(error.code);
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        authView.classList.add('hidden');
        dashboardView.style.display = 'block';
        checkForActiveToken();
    } else {
        authView.classList.remove('hidden');
        dashboardView.style.display = 'none';
        resetDashboard();
    }
});

function resetDashboard() {
    if (currentTokenUnsub) currentTokenUnsub();
    if (queueUnsub) queueUnsub();
    tokenCard.classList.add('hidden');
    generateSection.classList.remove('hidden');
}

// --- QUEUE LOGIC ---

const limitConfig = limit; // Alias for cleaner code if needed, but we check imports.

// Request Notification Permission
if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

getTokenBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    getTokenBtn.disabled = true;
    getTokenBtn.textContent = "Generating...";

    try {
        await addDoc(collection(db, "queue"), {
            userId: currentUser.uid,
            email: currentUser.email,
            feeType: feeTypeSelect.value,
            status: "waiting",
            timestamp: serverTimestamp() // critical for ordering
        });
        // Optimistic update
        console.log("Token request sent.");
    } catch (error) {
        console.error("Error adding token: ", error);
        alert("Failed to generate token. Try again.");
        getTokenBtn.disabled = false;
        getTokenBtn.textContent = "Get Token";
    }
});

function checkForActiveToken() {
    // Listen for the LATEST token created by the user
    // Requires Index: userId (ASC), timestamp (DESC)
    const q = query(
        collection(db, "queue"),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc"),
        limit(1)
    );

    let lastStatus = null;
    let lastCalledAt = 0;

    currentTokenUnsub = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const data = doc.data();

            // Helper to get timestamp millis safely
            const currentCalledTime = data.calledAt ? (data.calledAt.toMillis ? data.calledAt.toMillis() : Date.now()) : 0;

            // Check for Notification Trigger
            // 1. Transition to 'called'
            // 2. OR Status is 'called' and timestamp updated (Recall)
            if (data.status === 'called') {
                const isNewCall = lastStatus !== 'called';
                const isReCall = lastCalledAt > 0 && currentCalledTime > lastCalledAt;

                if (isNewCall || isReCall) {
                    sendNotification(`Your token #${doc.id.slice(-4).toUpperCase()} has been called!`);
                }
            }

            lastStatus = data.status;
            if (data.status === 'called') lastCalledAt = currentCalledTime;

            if (data.status === 'paid') {
                showCompletedView(doc.id, data);
            } else if (['waiting', 'called'].includes(data.status)) {
                showTokenView(doc.id, data);
                if (data.status === 'waiting') {
                    listenToQueueProgress(doc.id, data.timestamp);
                } else {
                    // Stop listening to queue position if called
                    if (queueUnsub) {
                        queueUnsub();
                        queueUnsub = null;
                    }
                }
            } else {
                // 'no-show' or other states -> Reset
                resetDashboard();
                getTokenBtn.disabled = false;
                getTokenBtn.textContent = "Get Token";
            }
        } else {
            resetDashboard();
            getTokenBtn.disabled = false;
            getTokenBtn.textContent = "Get Token";
        }
    }, (error) => {
        console.error("Error listener: ", error);
        getTokenBtn.disabled = false;
        getTokenBtn.textContent = "Get Token (Retry)";
        if (error.message.includes("index")) {
            alert("System update in progress (Indexing). Please wait 1 min.");
        }
    });
}

function sendNotification(msg) {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification("College Fees Queue", { body: msg, icon: '/favicon.ico' });
    }
}

function showCompletedView(tokenId, data) {
    generateSection.classList.add('hidden');
    tokenCard.classList.remove('hidden');

    myTokenEl.textContent = "✔";
    myTokenEl.style.color = "var(--success)";
    tokenStatusEl.textContent = "COMPLETED";
    tokenStatusEl.className = 'status-badge status-paid';

    queuePosEl.textContent = "-";
    estWaitEl.textContent = "Done";
    progressBar.style.width = '100%';

    // Replace "Your Token Number" text with a Success Message
    const detailsEl = tokenCard.querySelector('p');
    if (detailsEl) detailsEl.textContent = `Payment Successful for ${data.feeType}`;

    // Add a "New Token" button if not exists
    let newBtn = document.getElementById('new-token-btn');
    if (!newBtn) {
        newBtn = document.createElement('button');
        newBtn.id = 'new-token-btn';
        newBtn.textContent = "Book Another Token";
        newBtn.style.marginTop = "1.5rem";
        newBtn.onclick = () => {
            // Force show generate form
            tokenCard.classList.add('hidden');
            generateSection.classList.remove('hidden');
            getTokenBtn.disabled = false;
            getTokenBtn.textContent = "Get Token";
        };
        tokenCard.appendChild(newBtn);
    } else {
        newBtn.classList.remove('hidden');
    }
}

function showTokenView(tokenId, data) {
    generateSection.classList.add('hidden');
    tokenCard.classList.remove('hidden');

    // Hide "New Token" button if present
    const newBtn = document.getElementById('new-token-btn');
    if (newBtn) newBtn.classList.add('hidden');

    // Reset UI elements from potential "Completed" state
    myTokenEl.style.color = "var(--primary)";
    const detailsEl = tokenCard.querySelector('p');
    if (detailsEl) detailsEl.textContent = "Your Token Number";

    myTokenEl.textContent = `#${tokenId.slice(-4).toUpperCase()}`;
    tokenStatusEl.textContent = data.status.toUpperCase();

    tokenStatusEl.className = 'status-badge';
    if (data.status === 'waiting') tokenStatusEl.classList.add('status-waiting');
    if (data.status === 'called') tokenStatusEl.classList.add('status-called');

    if (data.status === 'called') {
        queuePosEl.textContent = "YOUR TURN";
        estWaitEl.textContent = "NOW";
        progressBar.style.width = '100%';
    }
}

function listenToQueueProgress(myTokenId, myTimestamp) {
    // Listen to all waiting tokens generated BEFORE mine to calculate position
    // Or just listen to all waiting tokens and filter client side for simplicity in this demo
    // Ideally: query for status=='waiting' order by timestamp

    const q = query(
        collection(db, "queue"),
        where("status", "==", "waiting"),
        orderBy("timestamp", "asc")
    );

    if (queueUnsub) queueUnsub();

    queueUnsub = onSnapshot(q, (snapshot) => {
        const waitingDocs = snapshot.docs;
        let myPos = -1;
        let totalWaiting = waitingDocs.length;

        // Find my position
        // Note: If my status is 'called', this listener might not include me if I only fetch 'waiting'.
        // But 'showTokenView' handles the 'called' state display.
        // This is purely for when I am 'waiting'.

        waitingDocs.forEach((doc, index) => {
            if (doc.id === myTokenId) {
                myPos = index + 1;
            }
        });

        if (myPos > 0) {
            queuePosEl.textContent = myPos;
            estWaitEl.textContent = `${myPos * 5} min`; // Approx 5 min per person

            // Progress Bar Logic (Visual only)
            // If I am 1st, 90%. If I am 10th, 10%.
            // Simple logic: 100 - (pos * 5)% 
            // Better: just fill based on how many people are active vs me.
            // Let's keep it simple:
            const percent = Math.max(5, 100 - (myPos * 10));
            progressBar.style.width = `${percent}%`;
        }
    });
}
