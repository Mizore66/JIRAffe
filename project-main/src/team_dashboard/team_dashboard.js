import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  orderBy,
  limit,
  arrayRemove,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import { Task } from "../entities/task.js";
import { User } from "../entities/user.js";
import { DateTimeUtils } from "../entities/utilities.js";
import { firebaseConfig } from "../../constants.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//Get current user collection
const userCollection = collection(db, "user");
const taskCollection = collection(db, "task");
let edit_user;
let userTimeDictionary = new Map();
var curChart;
let loginUser = JSON.parse(localStorage.getItem("userLogin"));
var isUserAdmin = false;

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

var admin_header_row = `<div class="row jiraffe-table-header-row">
<div class="member-title col-sm jiraffe-table-header-col font-weight-bold">Team Members</div>
<div class="align col-2 jiraffe-table-header-col font-weight-bold">Average hours worked per day</div>
<div class="align col-2 jiraffe-table-header-col font-weight-bold">Edit</div>
<div class="align col-2 jiraffe-table-header-col font-weight-bold">Delete</div>
</div>`

var header_row = `<div class="row jiraffe-table-header-row">
<div class="member-title col-sm jiraffe-table-header-col font-weight-bold">Team Members</div>
<div class="align col-2 jiraffe-table-header-col font-weight-bold">Average hours worked per day</div>
</div>`

var member_row = (member) => `<div class="members-info-btn row jiraffe-table-row">
<div class="col-sm jiraffe-table-col font-weight-bold">${member.firstName +" " + member.lastName}</div>
<div class="col-2 jiraffe-table-col" id="Average_hours">0</div>`

var admin_member_row = (member) =>`<div class="members-info-btn row jiraffe-table-row">
<div class="col-sm jiraffe-table-col font-weight-bold">${member.firstName +" " + member.lastName}</div>
<div class="col-2 jiraffe-table-col" id="Average_hours">0</div>
<button type="button" class="col-2 jiraffe-table-col btn" id="edit-btn"><img class="edit-icon" src="../../assets/icons/edit_96x96.png"></button>
<button type="button" class="col-2 jiraffe-table-col btn" id="delete-btn"><img class="delete-icon" src="../../assets/icons/delete_48x48.png"></button>`

//Query selector for all elements with the members-info-btn class
//Adds a click event listener to each element
//When clicked, the modal is shown
//The modal displays the information of the member
//The information is retrieved from the database
//The information is displayed in the modal
//Code please
// $(".jiraffe-table-row").on('click', function(){
  // var memberName = $(this).text();
  // var memberNameArray = memberName.split(" ");
  // var memberFirstName = memberNameArray[0];
  // var memberLastName = memberNameArray[1];
  // const q = query(userCollection, where("firstName", "==", memberFirstName), where("lastName", "==", memberLastName));
  // const querySnapshot = await getDocs(q);
  // querySnapshot.forEach((doc) => {
    //   const user = User.fromJson(doc.data());
    //   $("#memberInfoModal").empty();
    //   $("#memberInfoModal").append(`<p>First Name: ${user.firstName}</p>`);
    //   $("#memberInfoModal").append(`<p>Last Name: ${user.lastName}</p>`);
    //   $("#memberInfoModal").append(`<p>Email: ${user.email}</p>`);
    //   $("#memberInfoModal").append(`<p>Admin: ${user.isAdmin}</p>`);
  //   $("#memberInfoModal").append(`<p>Colour: ${user.colour}</p>`);
  // });
  // })
  
function create_graph(userObj) {
  let startDate = $("#start-date").val();
  let endDate = $("#end-date").val();
  let startTime = new Date(startDate);
  let endTime = new Date(endDate);

  let userData = [];
  let dates = []

  console.log(userTimeDictionary);

  if (startDate == "" || endDate == "") {
    alert("Please select a start and end date");
    return;
  }

  while (startTime <= endTime) {
    let startString = startTime.toDateString();
    dates.push(startString);
    userData.push(userTimeDictionary.get($(userObj).children().last().html()).get(startString));
    startTime.setDate(startTime.getDate() + 1);
  }


  curChart = new Chart(document.getElementById("workHoursAverage"), {
    data: {
      labels: dates,
      datasets: [
        {
          type: 'bar',
          label: "Hours worked on the day",
          backgroundColor: ["#3cba9f"],
          data: userData
        }
      ]
    },
    options: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Member crap'
      }
    }
  });
  $(`#graphModal`).modal("show");
}

$('.close-chart-btn').on('click', () => {curChart.destroy();}
);

$(document).on("dblclick", ".members-info-btn", function () {    
  console.log("I CLICKA THE BUTTON");

  create_graph(this);
  }
)

//Change listener for input date elements "start-date" and "end-date"
//no, just check if start date is before end date and vice versa. If not, then alert the user and set the new date to blank
$(".date").on("change",async function(){
  var startDate = $("#start-date").val();
  var endDate = $("#end-date").val();
  if(startDate > endDate && endDate != "" && startDate != ""){
    alert("Start date cannot be after end date");
    $(this).val("");
    return;
  }
  if (startDate == "" || endDate == "") {}else{
  await sort_by_date();
}})


