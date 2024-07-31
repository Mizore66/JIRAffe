import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  where,
  query,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import { User } from "../entities/user.js";
import { firebaseConfig, URGENCY_COLOUR_CODES } from "../../constants.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const userCollectionRef = collection(db, "user");

let userLoggedInArray = JSON.parse(localStorage.getItem("userLogin"));
console.log(userLoggedInArray);
let userLoggedIn = userLoggedInArray[0];
console.log(userLoggedIn);

$("#update-btn").on('click', async function () {
    //check which user on the database has the same email as the user logged in
    const querySnapshot = await getDocs(query(userCollectionRef, where("email", "==", userLoggedIn.email)));
    querySnapshot.forEach(async (document) => {
      //update the user details
      await updateDoc(doc(db, "user", document.id), {
        password: $("#password").val(),
      });
    });
    //update the user logged in details
    userLoggedIn.password = $("#password").val();
    localStorage.setItem("userLogin", JSON.stringify(userLoggedInArray));
    alert("Password updated successfully");
    }
    );


$(() => {
    $("#first_name").val(userLoggedIn.firstName);
    $("#last_name").val(userLoggedIn.lastName);
    $("#email").val(userLoggedIn.email);
    $("#password").val(userLoggedIn.password);
  });