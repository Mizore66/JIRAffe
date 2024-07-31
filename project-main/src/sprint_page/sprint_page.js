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
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import { Task } from "../entities/task.js";
import { User } from "../entities/user.js";
import { Sprint } from "../entities/sprint.js";
import { firebaseConfig, URGENCY_COLOUR_CODES } from "../../constants.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let db = getFirestore(app);

let productBacklogCollectionRef = collection(db, "product_backlog");
let taskCollectionRef = collection(db, "task");
let sprintCollectionRef = collection(db, "sprints");
let sampleSprint = {};
let editID;

const SP_TABLE_HEADER_ROW_STR = `
                <div class="row jiraffe-table-header-row">
                  <div class="col-3 jiraffe-table-header-col font-weight-bold">Sprint Label</div>
                  <div class="col-sm jiraffe-table-header-col font-weight-bold">Start Date</div>
                  <div class="col-sm jiraffe-table-header-col delete-header-col font-weight-bold">End Date</div>
                  <div class="col-sm jiraffe-table-header-col delete-header-col font-weight-bold">Delete</div>
                  <div class="col-sm jiraffe-table-header-col delete-header-col font-weight-bold">Stop/Start Sprint</div>
                  <div class="col-sm jiraffe-table-header-col delete-header-col font-weight-bold">Edit Sprint</div>
                </div>`;

const PB_TABLE_EMPTY_ROW_STR = `<div class="row jiraffe-table-row-empty"><div class="col-sm jiraffe-table-col-empty"> Add more sprints below👉 </div></div>`;

const PB_TABLE_LOADING_STR = `
<div class="loading-icon-div">
  <div class="load justify-content-center"></div>
  <div class="load-text">We're loading your sprints...</div>
</div>`;

const sprintNotStartedHTML = (sprint) => `<div class="row jiraffe-table-row">
<div class="col-3 jiraffe-table-col font-weight-bold">${sprint.sprint_name}</div>
<div class="col-sm jiraffe-table-col btn font-weight-bold">${sprint.start_date}</div>
<div class="col-sm jiraffe-table-col btn font-weight-bold">${sprint.end_date}</div>
<button type="button" class="col-sm jiraffe-table-col btn" id="delete-btn"><img class="delete-icon" src="../../assets/icons/delete_48x48.png"></button>
<button type="button" class="col-sm jiraffe-table-col btn" id="start-btn"><img class="start-icon" src="../../assets/icons/play_64x64.png"></button>
<button type="button" class="col-sm jiraffe-table-col btn" id="edit-sprint-btn"><img class="edit-icon" src="../../assets/icons/edit_96x96.png"></button>
`;

const sprintInProgressHTML = (sprint) => `<div class="row jiraffe-table-row">
<div class="col-3 jiraffe-table-col font-weight-bold">${sprint.sprint_name}</div>
<div class="col-sm jiraffe-table-col btn font-weight-bold">${sprint.start_date}</div>
<div class="col-sm jiraffe-table-col btn font-weight-bold">${sprint.end_date}</div>
<button type="button" class="col-sm jiraffe-table-col btn" id="delete-btn"><img class="delete-icon" src="../../assets/icons/delete_48x48.png"></button>
<button type="button" class="col-sm jiraffe-table-col btn" id="start-btn"><img class="pause-icon" src='../../assets/icons/stop_96x96.png'></button>
<button type="button" class="col-sm jiraffe-table-col btn" id="edit-sprint-btn"><img class="edit-icon" src="../../assets/icons/edit_96x96.png"></button>
`;

const sprintCompletedHTML = (sprint) => `<div class="row jiraffe-table-row">
<div class="col-3 jiraffe-table-col font-weight-bold">${sprint.sprint_name}</div>
<div class="col-sm jiraffe-table-col btn font-weight-bold">${sprint.start_date}</div>
<div class="col-sm jiraffe-table-col btn font-weight-bold">${sprint.end_date}</div>
<button type="button" class="col-sm jiraffe-table-col btn" id="delete-btn"><img class="delete-icon" src="../../assets/icons/delete_48x48.png"></button>
<button type="button" class="col-sm jiraffe-table-col btn" id="start-btn"><img class="pause-icon" src='../../assets/icons/pause_96x96.png'></button>
<button type="button" class="col-sm jiraffe-table-col btn" id="edit-sprint-btn"><img class="edit-icon" src="../../assets/icons/edit_96x96.png"></button>
`;

