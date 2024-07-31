// Import the functions you need from the SDKs you need
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
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import { firebaseConfig, URGENCY_COLOUR_CODES } from "../../constants.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const userCollectionRef = collection(db, "user");
const productBacklogCollectionRef = collection(db, "product_backlog");
const taskCollectionRef = collection(db, "task");

$(async function () {
  // retrieve the list of all the users of this project
  var users = [];
  await getDocs(userCollectionRef).then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const obj = { ...doc.data(), id: doc.id };
      users.push(obj);
    });
  });
  users.sort((a, b) => {
    // sort users by first name (optional)
    if (a.firstName < b.firstName) {
      return -1;
    } else if (a.firstName > b.firstName) {
      return 1;
    } else {
      return 0;
    }
  });

  // dynamically generate the list of users to assign the task to
  users.forEach((user) => {
    $("#assigned_to").append(
      `<option value="${user.id}">${user.firstName} ${user.lastName}</option>`
    );
  });

  $("#story_points").on("input", function () {
    $(".slider-value-text").html(
      `This task is worth <b> ${$(this).val()} story points </b>`
    );
  });

  $("#btn").on("click", function () {
    var nameVal = $("#name").val();
    var tagVal = $("#tag").val();

    console.log("BUTTON CLICKED");

    // to get the urgency value
    var urgentButton = $(".input-urgency-row").find(".active")[0]; // find the urgency button group that is active

    // check if the urgency button group is active
    if (urgentButton == undefined) {
      alert("Please select an urgency level");
      return;
    }

    var urgencyType = urgentButton.className.split(" ")[2].split("-")[2]; // get the urgency level from the class name
    var urgencyVal = $(`#value-${urgencyType}`).html().toString(); // get the urgency value using the urgency level

    var assigneeVal = $("#assigned_to").val();
    var story_pointsVal = $("#story_points").val();
    var descriptionVal = $("#description").val();
    var bugVal = $("#bug_or_story").val();
    var stageVal = $("#stage").val();

    var newTaskRef = {
      name: nameVal,
      tag: tagVal,
      urgency: urgencyVal,
      assignee: assigneeVal,
      story_points: story_pointsVal,
      description: descriptionVal,
      bug: bugVal,
      stage: stageVal,
      start_time: null,
      end_time: null,
      total_time: {seconds: 0, nanoseconds: 0}
    };

    var taskID = "";

    const backlogRef = doc(db, "product_backlog", "backlog");

    var docRef = addDoc(taskCollectionRef, newTaskRef)
      .then((docRef) => {
        taskID = docRef.id;
        updateDoc(backlogRef, {
          task_list: arrayUnion(taskID),
        })
          .then(() => {
            window.location.href = "../product_backlog/product_backlog.html";
          })
          .catch((error) => {
            alert("Unsuccessful operation, error: " + error);
        })
      })
      .catch((error) => alert("Unsuccessful operation, error: " + error) );
    


  });
});
