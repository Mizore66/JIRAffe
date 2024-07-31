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
let thisTaskID;

const CURRENT_YEAR_DIFF = new Date().getFullYear() - 1970 + 1;

// [not_started_lst , in_progress_lst, completed_lst]
const div_list = [
  document.getElementById("sp-list-not-started"),
  document.getElementById("sp-list-in-progress"),
  document.getElementById("sp-list-completed"),
];

const SHARED_GROUP_NAME = "shared";
const SORTABLE_ANIMATION_TIME_MS = 150;
const ALLOW_MULTIDRAG = false;

// one hidden div each for the task id, task details and user details
const taskHTML = (task, user) => `
<div class="sp-task"> 
    ${task.name} 
    <div id="task-id" hidden>${task.id}</div> 
    <div id="task-json" hidden>${task.toJSON()}</div> 
    <div id="user-json" hidden>${user.toJSON()}</div> 
</div>`;

const sprintIDSnapshot = await getDoc(doc(db, "sprints", "sprint_in_progress"));
const sprintID = sprintIDSnapshot.data()["sprintID"];

var STARTING_BOARD_DATA = {
  tasks_notStarted: [],
  tasks_inProgress: [],
  tasks_completed: [],
  isStateSaved: false,
};

var CURRENT_BOARD_DATA = {
  tasks_notStarted: [],
  tasks_inProgress: [],
  tasks_completed: [],
  isStateSaved: false,
};

function handleBeforeUnloadEvent(e) {
  // console.log("---- beforeunload event triggered");
  var ans = CURRENT_BOARD_DATA.isStateSaved;
  // console.log(ans); 
  if (!ans){
    e.preventDefault();
    e.returnValue = "";
  }
}

function createSortableList(div_list) {
  return new Sortable(div_list, {
    multiDrag: ALLOW_MULTIDRAG,
    group: SHARED_GROUP_NAME,
    animation: SORTABLE_ANIMATION_TIME_MS,
    onEnd: (evt) => {
      var ans = isCurrentStateSaved();
      CURRENT_BOARD_DATA = getCurrentSprintBoardState();
      CURRENT_BOARD_DATA.isStateSaved = ans;
      // console.log(`isCurrentStateSaved() ---> ${ans}`);
      // console.log(evt.to.id);
      // if (evt.to.id == "sp-list-completed") {
      //   // get the end_time of the task that was moved to the completed column
      //   let task_id = evt.item.children[0].innerHTML;
      //   // get a Snapshot of the task doc
      //   let x = firebase.firestore.FieldValue.serverTimestamp();
      //   console.log(x);
      // }
      if (!ans) {
        window.addEventListener("beforeunload", handleBeforeUnloadEvent);
      } else {
        window.removeEventListener("beforeunload", handleBeforeUnloadEvent);
      }
    },
  });
}

function createBurndownChart(actual_data, ideal_data){


  return new Chart(document.getElementById("acquisitions"), {
    data: {
      datasets: [
        { 
          type: 'line',
          label: 'Ideal Burndown',
          data: ideal_data.map(row => row.y),
        },
        {
          type: 'line',
          label: 'Actual Burndown',
          data: actual_data.map(row => row.y),
        },
      ],
      labels: actual_data.map((row) => row.x),
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Date",
          }
        },
        y: {
          title: {
            display: true,
            text: "Story Points",
          }
        }
      }
    }
  });




}

const sortable_lst = div_list.map((lst) => createSortableList(lst));

/** Updates the data in the three boards to avoid duplication */
async function updateSprintBoardLists() {
  const sprintDocRef = await doc(db, "sprints", sprintID);
  const sprintSnapshot = await getDoc(sprintDocRef);
  let sprintData = sprintSnapshot.data();
  let sprintTasks = sprintData["tasks"];
  let sprintTasksNotStarted = sprintData["tasks_notStarted"];
  let sprintTasksInProgress = sprintData["tasks_inProgress"];
  let sprintTasksCompleted = sprintData["tasks_completed"];
  let updatedTasks = [];

  // update the tasks in the sprint doc
  sprintTasks.forEach((task) => {
    if (!(sprintTasksInProgress.includes(task) || sprintTasksCompleted.includes(task))) {
      updatedTasks.push(task);
    }
  });

  await updateDoc(sprintDocRef, {
    tasks_notStarted: updatedTasks,
  });
}