//Listen if the row is clicked
$(document).on("dblclick", ".jiraffe-table-row", function () {
  editID = $(this).closest(".jiraffe-table-row").find("#start-btn").html();
  if (editID.includes("pause-icon")){
    window.location.href = '../sprint_board/sprint_board.html';}
})

//Listen for if start button is clicked
$(document).on("click", "#start-btn", async function () {
  //get spintID from the sprint_in_progress doc
  var sprintInProgressSnapshot = await getDoc(doc(db, "sprints", "sprint_in_progress"));
  var sprintID = sprintInProgressSnapshot.data().sprintID;

  if (this.innerHTML.includes("play_64x64")){
  if (sprintID != ""){
    alert("There is already a sprint in progress. Please finish the current sprint before starting a new one.")
  } else{
  let sprint_id = $(this).closest(".jiraffe-table-row").find("div").last().html();
  console.log(sprint_id);
  updateDoc(doc(db, "sprints", "sprint_in_progress"),{
    sprintID: sprint_id,
  })
  this.innerHTML = "<img class='pause-icon' src='../../assets/icons/stop_96x96.png'>"
  window.location.href = '../sprint_board/sprint_board.html';

}} else if (this.innerHTML.includes("stop_96x96")){

  let sprint_id = $(this).closest(".jiraffe-table-row").find("div").last().html();
  console.log(sprint_id);

  updateDoc(doc(db, "sprints", "sprints_completed"),{
    sprints_completed: arrayUnion(sprint_id),
  })
  updateDoc(doc(db, "sprints", "sprint_in_progress"),{
    sprintID: "",
  })


  this.innerHTML = "<img class='start-icon' src='../../assets/icons/pause_96x96.png'>"
};
get_sprints();
})

// Delete a sprint
$(document).on("click", "#delete-btn", async function () {
  var sprintInProgressSnapshot = await getDoc(doc(db, "sprints", "sprint_in_progress"));
  var sprintCompletedSnapshot = await getDoc(doc(db, "sprints", "sprints_completed"));
  var sprintID = sprintInProgressSnapshot.data().sprintID;
  var sprintIDList = sprintCompletedSnapshot.data().sprints_completed;


  let sprint_id = $(this).closest(".jiraffe-table-row").find("div").last().html();
  console.log(sprint_id);

  //Iterate through the tasks in the sprint doc
  let sprintJSON = await getDoc(doc(db, "sprints", sprint_id));
  let taskListJSON = sprintJSON.data()["tasks"];
  taskListJSON.forEach(async (taskID) => {
    // get the task object from the database and map to a Task object
    let docRef = doc(db, "task", taskID);
    let thisTaskDoc = await updateDoc(docRef,{
      stage:"",
    });
  })

  deleteDoc(doc(db, "sprints", sprint_id));

  if (sprintID == sprint_id){
  updateDoc(doc(db, "sprints", "sprint_in_progress"),{
    sprintID: "",
  })};
  if (sprintIDList.includes(sprint_id)){
    updateDoc(doc(db, "sprints", "sprints_completed"),{
      sprints_completed: arrayRemove(sprint_id),
    })};

  get_sprints().then(() => { window.location.reload(); })
})

//Edit a sprint by double clicking the row
$(document).on("click", "#edit-sprint-btn", function () {
  editID = $(this).closest(".jiraffe-table-row").find("div").last().html();
  get_sprint_details(editID);
})

