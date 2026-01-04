import { auth, db } from './firebase-init.js';
import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authForm = document.getElementById('auth-form');
const logoutBtn = document.getElementById('logout-btn');
const authErrorEl = document.getElementById('auth-error');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const pendingCountEl = document.getElementById('pending-count');
const nextTokenEl = document.getElementById('next-token');
const callNextBtn = document.getElementById('call-next-btn');

const activeTokenEl = document.getElementById('active-token');
const activeDetailsEl = document.getElementById('active-details');
const markPaidBtn = document.getElementById('mark-paid-btn');
const noShowBtn = document.getElementById('no-show-btn');
const activeTokenContainer = document.getElementById('active-token-container');

const queueListEl = document.getElementById('queue-list');

let activeTokenId = null;
let nextWaitingTokenId = null;

// --- AUTH ---
// admin@college.edu / password (simple check)
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    authErrorEl.textContent = '';
    emailInput.classList.remove('input-error');
    passwordInput.classList.remove('input-error');

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error.code);
        let msg = "Login failed.";
        switch (error.code) {
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
            case 'auth/too-many-requests':
                msg = "Too many failed attempts. Try again later.";
                break;
            default:
                msg = "Error: " + error.code;
        }
        authErrorEl.textContent = msg;
    }
});

logoutBtn.addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, (user) => {
    if (user) {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        initAdminListeners();
    } else {
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }
});

// --- ADMIN LOGIC ---

function initAdminListeners() {
    // 1. Listen to WAITING queue
    const qWaiting = query(
        collection(db, "queue"),
        where("status", "==", "waiting"),
        orderBy("timestamp", "asc")
    );

    onSnapshot(qWaiting, (snapshot) => {
        const docs = snapshot.docs;
        pendingCountEl.textContent = docs.length;

        // Update Next Up Display
        if (docs.length > 0) {
            const nextDoc = docs[0];
            nextWaitingTokenId = nextDoc.id;
            nextTokenEl.textContent = `#${nextDoc.id.slice(-4).toUpperCase()}`;
            callNextBtn.disabled = false;
        } else {
            nextWaitingTokenId = null;
            nextTokenEl.textContent = "-";
            callNextBtn.disabled = true;
        }

        // Render List
        renderQueueList(docs);
    });

    // 2. Listen to CALLED (Active) tokens
    // We assume the Admin wants to see the oldest "Called" token to process it.
    const qCalled = query(
        collection(db, "queue"),
        where("status", "==", "called"),
        orderBy("timestamp", "asc")
    );

    onSnapshot(qCalled, (snapshot) => {
        if (!snapshot.empty) {
            const doc = snapshot.docs[0]; // Process the first one
            const data = doc.data();
            activeTokenId = doc.id;

            // UI Update
            activeTokenContainer.classList.remove('hidden'); // Ensure visible
            activeTokenEl.textContent = `#${doc.id.slice(-4).toUpperCase()}`;
            activeDetailsEl.textContent = `${data.feeType} • ${data.email || 'Student'}`;

            markPaidBtn.disabled = false;
            noShowBtn.disabled = false;
        } else {
            activeTokenId = null;
            activeTokenEl.textContent = "#---";
            activeDetailsEl.textContent = "No active student";
            markPaidBtn.disabled = true;
            noShowBtn.disabled = true;
        }
    });
}

function renderQueueList(docs) {
    queueListEl.innerHTML = '';
    if (docs.length === 0) {
        queueListEl.innerHTML = '<p class="text-center" style="color:var(--text-muted)">No students waiting.</p>';
        return;
    }

    docs.forEach(doc => {
        const data = doc.data();
        const el = document.createElement('div');
        el.className = 'token-list-item';
        el.innerHTML = `
            <div>
                <span style="font-weight:700; color:var(--primary)">#${doc.id.slice(-4).toUpperCase()}</span>
                <span style="font-size:0.9rem; color:var(--text-muted); margin-left:0.5rem">${data.feeType}</span>
            </div>
            <div style="font-size:0.8rem; color:var(--text-muted)">
                ${new Date(data.timestamp?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        `;
        queueListEl.appendChild(el);
    });
}

// --- ACTIONS ---

callNextBtn.addEventListener('click', async () => {
    if (!nextWaitingTokenId) return;
    try {
        await updateDoc(doc(db, "queue", nextWaitingTokenId), {
            status: "called",
            calledAt: serverTimestamp()
        });
    } catch (e) {
        console.error(e);
        alert("Error calling token");
    }
});

async function closeToken(status) {
    if (!activeTokenId) return;
    try {
        await updateDoc(doc(db, "queue", activeTokenId), {
            status: status,
            completedAt: serverTimestamp()
        });
    } catch (e) {
        console.error(e);
        alert("Error updating token");
    }
}

markPaidBtn.addEventListener('click', () => closeToken('paid'));
noShowBtn.addEventListener('click', () => closeToken('no-show'));

// Call Again / Recall
document.getElementById('recall-btn').addEventListener('click', async () => {
    if (!activeTokenId) return;
    try {
        await updateDoc(doc(db, "queue", activeTokenId), {
            calledAt: serverTimestamp() // Update timestamp to re-trigger notification
        });
    } catch (e) {
        console.error(e);
        alert("Error recalling token");
    }
});
