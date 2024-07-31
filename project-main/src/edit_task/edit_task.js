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
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import { Task } from "../entities/task.js";
import { User } from "../entities/user.js";
import { firebaseConfig, URGENCY_COLOUR_CODES } from "../../constants.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const userCollectionRef = collection(db, "user");

// async function get_task(db, id){
//     var ref = doc(db, "product_backlog", id);
//     const docSnap = await getDoc(ref);
//     if (docSnap.exists()) {
//         console.log( "Document data:", docSnap.data() );
//         var task = docSnap.data();
//         $("#name").val() = task.name;
//         $("#tag").val() = task.tags;
//         $("#urgency").val() = task.urgency;
//         $("#assigned_to").val() = task.assignee;
//         $("#story_points").val() = task.story_points;
//         $("#description").val() = task.description;
//         $("#bug_or_story").val() = task.bug;
//         $("#stage").val() = task.stage;
//     } else {
//         // doc.data() will be undefined in this case
//         console.log("No such document!");
//     }
// }

// get_task(db, id);

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

  var link = window.location.href;
  var uri = decodeURI(link.substring(link.lastIndexOf("?") + 1));

  // get the individual task and user from the uri, and parse them into JSON objects
  var taskID = uri.split("&")[0].split("= ")[1];
  var taskJSON = JSON.parse(uri.split("&")[1].split("=")[1]);
  var userJSON = JSON.parse(uri.split("&")[2].split("=")[1]);

  taskID.replace(" ", "");
  taskID = taskID.slice(0,-1)
  console.log(taskID);
  // console.log(taskJSON);
  // console.log(userJSON);

  // set the values of the form to the values of the task
  $("#name").val(taskJSON.name);
  $("#tag").val(taskJSON.tag);

  // set the urgency colour and level
  const urgencyTags = URGENCY_COLOUR_CODES[taskJSON.urgency];
  $(`.btn-outline-${urgencyTags[0]}`).addClass("active");
  $(`#btn-${urgencyTags[0]}`).prop("checked", true);

  // assign the rest of the task object's data
  $("#assigned_to").val(taskJSON.assignee);
  $("#story_points").val(taskJSON.story_points);
  $(".slider-value-text").html(
    `This task is worth <b> ${taskJSON.story_points} story points </b>`
  );

  $("#description").val(taskJSON.description);
  $("#stage").val(taskJSON.stage);

  $("#assigned_to").append(
    `<option value="${userJSON.firstName}">${userJSON.firstName}</option>`
  );

  $("#story_points").on("input", function () {
    $(".slider-value-text").html(
      `This task is worth <b> ${$(this).val()} story points </b>`
    );
  });

  $("#btn").on("click", async function () {
    var nameVal = $("#name").val();
    var tagVal = $("#tag").val();

    var urgentButton = $(".input-urgency-row").find(".active")[0]; // find the urgency button group that is active
    var urgencyType = urgentButton.className.split(" ")[2].split("-")[2]; // get the urgency level from the class name
    var urgencyVal = $(`#value-${urgencyType}`).html().toString(); // get the urgency value using the urgency level

    var story_pointsVal = $("#story_points").val();
    var descriptionVal = $("#description").val();
    var assigneeVal = $("#assigned_to").val();
    var bugVal = $("#bug_or_story").val();
    var stageVal = $("#stage").val();

    const ref = await doc(db, "task", taskID);

    // console.log(taskID);

    const docRef = await updateDoc(ref, {
      name: nameVal,
      tag: tagVal,
      urgency: urgencyVal,
      assignee: assigneeVal,
      story_points: story_pointsVal,
      description: descriptionVal,
      stage: stageVal,
      bug: bugVal,
    })
      .then(() => {
        window.location.href = "../product_backlog/product_backlog.html";
      })
      .catch((error) => alert("Unsuccessful operation, error: " + error) );

  });
});