$("#edit-add-btn").click(async () => {
  console.log("EDIT TASKS CLICKED");
let sprint_name = $("#editInputSprintName").val();
let sprint_start_date = $("#editInputStart").val();
let sprint_end_date = $("#editInputEnd").val();

let start_date_actual = new Date(sprint_start_date);
let end_date_actual = new Date(sprint_end_date);
let check = false;

const sprints_data = await getDocs(sprintCollectionRef);
  sprints_data.forEach((document) => {
    if (document.id == "sprint_in_progress" || document.id == "sprints_completed"){
      console.log("wah");
    }else{
    const sprintData = document.data();
    var sprint_start_date_actual = new Date(sprintData.start_date);
    var sprint_end_date_actual = new Date(sprintData.end_date);

    if (start_date_actual - sprint_start_date_actual != 0 && end_date_actual - sprint_end_date_actual != 0){
    if ((start_date_actual >= sprint_start_date_actual && start_date_actual <= sprint_end_date_actual) || (end_date_actual >= sprint_start_date_actual && end_date_actual <= sprint_end_date_actual) || (start_date_actual <= sprint_start_date_actual && end_date_actual >= sprint_end_date_actual)){
      check = true;
      return;
    }}
  }});

if(!check){
let date_diff = end_date_actual - start_date_actual;

if (sprint_name == "" || sprint_start_date == "" || sprint_end_date == "") {
  alert("Please fill in all fields.");
  $("#edit-sp-list-sprint").empty();
} else {
  if (date_diff <= 0){
    alert("Please enter a valid start and end date.");
    $("#edit-sp-list-sprint").empty();
  }else{
  get_tasks(db);

$("#editTaskTransferModal").modal("show");
var sprint_header = document.getElementById("edit-sprint-header");
sprint_header.innerHTML = $("#editInputSprintName").val() + " Backlog";
$("#editSprintModal").modal("hide");
}}}else{
  alert("Please enter a valid start and end date.");
  $("#edit-sp-list-sprint").empty();
}});


$("#edit-save-btn").click(() => {
  let task_list = [];
  let sprint_children = edit_sprint_lst.children;
  let product_backlog_children = edit_product_backlog_lst.children;
  for (let i = 0; i < sprint_children.length; i++) {
    const current_task_div = sprint_children[i];
    const hidden_div_id = current_task_div.id; // get the hidden div name of the task
    console.log(hidden_div_id, "hidden div id")
    updateDoc(doc(db, "task", hidden_div_id),{
      stage: "Not Started",
    });
    task_list.push(hidden_div_id);
  }

  for (let i = 0; i < product_backlog_children.length; i++) {
    const current_task_div = product_backlog_children[i];
    const hidden_div_id = current_task_div.id; // get the hidden div name of the task
    updateDoc(doc(db, "task", hidden_div_id),{
      stage: "",
    });
  }

  var newSprintRef = {
    sprint_name: $("#editInputSprintName").val(),
    start_date: $("#editInputStart").val(),
    end_date: $("#editInputEnd").val(),
    tasks: task_list,
  }
  const docRef = updateDoc(doc(db, "sprints", editID), newSprintRef);
  $("#sprint-creation-form")[0].reset();

  $("#sp-list-product-backlog").empty();
  $("#edit-sp-list-product-backlog").empty();
  $("#sp-list-sprint").empty();
  $("#edit-sp-list-sprint").empty();

  $("#editTaskTransferModal").modal("hide");
  get_sprints().then(() => { window.location.reload(); });
})


//Get a sprint details
async function get_sprint_details(sprint_id){
  let sprintJSON = await getDoc(doc(db, "sprints", sprint_id));
  console.log(sprintJSON.data());
  console.log(sprint_id);
  $("#editInputSprintName").val(sprintJSON.data().sprint_name);
  $("#editInputStart").val(sprintJSON.data().start_date);
  $("#editInputEnd").val(sprintJSON.data().end_date);
  $("#editSprintModal").modal("show");

  let taskListJSON = sprintJSON.data()["tasks"];
  taskListJSON.forEach(async (taskID) => {
    // get the task object from the database and map to a Task object
    let docRef = doc(db, "task", taskID);
    let thisTaskDoc = await getDoc(docRef);
    let thisTask = Task.fromJson(thisTaskDoc.data());
    const taskHTML = `
    <div class="sp-task" id="${taskID}"> 
        ${thisTask.name} 
        <div id="task-json" hidden>${thisTask}</div> 
    </div>`;
    $("#edit-sp-list-sprint").append(taskHTML);
  })
};


