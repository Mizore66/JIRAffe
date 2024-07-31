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

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;


function validateName(name) {
  let name_split = name.split(" ");

  if (!name) {
    return false;
  } else if (name_split.length != 2) {
    alert("Please only enter your first and last name");
    return false;
  } else {
    return true;
  }
}

function validateEmail(email) {
  if (!email) {
    return false;
  } else if (!email.match(EMAIL_REGEX)) {
    alert("Invalid email. Please enter a valid email address");
    return false;
  } else {
    return true;
  }
}

$("#forgot-password-btn").on('click', function(){
  console.log("clicked");
  $("#forgotPasswordModal").modal("show");
})

$("#reset-btn").on('click', async function(){
  var email = $("#MemberEmail").val();
  var emailValid = false;

  emailValid = validateEmail(email);
  if (emailValid){
    //check which user has the email and update the forgotPassword field to true
    const querySnapshot = await getDocs(query(userCollectionRef, where("email", "==", email)));
    querySnapshot.forEach(async (document) => { 
      await updateDoc(doc(db, "user", document.id), {
        forgotPassword: true,
      });
    });
  }
})

function validatePassword(password) {
  if (!password) {
    return false;
  } else if (password.length < 8) {
    alert("Password must be at least 8 characters long");
    return false;
  } else {
    return true;
  }
}

$(function () {
  $("#login-btn").on("click", async function () {
    console.log("clicked");

    var name = $("#login_name").val();
    var password = $("#login_password").val();
    var nameValid = false;
    var emailValid = false;
    var passwordValid = false;

    // perform data validation on the emails and password
    nameValid = validateName(name);
    passwordValid = validatePassword(password);

    if (nameValid && passwordValid) {
      let name_split = name.split(" ");
      console.log(name_split);

      console.log("performing login");

      // find the user in the "user" collection where the email matches the email entered in the login page
      var possible_accounts = query(
        userCollectionRef,
        where("firstName", "==", name_split[0]), 
        where("lastName", "==", name_split[1]),
        where("password", "==", password)
      );

      var docSnap = await getDocs(possible_accounts);
      possible_accounts = docSnap.docs.map((doc) => [doc.data(), doc.id]);

      console.log(possible_accounts);

      // // filter the possible accounts by password
      // possible_accounts = docSnap.filter(
      //   (account) => account.password == password
      // );

      if (possible_accounts.length == 1) {
        console.log("Log In successful!");
        var user = possible_accounts[0];
        localStorage.setItem("userLogin", JSON.stringify(user));
        window.location.href = "../sprint_page/sprint_page.html";

        // store the user in localStorage
        // localStorage.setItem("user", JSON.stringify(user));
        // window.location.href = "../src/product_backlog/product_backlog.html";
      } else if (possible_accounts.length == 0) {
        alert(
          "Invalid name or password. Please enter valid credentials to log in"
        );
        return;
      } else {
        alert(
          "Multiple accounts found with the same name and password. Please contact the administrator for assistance"
        );
        return;
      }
    } else {
      alert(
        "Invalid name or password. Please enter valid credentials to log in"
      );
      return;
    }
  });
});