/** Get the current state of the sprint board and return it as a dictionary */
function getCurrentSprintBoardState() {
  // get the task IDs of all children of the "Not Started" column
  let not_started_data = [];
  $("#sp-list-not-started").children().each(function () {
      const task_id = $(this).children()[0].innerHTML;
      not_started_data.push(task_id);
    });

  // get the task IDs of all children of the "In Progress" column
  let in_progress_data = [];
  $("#sp-list-in-progress").children().each(function () {
      const task_id = $(this).children()[0].innerHTML;
      in_progress_data.push(task_id);
    });

  // get the task IDs of all children of the "Completed" column
  let completed_data = [];
  $("#sp-list-completed").children().each(function () {
      const task_id = $(this).children()[0].innerHTML;
      completed_data.push(task_id);
    });

  // return the dictionary
  return {
    tasks_notStarted: not_started_data,
    tasks_inProgress: in_progress_data,
    tasks_completed: completed_data,
    isStateSaved: false,
  };
}

/** triggered when the "save" button is clicked, updates the current
 *  state of all three columns in the currrent sprint doc in firebase */
async function updateSprintBoardData(new_board_data) {
  // console.log("---- Updating sprint board data");

  const sprintDocRef = await doc(db, "sprints", sprintID);  

  // update the sprint data in the sprint doc
  await updateDoc(sprintDocRef, {
    tasks_notStarted: new_board_data.tasks_notStarted,
    tasks_inProgress: new_board_data.tasks_inProgress,
    tasks_completed: new_board_data.tasks_completed,
  })
    .then(() => {
      // console.log("---- Sprint board data updated successfully");
    })
    .catch((error) => {
      alert(error);
    });
}

/** Sets the data retreived from Firebase, onto the UI */
function setSprintBoardData(new_board_data) {
  // remove all children from all three columns using jquery
  $("#sp-list-not-started").empty();
  $("#sp-list-in-progress").empty();
  $("#sp-list-completed").empty();

  // // add all the tasks from the new_board_data to the columns using jquery
  // console.log(new_board_data);

  new_board_data.tasks_notStarted.forEach((task) => {
    const userDocRef = doc(db, "user", task.assignee);
    getDoc(userDocRef).then((userSnapshot) => {
      const userData = userSnapshot.data();
      const user = User.fromJson(userData);
      const taskHTMLString = taskHTML(task, user);
      $("#sp-list-not-started").append(taskHTMLString);
    });
    // const taskHTMLString = taskHTML(task);
    // $("#sp-list-not-started").append(taskHTMLString);
  });

  new_board_data.tasks_inProgress.forEach((task) => {
    const userDocRef = doc(db, "user", task.assignee);
    getDoc(userDocRef).then((userSnapshot) => {
      const userData = userSnapshot.data();
      const user = User.fromJson(userData);
      const taskHTMLString = taskHTML(task, user);
      $("#sp-list-in-progress").append(taskHTMLString);
    });
    // const taskHTMLString = taskHTML(task);
    // $("#sp-list-in-progress").append(taskHTMLString);
  });

  new_board_data.tasks_completed.forEach((task) => {
    const userDocRef = doc(db, "user", task.assignee);
    getDoc(userDocRef).then((userSnapshot) => {
      const userData = userSnapshot.data();
      const user = User.fromJson(userData);
      const taskHTMLString = taskHTML(task, user);
      $("#sp-list-completed").append(taskHTMLString);
    });
    // const taskHTMLString = taskHTML(task);
    // $("#sp-list-completed").append(taskHTMLString);
  });
}