async function get_sprints(){
  var sprintInProgressSnapshot = await getDoc(doc(db, "sprints", "sprint_in_progress"));
  var sprintID = sprintInProgressSnapshot.data().sprintID;

  var sprintIDList = await getDoc(doc(db, "sprints", "sprints_completed"));
  var sprintIDList = sprintIDList.data().sprints_completed;

  $("#product-backlog-table").empty();
  $("#product-backlog-table").append(SP_TABLE_HEADER_ROW_STR);
  $("#product-backlog-table").append(PB_TABLE_LOADING_STR);
  const sprints_data = await getDocs(sprintCollectionRef);
  sprints_data.forEach((document) => {
    if (document.id == "sprint_in_progress" || document.id == "sprints_completed"){
      console.log("wah");
    }else{
    const sprintData = document.data();
    console.log(document.data());
    const sprint = Sprint.fromJSON(sprintData);
    console.log(sprint);

    let actual_start = new Date(sprint.start_date);
    let now = Date.now();

    console.log(now - actual_start, sprint.tasks_completed == []);

    if ((now - actual_start) >= 0 && sprint.tasks_completed.length == 0 && sprint.tasks_inProgress.length == 0 && sprint.tasks_notStarted.length == 0){
      console.log("is this cookin?");
      let docRef = doc(db, "sprints", "sprint_in_progress");
      updateDoc(docRef,{
        sprintID: document.id,
      });
      sprintID = document.id;
  };

    if (document.id == sprintID)
    {
      var sprintHTML = sprintInProgressHTML(sprint);
      } else if (sprintIDList.includes(document.id)){
        var sprintHTML = sprintCompletedHTML(sprint);
      }
      else
    {
    var sprintHTML = sprintNotStartedHTML(sprint);
  }
  
    sprintHTML += (`<div id="${sprint.sprint_name}_id" hidden>${document.id}</div></div>`);
    $("#product-backlog-table").append(sprintHTML);
  }});
  $(".loading-icon-div").remove();
  $("#product-backlog-table").append(PB_TABLE_EMPTY_ROW_STR);
};
// Event listeners to show modals on click
$("#view-graph-btn").on('click', () => {
  $(`#graphModal`).modal("show");
});


$("#create-sprint-btn").on('click', () => {
  $(`#createSprintModal`).modal("show");
  //Console logs the values in the sprint creation form if the Add Task button is clicked
//Resets the form after console logging
});

$("#add-btn").on('click', async () => {
  console.log("ADD TASKS CLICKED");
  let sprint_name = $("#inputSprintName").val();
  let sprint_start_date = $("#inputStart").val();
  let sprint_end_date = $("#inputEnd").val();

  let start_date_actual = new Date(sprint_start_date);
  let end_date_actual = new Date(sprint_end_date);
  let check = false;

  //Check if start and end date collide with other sprints start and end date
  const sprints_data = await getDocs(sprintCollectionRef);
  sprints_data.forEach((document) => {
    if (document.id == "sprint_in_progress" || document.id == "sprints_completed"){
      console.log("wah");
    }else{
    const sprintData = document.data();
    var sprint_start_date_actual = new Date(sprintData.start_date);
    var sprint_end_date_actual = new Date(sprintData.end_date);

    if ((start_date_actual >= sprint_start_date_actual && start_date_actual <= sprint_end_date_actual) || (end_date_actual >= sprint_start_date_actual && end_date_actual <= sprint_end_date_actual) || (start_date_actual <= sprint_start_date_actual && end_date_actual >= sprint_end_date_actual)){
      check = true;
      return;
    }
  }});

  if(!check){
  let date_diff = end_date_actual - start_date_actual;

  if (sprint_name == "" || sprint_start_date == "" || sprint_end_date == "") {
    alert("Please fill in all fields.");
    $("#sprint-creation-form")[0].reset();
  } else {
    if (date_diff <= 0){
      alert("Please enter a valid start and end date.");
      $("#sprint-creation-form")[0].reset();
    }else{
    get_tasks(db);
  sampleSprint = {
    project_ID: "project1",
    sprint_name: sprint_name,
    tasks_notStarted: [],
    tasks_inProgress: [],
    tasks_completed: [],
    start_date: sprint_start_date,
    end_date: sprint_end_date,
    tasks: [],
  }
  $("#createSprintModal").modal("hide");
  var sprint_header = document.getElementById("sprint-header");
  sprint_header.innerHTML = $("#inputSprintName").val() + " Backlog";
  $('#taskTransferModal').modal('show');
}}}else{
  alert("Please enter a valid start and end date.");
  $("#sprint-creation-form")[0].reset();
}});

