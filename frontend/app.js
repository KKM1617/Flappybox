import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAEvNPmZd9-C4FJa7Fp_8hHeLnDkGG4CGg",
  authDomain: "reselling-app-3c8fe.firebaseapp.com",
  projectId: "reselling-app-3c8fe",
  storageBucket: "reselling-app-3c8fe.firebasestorage.app",
  messagingSenderId: "661888641900",
  appId: "1:661888641900:web:7cb5493736bed4547c6149"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Signup
async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert('Signup successful!');
  } catch (error) {
    alert(error.message);
  }
}

// Login
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('Login successful!');
  } catch (error) {
    alert(error.message);
  }
}

// Check login status
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('user-info').innerText = `Logged in as ${user.email}`;
    document.getElementById('buttons-section').style.display = 'block';
  } else {
    document.getElementById('user-info').innerText = '';
    document.getElementById('buttons-section').style.display = 'none';
  }
});

// Save search to Firestore
async function saveSearch(productName) {
  const user = auth.currentUser;
  if (user) {
    try {
      await addDoc(collection(db, "user_searches"), {
        uid: user.uid,
        searchItem: productName,
        timestamp: new Date()
      });
      console.log('Search saved!');
    } catch (e) {
      console.error("Error saving search: ", e);
    }
  }
}

// Fetch Flipkart Products
async function fetchFlipkart() {
  const response = await fetch('/api/get_flipkart_products');
  const data = await response.json();
  displayProducts(data.products);

  if (data.products.length > 0) {
    saveSearch(data.products[0]);
  }
}

// Fetch Myntra Products
async function fetchMyntra() {
  const response = await fetch('/api/get_myntra_products');
  const data = await response.json();
  displayProducts(data.products);

  if (data.products.length > 0) {
    saveSearch(data.products[0]);
  }
}

// Display Products
function displayProducts(products) {
  const list = document.getElementById('products');
  list.innerHTML = '';
  products.forEach(product => {
    const li = document.createElement('li');
    li.innerText = product;
    list.appendChild(li);
  });
  }