/** Pull the current state of all three columns from the corresponding sprint doc in firebase */
async function getSprintBoardData() {
  var TEMP_BOARD_DATA = {
    tasks_notStarted: [],
    tasks_inProgress: [],
    tasks_completed: [],
  };

  const sprintDocRef = doc(db, "sprints", sprintID);

  // get the sprint data from the sprint doc
  const sprintSnapshot = await getDoc(sprintDocRef);
  let sprintData = sprintSnapshot.data();
  // console.log(sprintData);

  const notStartedTasks = sprintData["tasks_notStarted"];
  const inProgressTasks = sprintData["tasks_inProgress"];
  const completedTasks = sprintData["tasks_completed"];

  for (let i = 0; i < notStartedTasks.length; i++) {
    const taskID = notStartedTasks[i];
    const taskDocRef = doc(db, "task", taskID);
    const taskSnapshot = await getDoc(taskDocRef);
    // const taskData = { id: taskSnapshot.id, ...taskSnapshot.data()};
    const taskData = taskSnapshot.data();
    const task = Task.fromJson(taskData);
    task.id = taskID;
    TEMP_BOARD_DATA.tasks_notStarted.push(task);
  }

  for (let i = 0; i < inProgressTasks.length; i++) {
    const taskID = inProgressTasks[i];
    const taskDocRef = doc(db, "task", taskID);
    const taskSnapshot = await getDoc(taskDocRef);
    const taskData = taskSnapshot.data();
    // const taskData = { id: taskSnapshot.id, ...taskSnapshot.data() };
    const task = Task.fromJson(taskData);
    task.id = taskID;
    TEMP_BOARD_DATA.tasks_inProgress.push(task);
  }

  for (let i = 0; i < completedTasks.length; i++) {
    const taskID = completedTasks[i];
    const taskDocRef = doc(db, "task", taskID);
    const taskSnapshot = await getDoc(taskDocRef);
    // const taskData = { id: taskSnapshot.id, ...taskSnapshot.data() };
    const taskData = taskSnapshot.data();
    const task = Task.fromJson(taskData);
    task.id = taskID;
    TEMP_BOARD_DATA.tasks_completed.push(task);
  }

  return TEMP_BOARD_DATA;
}

/** Compares the current state of the sprint board with the state in the database,
 *  and tells if there is any difference between the two.
 *  @returns true when there is a diff, indicating that the current state is not saved in the firebase DB
 *  @returns false when there's no diff, indicating otherwise. */
function isCurrentStateSaved() {
  // console.log("---- areThereUnsavedChanges() ---- Checking if there are any unsaved changes");

  var start_board_data = STARTING_BOARD_DATA;
  var current_board_data = getCurrentSprintBoardState();

  // console.log("STARTING BOARD DATA ----> ");
  // console.log(start_board_data);
  // console.log("CURRENT BOARD DATA ----> ");
  // console.log(current_board_data);

  // to check if the two states are the same
  let isnotStartedChanged = false;
  let isinProgressChanged = false;
  let iscompletedChanged = false;

  // convert the arrays to sets and compare them
  let start_notStartedSet = new Set(start_board_data.tasks_notStarted);
  let current_notStartedSet = new Set(current_board_data.tasks_notStarted);
  for (var task of start_notStartedSet) {
    if (!current_notStartedSet.has(task)) {
      isnotStartedChanged = true;
      break;
    }
  }

  let start_inProgressSet = new Set(start_board_data.tasks_inProgress);
  let current_inProgressSet = new Set(current_board_data.tasks_inProgress);
  for (var task of start_inProgressSet) {
    if (!current_inProgressSet.has(task)) {
      isinProgressChanged = true;
      break;
    }
  }

  let start_completedSet = new Set(start_board_data.tasks_completed);
  let current_completedSet = new Set(current_board_data.tasks_completed);
  for (var task of start_completedSet) {
    if (!current_completedSet.has(task)) {
      iscompletedChanged = true;
      break;
    }
  }

  // use the boolean values to determine if there are any changes
  return !(isnotStartedChanged || isinProgressChanged || iscompletedChanged);
}

function getDifferenceOfDays1(date_1, date_2) {
  let date_1_obj = new Date(date_1);
  let date_2_obj = new Date(date_2);

  let date_difference = date_2_obj - date_1_obj; // get the difference in milliseconds
  let day_difference = date_difference / (1000 * 3600 * 24); // convert the difference in milliseconds to days
  return day_difference;
}

function getDifferenceOfDays2(date_1, date_2) {
  let date_1_obj = new Date(date_1);
  let date_2_obj = DateTimeUtils.convertTimestampToDate(date_2);

  let date_difference = date_2_obj - date_1_obj; // get the difference in milliseconds
  let day_difference = Math.floor(date_difference / (1000 * 3600 * 24)); // convert the difference in milliseconds to days
  return day_difference;
}