$(".cancel-btn").on('click', () => {
  console.log("DO YOU EVEN FUCKING WORK?");
  $("#sprint-creation-form")[0].reset();
  $("#sprint-edit-form")[0].reset();
  $("#sp-list-product-backlog").empty();
  $("#edit-sp-list-product-backlog").empty();
  $("#sp-list-sprint").empty();
  $("#edit-sp-list-sprint").empty();
})

$("#save-btn").on('click', () => {
  console.log("ADD SAVE TASKS CLICKED");
  let task_list = [];
  let sprint_children = sprint_lst.children;
  for (let i = 0; i < sprint_children.length; i++) {
    console.log("sup?");
    const current_task_div = sprint_children[i];
    const hidden_div_task_id = current_task_div.id; // get the hidden div name of the task
    updateDoc(doc(db, "task", hidden_div_task_id),{
      stage: "Not Started",
    });
    task_list.push(hidden_div_task_id);
    }
  var newSprintRef = {
    ...sampleSprint,
    tasks: task_list,
  }
  const docRef = addDoc(sprintCollectionRef, newSprintRef);
  $("#sprint-creation-form")[0].reset();

  $("#sp-list-product-backlog").empty();
  $("#edit-sp-list-product-backlog").empty();
  $("#sp-list-sprint").empty();
  $("#edit-sp-list-sprint").empty();

  $("#taskTransferModal").modal("hide");
  get_sprints().then(() => {
    window.location.reload();
  });
});


const product_backlog_lst = document.getElementById("sp-list-product-backlog");
const sprint_lst = document.getElementById("sp-list-sprint");
const ADD_SHARED_GROUP_NAME = "add-shared";

const edit_product_backlog_lst = document.getElementById("edit-sp-list-product-backlog");
const edit_sprint_lst = document.getElementById("edit-sp-list-sprint");
const EDIT_SHARED_GROUP_NAME = "add-shared";

let sortable_product_backlog = new Sortable(product_backlog_lst, {
  group: ADD_SHARED_GROUP_NAME,
  animation: 300,
  onended: function (evt) {
    console.log(evt);
  },
});
let sortable_sprint = new Sortable(sprint_lst, {
  group: ADD_SHARED_GROUP_NAME,
  animation: 300,
  onended: function (evt) {
    console.log(evt);
  },
});

let edit_sortable_product_backlog = new Sortable(edit_product_backlog_lst, {
  group: EDIT_SHARED_GROUP_NAME,
  animation: 300,
  onEnd: function (evt) {
    console.log(evt);
  },
});
let edit_sortable_sprint = new Sortable(edit_sprint_lst, {
  group: EDIT_SHARED_GROUP_NAME,
  animation: 300,
  onended: function (evt) {
    console.log(evt);
  },
});


$(async function () {
  get_sprints()
});

async function get_tasks(db) {
  // get the list of tasks from the product backlog
  const productBacklogSnapshot = await getDoc(
    doc(db, "product_backlog", "backlog")
  );

  let taskListJSON = productBacklogSnapshot.data()["task_list"];

  if (productBacklogSnapshot.exists()) {
    // Promise.all fulfills all promises in parallel
    let taskList = await Promise.all(
      taskListJSON.map(async (taskID) => {
        // get the task object from the database and map to a Task object
        
        let docRef = doc(db, "task", taskID);
        let thisTaskDoc = await getDoc(docRef);
        if (thisTaskDoc.data().stage != "Not Started"){
        let thisTask = Task.fromJson(thisTaskDoc.data());
        
        // get the user object from the database and map to a User object
        let thisUserDoc = await getDoc(
          doc(db, "user", thisTaskDoc.data().assignee)
        );
        let thisUser = User.fromJson(thisUserDoc.data());

        return [taskID, thisTask, thisUser]; // TIP: thisTask already HAS the userID!!
      }else{
        console.log("WAH");
      }})
    );

    console.log(taskList);

    taskList.forEach((task) => {
      if (task == undefined){}else{
      const taskHTML = `
      <div class="sp-task" id="${task[0]}"> 
          ${task[1].name} 
          <div id="task-json" hidden>${task[1]}</div> 
      </div>`;
      $("#sp-list-product-backlog").append(taskHTML);
      $("#edit-sp-list-product-backlog").append(taskHTML);
  }});
    }
  }