//Adds a click event listener to delete button, where if clicked then user is deleted
$(document).on("click", "#delete-btn", async function () {
  let user_id = $(this).closest(".jiraffe-table-row").find("div").last().html();

  const taskDocs = await getDocs(query(taskCollection, where("assignee", "==", user_id)));
  taskDocs.forEach(async (document) => {
    await updateDoc(doc(db, "task", document.id), {
      assignee: "unassigned",
    });
  });

  const userSnapshot = await deleteDoc(doc(db, "user", user_id)).then(() => {
    alert("User deleted successfully");
    window.location.reload();
  });
})

//Edit button
//Adds a click event listener to the edit button, where if clicked then the edit modal is shown (yes do that, please code it now)
$(document).on("click", "#edit-btn", async function () {
  edit_user = $(this).closest(".jiraffe-table-row").find("div").last().html();
  const userSnapshot = await getDoc(doc(db, "user", edit_user));
  const user = User.fromJson(userSnapshot.data());
  $("#editMemberModal").modal("show");
  $("#editMemberModal").on("shown.bs.modal", function () {
    $("#editMemberFirstName").val(user.firstName);
    $("#editMemberLastName").val(user.lastName);
    $("#editMemberEmail").val(user.email);
    $("#editMemberPassword").val(user.password);
    $("#editMemberColour").val(user.colour);

    isUserAdmin = user.isAdmin;

    if (user.forgotPassword){
      $("#editMemberPassword").attr('type', "text");
      $("#editMemberPassword").removeAttr("readonly");
    }else {
      $("#editMemberPassword").attr('type', "password");
      $("#editMemberPassword").attr("readonly", true);
    }
  });
})

//Edit member button listener to confirm the edit and edit the database
$("#edit-member-btn").on("click", async function(){
  var userFirstName = $("#editMemberFirstName").val();
  var userLastName = $("#editMemberLastName").val();
  var userEmail = $("#editMemberEmail").val();
  var userPassword = $("#editMemberPassword").val();
  var userColour = $("#editMemberColour").val();

  if (userFirstName == "" || userLastName == "" || userEmail == "" || userPassword == "" || userColour == ""){
    alert("Please fill in all fields");
    return;
  }

  if (!EMAIL_REGEX.test(userEmail)){
    alert("Please enter a valid email");
    return;
  }

  if (userPassword.length < 8){
    alert("Password must be at least 8 characters long");
    return;
  }

  //Check if user email is already existing
  let double_email = false
  const querySnapshot = await getDocs(query(userCollection, where("email", "==", userEmail)));
  querySnapshot.forEach((doc) => {
    if (doc.id != edit_user){
      alert("Email already exists");
      double_email = true;
    }
  });

  if (double_email) return;
  console.log(isUserAdmin);
  var user = {
    firstName : userFirstName,
    lastName : userLastName,
    email : userEmail,
    password : userPassword,
    isAdmin : isUserAdmin,
    colour : userColour,
    forgotPassword : false,
  }

  await updateDoc(doc(db, "user", edit_user), user).then(async () => {
    alert("User edited successfully");
    if (edit_user == loginUser[1]){
      console.log("as");
      await getDoc(doc(db, "user", edit_user)).then((doc) => {
      localStorage.setItem("userLogin", JSON.stringify([doc.data(), doc.id]));
      })
    }
    isUserAdmin = false;
    window.location.reload();
  });
})

//Get current users
async function get_user(){
  $("#product-backlog-table").empty();
  const userSnapshot = await getDocs(userCollection);

  if (loginUser[0].isAdmin) {
  $("#product-backlog-table").append(admin_header_row);
  // console.log(userSnapshot, "snapshot");
  userSnapshot.forEach((doc) => {
    if (doc.id == "unassigned") return;
    const user = User.fromJson(doc.data());
    var memberHTML = admin_member_row(user) + `<div id="${user.firstName+user.lastName}_id" hidden>${doc.id}</div></div>`;
    $("#product-backlog-table").append(memberHTML);
  });
  } else {
    $("#add-member-btn").hide();
    $("#product-backlog-table").append(header_row);
    userSnapshot.forEach((doc) => {
      if (doc.id == "unassigned") return;
      const user = User.fromJson(doc.data());
      var memberHTML = member_row(user) + `<div id="${user.firstName+user.lastName}_id" hidden>${doc.id}</div></div>`;
      $("#product-backlog-table").append(memberHTML);
    });
  }

};
// Event listeners to show modals on click
$("#view-graph-btn").click(() => {
  $(`#graphModal`).modal("show");
});