/** Get the data needed for the burndown chart, at any given time */
async function get_current_burndown_chart_data(sprint_id) {
  let sprintRef = doc(db, "sprints", sprint_id);
  let sprintSnap = await getDoc(sprintRef);
  let sprintData = sprintSnap.data();

  // get the sprint start date
  let sprint_start_date = sprintData.start_date;

  // get the sprint end date
  let sprint_end_date = sprintData.end_date;

  // get the number of days in the sprint
  let num_days_in_sprint =
    getDifferenceOfDays1(sprint_start_date, sprint_end_date) + 1;

  // iterate through the list of tasks in the sprint and get the story points of each task
  let sprint_tasks = sprintData.tasks;
  let total_story_points = 0;
  for (let i = 0; i < sprint_tasks.length; i++) {
    let task_id = sprint_tasks[i];
    let taskRef = doc(db, "task", task_id);
    let taskSnap = await getDoc(taskRef);
    let taskData = taskSnap.data();
    total_story_points += Number.parseInt(taskData.story_points);
  }
  console.log(`total_story_points: ${total_story_points}`);

  // create the sprint_lst
  let sprint_lst = [];

  for (let i = 0; i < num_days_in_sprint; i++) {
    let day = new Date(sprint_start_date);
    day.setDate(day.getDate() + i);
    day = day.toLocaleDateString();
    sprint_lst.push({
      x: day,
      y: total_story_points,
    });
  }

  // get the tasks in the "completed" column
  let completed_tasks = sprintData.tasks_completed;

  let task_list = await Promise.all(
    completed_tasks.map(async (task_id) => {
      let taskRef = doc(db, "task", task_id);
      let taskSnap = await getDoc(taskRef);
      let taskData = {
        id: taskSnap.id,
        ...taskSnap.data(),
      };
      return taskData;
    })
  );

  for (let i = 0; i < task_list.length; i++) {
    let task = task_list[i];

    // get the date that the task was completed.
    let task_completion_date = task.end_time;

    // get the date difference between the task completion date and the sprint start date.
    let day_difference = getDifferenceOfDays2(
      sprint_start_date,
      task_completion_date
    );

    for (let j = day_difference; j < sprint_lst.length; j++) {
      sprint_lst[j].y -= Number.parseInt(task.story_points);
    }
  }

  // console.log(sprint_lst);

  return sprint_lst;
}

$(async () => {
  if (sprintID == "") {
  } else {
    updateSprintBoardLists();

    var fetched_board_data = await getSprintBoardData();
    // console.log("DATA FETCHED FROM THE SPRINT DOC");
    // console.log(fetched_board_data);

    setSprintBoardData(fetched_board_data);

    // setTimeout used to ensure STARTING_BOARD_DATA is set after fetched_board_data
    setTimeout(() => {
      STARTING_BOARD_DATA = getCurrentSprintBoardState();
      // console.log("STARTING BOARD DATA ----> ");
      // console.log(STARTING_BOARD_DATA);
    }, 800);
  }
});

$("#save-board-order-btn").on("click", async () => {
  const new_board_data = getCurrentSprintBoardState();
  // console.log("DATA FETCHED FROM THE CURRENT BOARD UI ---> TO BE UPDATED IN FIREBASE");
  //   console.log(new_board_data);
  await updateSprintBoardData(new_board_data);

  let burndown_data = await get_current_burndown_chart_data(sprintID);

  // push the burndown data to the firebase DB
  let sprintRef = doc(db, "sprints", sprintID);
  await updateDoc(sprintRef, {
    burndown_dataset: burndown_data,
  });
});

