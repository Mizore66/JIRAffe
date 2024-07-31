const sidebar = document.querySelector(".sidebar");
const menu = document.querySelector("#menu");
const main = document.querySelector(".main");
const menu_container = document.querySelector(".menu-container");

const product_backlog = document.querySelector("#product-backlog");
const sprints = document.querySelector("#sprints");
const sprint_board = document.querySelector("#sprint-board");
const admin_view = document.querySelector("#admin-view");
const user = document.querySelector("#user");

// let previousToggled = null;
// let currentToggled = null;

product_backlog.addEventListener("click", (e) => {
  console.log("product backlog clicked");
  window.location.href = "../product_backlog/product_backlog.html";
});

sprints.addEventListener("click", (e) => {
  console.log("sprints clicked");
  window.location.href = "../sprint_page/sprint_page.html";
});

sprint_board.addEventListener("click", (e) => {
  console.log("sprint board clicked");
  window.location.href = "../sprint_board/sprint_board.html";
  // toggleMenu(sprint_board);
});

admin_view.addEventListener("click", (e) => {
  console.log("admin view clicked");
  // toggleMenu(admin_view);
});

user.addEventListener("click", (e) => {
  console.log("user clicked");
  window.location.href = "../user_profile/user_profile.html";
});

// function toggleMenu(button) {
//   if (previousToggled && button !== menu) {
//     untoggleMenu(previousToggled);
//   }
//   button.classList.add("toggled");
//   if (button !== menu) {
//     previousToggled = button;
//   }
// };

// function untoggleMenu(button) {
//   button.classList.remove("toggled");
// };

menu.addEventListener("click", (e) => {
  console.log("menu clicked");
  sidebar.classList.contains("active") ? closeMenu() : openMenu();
});

const openMenu = () => {
  sidebar.classList.add("active");
  sidebar.style.width = "250px";

  // toggleMenu(menu);

  main.style.filter = "blur(3px)";
  main.style.webkitFilter = "blur(3px)";
  main.style.pointerEvents = "none";
  sidebar.style.boxShadow = "5px 0px 25px 0.1px #000000";

  let menu_logo = document.createElement("img");
  menu_logo.id = "menu-logo";
  menu_logo.src = "../../assets/icons/brand_logo_1.png";
  menu_logo.style.width = "60px";
  menu_logo.style.height = "13px";
  menu_container.style.paddingLeft = "15px";
  menu_container.insertBefore(menu_logo, menu_container.childNodes[0]);

  let p_productBacklog = document.createElement("p");
  p_productBacklog.classList.add("p-title");
  p_productBacklog.id = "p-productBacklog";
  p_productBacklog.innerHTML = "Product Backlog";
  product_backlog.style.width = "220px";
  product_backlog.style.justifyContent = "left";
  product_backlog.appendChild(p_productBacklog);

  let p_sprints = document.createElement("p");
  p_sprints.classList.add("p-title");
  p_sprints.id = "p-sprints";
  p_sprints.innerHTML = "Sprints";
  sprints.style.width = "220px";
  sprints.style.justifyContent = "left";
  sprints.appendChild(p_sprints);

  let p_sprintBoard = document.createElement("p");
  p_sprintBoard.classList.add("p-title");
  p_sprintBoard.id = "p-sprintBoard";
  p_sprintBoard.innerHTML = "Sprint Board";
  sprint_board.style.width = "220px";
  sprint_board.style.justifyContent = "left";
  sprint_board.appendChild(p_sprintBoard);

  let p_adminView = document.createElement("p");
  p_adminView.classList.add("p-title");
  p_adminView.id = "p_adminView";
  p_adminView.innerHTML = "Admin View";
  admin_view.style.width = "220px";
  admin_view.style.justifyContent = "left";
  admin_view.appendChild(p_adminView);

  user.style.width = "220px";

  let user_name = document.createElement("p");
  user_name.id = "user-name";
  user_name.classList.add("p-title");

  //get first and last name from the logged in user of the local storage
  let userLoginArray = JSON.parse(localStorage.getItem("userLogin"));
  console.log(userLoginArray);
  let userLogin = userLoginArray[0];//JSON.parse();
  console.log(userLogin);

  user_name.innerHTML = `${userLogin.firstName} ${userLogin.lastName}`;

  user.insertBefore(user_name, user.childNodes[0]);

  // toggleMenu(menu);
  // main.style.width = "calc(100% - 250px)";     // this makes the rest of the page responsive as the sidebar opens
};

function closeMenu() {
  menu_container.removeChild(document.getElementById("menu-logo"));
  menu_container.style.paddingLeft = "0px";

  main.style.filter = "none";
  main.style.webkitFilter = "none";
  main.style.pointerEvents = "all";
  sidebar.style.boxShadow = "none";

  product_backlog.removeChild(document.getElementById("p-productBacklog"));
  product_backlog.style.width = "50px";
  product_backlog.style.justifyContent = "center";

  sprints.removeChild(document.getElementById("p-sprints"));
  sprints.style.width = "50px";
  let sprint_icon = document.getElementById("sprint-icon");
  sprint_icon.style.position = "none";
  sprint_icon.style.left = "0px";
  sprints.style.justifyContent = "center";

  sprint_board.removeChild(document.getElementById("p-sprintBoard"));
  sprint_board.style.width = "50px";
  sprint_board.style.justifyContent = "center";

  admin_view.removeChild(document.getElementById("p_adminView"));
  admin_view.style.width = "50px";
  admin_view.style.justifyContent = "center";

  // remove the user name and role from the logout button
  user.removeChild(document.getElementById("user-name"));

  user.style.width = "100%";

  sidebar.classList.remove("active");
  sidebar.style.width = "78px";

  // untoggleMenu(menu);
  // main.style.width = "calc(100% - 78px)";     // this ALSO makes the rest of the page responsive as the sidebar closes
}
