$(document).ready(function () {
    $("#nav-menu-icon").click(() =>
    {

        // $("#navigation-bar").animate({width:'5000px'},1000)
        const pageName = window.location.pathname.split("/").pop();

        if (pageName === "product_backlog.html") {
        window.location.href = "addtask.html"}

        else{
            window.location.href = "product_backlog.html"
        }
        
    })





});