$("#view-graph-btn").on("click", async () => {
  // retrieve the burndown data from the firebase DB
  let sprintRef = doc(db, "sprints", sprintID);
  let sprintSnap = await getDoc(sprintRef);
  let sprintData = sprintSnap.data();
  let data = sprintData.burndown_dataset;

  // create another dataset  for the ideal burndown
  let ideal_burndown = [];
  let total_story_points = data[0].y;
  let num_days_in_sprint = data.length;
  let story_points_per_day = total_story_points / (num_days_in_sprint - 1);
  console.log(story_points_per_day);
  for (let i = 0; i < num_days_in_sprint; i++) {
    let day = new Date(data[0].x);
    day.setDate(day.getDate() + i);
    day = day.toLocaleDateString();
    ideal_burndown.push({
      x: day,
      y: total_story_points - story_points_per_day * i,
    });
  }
  console.log(ideal_burndown);

  const burndown_chart = createBurndownChart(data, ideal_burndown);
  $('#close-chart-btn').on('click', () => burndown_chart.destroy());

  $(`#graphModal`).modal("show");
});




// setup click event for delete button
$(document.body).on("click", ".sp-task", function () {
  // console.log("---------------------------- clicked .sp-task");

  // get the content of the hidden divs and map them back to their respective objects
  thisTaskID = $(this).find("#task-id").text();
  let thisTask = $(this).find("#task-json").text();
  let thisUser = $(this).find("#user-json").text();

  thisTask = Task.fromJson(JSON.parse(thisTask));
  thisUser = User.fromJson(JSON.parse(thisUser));

  // console.log(thisTaskID);
  // console.log(thisTask);
  // console.log(thisUser);

  // delete the task from the database
  let docRef = doc(db, "task", thisTaskID);

  // set the value of the modal fields to the values of the task
  $("#sprint-board-task-modal-title").html(thisTask.name);
  $("#task-assignee").val(`${thisUser.firstName} ${thisUser.lastName}`);

  // get the start and end times of the task recorded from the Firebase DB
  let start_time = thisTask.start_time;
  let end_time = thisTask.end_time;
  let time_diff_string = "";

  if (start_time == undefined || start_time == null) {
    start_time = {
      seconds: CURRENT_YEAR_DIFF * 365 * 24 * 60 * 60,
      nanoseconds: 0,
    };
  }
  if (end_time == undefined || end_time == null) {
    end_time = {
      seconds: CURRENT_YEAR_DIFF * 365 * 24 * 60 * 60 + 100000,
      nanoseconds: 0,
    };
  }
  if (thisTask.total_time == undefined || thisTask.total_time == null) {
    thisTask.total_time = DateTimeUtils.timeDifference(start_time, end_time);
  }

  start_time = DateTimeUtils.convertTimestampToDatetimeLocal(start_time);
  end_time = DateTimeUtils.convertTimestampToDatetimeLocal(end_time);
  time_diff_string = DateTimeUtils.timeDifferenceString(thisTask.total_time);
  // console.log( "Receiving data: Timestamp ---> datetime-local " );
  // console.log( start_time );
  // console.log( end_time );

  $("#start-task-time").val(start_time);
  $("#end-task-time").val(end_time);
  $("#time-spent").html(time_diff_string);

  $(`#sprint-board-task-modal`).modal("show");
});

$("#update-task-btn").on("click", async function () {
  // console.log(thisTaskID);
  let docRef = doc(db, "task", thisTaskID);

  let st = $("#start-task-time").val();
  st = DateTimeUtils.convertDatetimeLocalToTimestamp(st);

  let et = $("#end-task-time").val();
  et = DateTimeUtils.convertDatetimeLocalToTimestamp(et);

  let diffTime = DateTimeUtils.timeDifference(st, et);

  // get a Snapshot of the task doc
  await getDoc(docRef).then(async (snapshots) => {
      // console.log("---- Task doc retrieved successfully");
      let taskData = snapshots.data();

      if (taskData.total_time == undefined || taskData.total_time == null) {
        taskData.total_time = { seconds: 0, nanoseconds: 0 };
      }

      let tot_time = {
        seconds: taskData.total_time.seconds + diffTime.seconds,
        nanoseconds: taskData.total_time.nanoseconds + diffTime.nanoseconds,
      };

      await updateDoc(docRef, {
        start_time: st,
        end_time: et,
        total_time: {
          seconds: tot_time.seconds,
          nanoseconds: tot_time.nanoseconds,
        },
      })
        .then(() => {
          // console.log("---- Task updated successfully");
          $(`#sprint-board-task-modal`).modal("hide");
          window.location.reload();
        })
        .catch((error) => {
          alert(error);
        });
        
    }).catch((error) => {
        alert(error);
    });

  });
