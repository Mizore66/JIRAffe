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
} from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

import { Task } from "../entities/task.js";
import { User } from "../entities/user.js";
import { firebaseConfig, URGENCY_COLOUR_CODES } from "../../constants.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let db = getFirestore(app);

const PB_TABLE_HEADER_ROW_STR = `
<div class="row jiraffe-table-header-row">
  <div class="col-sm jiraffe-table-header-col"> Name </div>
  <div class="col-sm jiraffe-table-header-col"> Tag</div>
  <div class="col-sm jiraffe-table-header-col"> Urgent Status</div>
  <div class="col-sm jiraffe-table-header-col assignee-header-col"> Assigned To</div>
  <div class="col-sm jiraffe-table-header-col"> Story Points</div>
  <div class="col-1 jiraffe-table-header-col delete-header-col"> Delete</div>
</div>`;

// const PB_TABLE_EMPTY_ROW_STR = `
// <div class="row jiraffe-table-row-empty">
//     <div class="col-sm jiraffe-table-col-empty"> Add more tasks below👉 </div>
// </div>`;
const PB_TABLE_EMPTY_ROW_STR = `<div class="row jiraffe-table-row-empty"><div class="col-sm jiraffe-table-col-empty"> Add more tasks below👉 </div></div>`;

const PB_TABLE_LOADING_STR = `
<div class="loading-icon-div">
  <div class="load justify-content-center"></div>
  <div class="load-text">We're loading your tasks...</div>
</div>`;


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
        let thisTask = Task.fromJson(thisTaskDoc.data());
        
        // console.log(docRef);
        // console.log(thisTaskDoc);
        // console.log(thisTask);

        // get the user object from the database and map to a User object
        let thisUserDoc = await getDoc(
          doc(db, "user", thisTaskDoc.data().assignee)
        );
        let thisUser = User.fromJson(thisUserDoc.data());

        return [taskID, thisTask, thisUser]; // TIP: thisTask already HAS the userID!!
      })
    );

    // console.log(taskList);

    // remove all rows from the table with the class "jiraffe-table-row"
    $("#product-backlog-table").empty();
    $(".jiraffe-table-row").remove();
    $(".jiraffe-table-header-row").remove();
    $(".jiraffe-table-row-empty").remove();
    $(".row-entry").remove()
    

    let appendString = PB_TABLE_HEADER_ROW_STR;

    if ($("#tag").val() != "All") {
      taskList = taskList.filter((task) => {
        return task[1].tag == $("#tag").val();
      });
    }

    //sorting the tasklist based on the urgency of the task
    taskList.sort((a, b) => {
      return b[1].urgency - a[1].urgency;
    })

    // for each task in the list, add a row to the table
    var rowCounter = 0;
    taskList.forEach((task) => {
      const urgencyColourData = URGENCY_COLOUR_CODES[task[1].urgency];

      if (!$(".checkbox").is(":checked")) {
        
        var str = `
        <div class="row jiraffe-table-row edit-col">
          <div class="col-sm jiraffe-table-col">${task[1].name}</div>
          <div class="col-sm jiraffe-table-col">${task[1].tag}</div>
          <div class="col-sm jiraffe-table-col">
            <div class="badge badge-light chip-${urgencyColourData[0]}-tag">${
        urgencyColourData[1]
      }</div>
            </div>
            <div class="col-sm jiraffe-table-col assignee-col">
            <div class="badge chip-name-tag" data-toggle="popover" data-placement="right" data-trigger="hover" 
            data-content="${
              task[2].firstName + " " + task[2].lastName
            }" style="background-color:${task[2].colour}">
            ${task[2].firstName[0].toUpperCase()}
            </div>
            </div>
            <div class="col-sm jiraffe-table-col">${task[1].story_points}</div>
            <button type="button" class="col-1 jiraffe-table-col delete-col btn">
            <img class="delete-icon" src="../../assets/icons/delete_48x48.png">
            </button>
            <div hidden id=thisTaskID> ${task[0]} </div>
            <div hidden id=thisTask> ${task[1].toJSON()} </div>
            <div hidden id=thisUser> ${task[2].toJSON()} </div>
            
            </div>`;

        appendString += str;
      }else{
        const urgencyColourData = URGENCY_COLOUR_CODES[task[1].urgency];
        if (rowCounter%3 == 0){
        var str = `
        <div class="row-entry" id="row-${rowCounter/3}">
        <div class="card">
            <div class="card-body edit-col">
                <div class="entry-title">
                    <div class="card-title">
                        <div class="badge chip-name-tag" data-toggle="popover" data-placement="right" data-trigger="hover" data-content="${
                          task[2].firstName + " " + task[2].lastName
                        }" style="background-color:${task[2].colour}" data-original-title="" title="">
                        ${task[2].firstName[0].toUpperCase()}
                        </div>
                    </div>
                    <div class="card-urgency">
                        <div class="badge badge-light chip-${urgencyColourData[0]}-tag">${
                          urgencyColourData[1]
                        }</div>
                    </div>
                </div>
                <h6 class="card-subtitle mb-2 font-weight-bold">${task[1].name}</h6> 
                <p class="card-text">Tag: ${task[1].tag}</p>
                <p class="card-text">Story Point Value: ${task[1].story_points}</p>
                <button type="button" class="col-1 jiraffe-table-col delete-col btn float-right">
                    <img class="delete-icon" src="../../assets/icons/delete_48x48.png">
                </button>
                <div hidden id=thisTaskID> ${task[0]} </div>
            <div hidden id=thisTask> ${task[1].toJSON()} </div>
            <div hidden id=thisUser> ${task[2].toJSON()} </div>
            </div>
        </div></div>`;
        $(".product-backlog-div").append(str);
        } else {
          var str = `<div class="card">
          <div class="card-body edit-col">
              <div class="entry-title">
                  <div class="card-title">
                    <div class="badge chip-name-tag" data-toggle="popover" data-placement="right" data-trigger="hover" data-content="${
                      task[2].firstName + " " + task[2].lastName
                    }" style="background-color:${task[2].colour}" data-original-title="" title="">
                    ${task[2].firstName[0].toUpperCase()}
                    </div>
                  </div>
                  <div class="card-urgency">
                      <div class="badge badge-light chip-${urgencyColourData[0]}-tag">${
                        urgencyColourData[1]
                      }</div>
                  </div>
              </div>
              <h6 class="card-subtitle mb-2 font-weight-bold">${task[1].name}</h6> 
              <p class="card-text">Tag: ${task[1].tag}</p>
              <p class="card-text">Story Point Value: ${task[1].story_points}</p>
              <button type="button" class="col-1 jiraffe-table-col delete-col btn float-right">
                  <img class="delete-icon" src="../../assets/icons/delete_48x48.png">
              </button>
              <div hidden id=thisTaskID> ${task[0]} </div>
            <div hidden id=thisTask> ${task[1].toJSON()} </div>
            <div hidden id=thisUser> ${task[2].toJSON()} </div>
          </div>
      </div></div>`;
          $("#row-"+Math.floor(rowCounter/3)).append(str);
        }
      rowCounter++;
      }
    });
    
    if (!$(".checkbox").is(":checked")) {
      appendString += PB_TABLE_EMPTY_ROW_STR;
      $("#product-backlog-table").append(appendString);
    }

    $(".loading-icon-div").remove();

    // Initialize tooltip and popover components
    $(() => $('[data-toggle="tooltip"]').tooltip());
    $(() => $('[data-toggle="popover"]').popover());

    // setup click event for edit button
    $(".edit-col").on("dblclick", function () {
      // get the content of the hidden divs
      let thisTaskID = $(this).children("#thisTaskID").text();
      let thisTask = $(this).children("#thisTask").text();
      let thisUser = $(this).children("#thisUser").text();

      console.log(thisTaskID);
      console.log(thisTask);
      console.log(thisUser);

      window.location.href = `../edit_task/edit_task.html?taskID=${thisTaskID}&task=${thisTask}&user=${thisUser}`;
    });

    // setup click event for delete button
    $(".delete-col").on("click", function () {
      // get the content of the hidden divs
      let thisTaskID = $(this).siblings("#thisTaskID").text();
      let thisTask = $(this).siblings("#thisTask").text();
      let thisUser = $(this).siblings("#thisUser").text();
      thisTaskID = thisTaskID.slice(1,-1)

      console.log(thisTaskID);
      console.log(thisTask);
      console.log(thisUser);

      // delete the task from the database
      let docRef = doc(db, "task", thisTaskID);
      let docRef2 = doc(db, "product_backlog", "backlog");

      $(`#deleteModal`).modal("show");

      $("#delete-btn").on("click", function () {


      updateDoc(docRef2, {
        task_list: arrayRemove(thisTaskID),
      })
        .then(() => {
          deleteDoc(docRef)
            .then(() => {
              window.location = "product_backlog.html";
            })
            .catch((error) => {
              alert("Unsuccessful operation, error: " + error);
            });
        })
        .catch((error) => {
          alert("Unsuccessful operation, error: " + error);
        });
      })});
  } else {
    // show a message saying that there are no tasks in the product backlog
    $("#product-backlog-table").empty();
    $(".jiraffe-table-row").remove();
    $(".jiraffe-table-header-row").remove();
    $(".jiraffe-table-row-empty").remove();
    $("#product-backlog-table").append(PB_TABLE_HEADER_ROW_STR);
    // $("#product-backlog-table").append(PB_TABLE_EMPTY_ROW_STR);
    $("#product-backlog-table").append(PB_TABLE_LOADING_STR);

  }
}

$(function () {
  get_tasks(db);

  $("#tag").on("change", function () {
    get_tasks(db);
  });
  $(".remove-btn").on("click", function () {
    $("#tag").val("All");
    get_tasks(db);
  })
});


$(".checkbox").on("click", function () {
  get_tasks(db);
});