$("#register-btn").on("click", async function(){
  var userFirstName = $("#inputMemberFirstName").val();
  var userLastName = $("#inputMemberLastName").val();
  var userEmail = $("#inputMemberEmail").val();
  var userPassword = $("#inputMemberPassword").val();
  var userColour = $("#inputMemberColour").val();

  if (userFirstName == "" || userLastName == "" || userEmail == "" || userPassword == "" || userColour == ""){
    alert("Please fill in all fields");
    return;
  }

  if (!EMAIL_REGEX.test(userEmail)){
    alert("Please enter a valid email");
    return;
  }

  if (userPassword.length < 8){
    alert("Password must be at least 8 characters long");
    return;
  }

  let double_email = false;
  //Check if user email is already existing
  const querySnapshot = await getDocs(query(userCollection, where("email", "==", userEmail)));
  querySnapshot.forEach((doc) => {
    alert("Email already exists");
    double_email = true;
  });

  if (double_email) return;

  var user = {
    firstName : userFirstName,
    lastName : userLastName,
    email : userEmail,
    password : userPassword,
    isAdmin : false,
    colour : userColour,
    work_ranges : []
  }

  await addDoc(userCollection, user).then(() => {
    alert("User added successfully");
    window.location.reload();
  });
})

async function sort_by_date(){
  let startDate =  $("#start-date").val();
  let endDate = $("#end-date").val();
  let startTime = new Date(startDate);
  let endTime = new Date(endDate);
  
  userTimeDictionary = new Map();
  let userChildren = $("#product-backlog-table").children();

  for(let i = 1; i < userChildren.length; i++){
    let userChildChildren = $(userChildren[i]).children().last().html();
    let userDoc = await getDoc(doc(db, "user", userChildChildren));
    let user = User.fromJson(userDoc.data());


    userTimeDictionary.set(userChildChildren, new Map());

    let userWorkRanges = user.work_ranges;

    for(let j = 0; j < userWorkRanges.length; j++){
      let userWorkRange = userWorkRanges[j];
      let userWorkRangeStartTime = userWorkRange.start_time.seconds;
      let userWorkRangeEndTime = userWorkRange.end_time.seconds;
      
      let userWorkRangeStartDate = new Date(userWorkRangeStartTime * 1000);
      let userWorkRangeEndDate = new Date(userWorkRangeEndTime * 1000);

      console.log(userWorkRangeStartDate, userWorkRangeEndDate);

      let userWorkRangeStartDateTime = new Date(userWorkRangeStartDate.getTime());
      let userWorkingRangeEndDateTime = new Date(userWorkRangeEndDate.getTime());

      userWorkRangeStartDateTime.setHours(23,59,59,999);
      userWorkingRangeEndDateTime.setHours(0,0,0,0);
      
      let endDate_startOfDay = new Date(userWorkingRangeEndDateTime);
      let startDate_endOfDay = new Date(userWorkRangeStartDateTime);
      
      while (startDate_endOfDay <= userWorkRangeEndDate) {
        let date = new Date(userWorkRangeStartDate);
        let dateString = date.toDateString();
        //check if dictionary has the date as a key
        if (!userTimeDictionary.get(userChildChildren).has(dateString)) {
          userTimeDictionary.get(userChildChildren).set(dateString, 0);
        }

        let dateHours = userTimeDictionary.get(userChildChildren).get(dateString);
        let hoursDiff = startDate_endOfDay.getHours() - userWorkRangeStartDate.getHours();

        if (userWorkRangeStartDate.getMinutes() == 0 && userWorkRangeStartDate.getSeconds() == 0) {
          hoursDiff += 1;
        }

        dateHours += hoursDiff;
        userTimeDictionary.get(userChildChildren).set(dateString, dateHours);
        
        userWorkRangeStartDate.setHours(0,0,0,0);
        userWorkRangeStartDate.setDate(userWorkRangeStartDate.getDate() + 1);
        startDate_endOfDay.setDate(startDate_endOfDay.getDate() + 1);
      }

      //Update the end date
      let date = new Date(userWorkRangeEndDate);
      let dateString = date.toDateString();
      //check if dictionary has the date as a key
      if (!userTimeDictionary.get(userChildChildren).has(dateString)) {
        userTimeDictionary.get(userChildChildren).set(dateString, 0);
      }
      let dateHours = userTimeDictionary.get(userChildChildren).get(dateString);
      let hoursDiff = userWorkRangeEndDate.getHours() - endDate_startOfDay.getHours();
      dateHours += hoursDiff;
      userTimeDictionary.get(userChildChildren).set(dateString, dateHours);
    }}

    console.log(userTimeDictionary);

    for (let i = 1; i < userChildren.length; i++){
      let userChildChildren = $(userChildren[i]).children().last().html();
      let userHoursSum = 0;
      while (startTime <= endTime){
          let startString = startTime.toDateString();
          console.log(startString);

          if (userTimeDictionary.get(userChildChildren).has(startString)){
            userHoursSum += userTimeDictionary.get(userChildChildren).get(startString);
          }
          startTime.setDate(startTime.getDate() + 1);
      }
      startTime = new Date(startDate);
      let userAverage = userHoursSum / ((endTime.getTime() - startTime.getTime())/ (1000 * 3600 * 24));
      userAverage = Math.round(userAverage * 10) / 10;
      $(userChildren[i]).children("#Average_hours").html(userAverage);
    }
  }


$("#add-member-btn").on('click', () => {
  $(`#registerMemberModal`).modal("show");
});

$(".member-sort-date").click(() => {
  $(`#sortDateModal`).modal("show");
});

//DOM ready function
$(async () => {
  console.log("DOM ready");
  await get_user();
});