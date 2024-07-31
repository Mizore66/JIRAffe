
/** creates a new div with the text that fades in */
function showAnimatedText1(text, duration) {
  var newDiv = document.createElement("div");
  newDiv.innerHTML = '\"' + text + '\"';
  newDiv.className = "login-anim-text";
  newDiv.style.animation = `fadeIn ${duration}s ease-in-out`;

  // if the text is too long, make the font size smaller
  if (text.length > 200) {
    newDiv.style.fontSize = "2rem";
  } else if (text.length > 50) {
    newDiv.style.fontSize = "2.5rem";
  } else if (text.length > 25) {
    newDiv.style.fontSize = "3rem";
  } else {
    newDiv.style.fontSize = "4rem";
  }

  document.getElementById("animation-space").appendChild(newDiv);
}

/** creates a new div with the text that fades in */
function showAnimatedText2(author, duration) {

  var newDiv = document.createElement("div");  // for the author
  newDiv.innerHTML = "~ " + author;
  newDiv.className = "author-text";
  newDiv.style.animation = `fadeIn ${duration}s ease-in-out`;

  // if the text is too long, make the font size smaller
  if (author.length > 200) {
    newDiv.style.fontSize = "2rem";
  } else if (author.length > 50) {
    newDiv.style.fontSize = "2.5rem";
  } else if (author.length > 25) {
    newDiv.style.fontSize = "3rem";
  } else {
    newDiv.style.fontSize = "4rem";
  }

  document.getElementById("author-text").appendChild(newDiv);
}

/** changes the style class of the current text so that it fades out, before being deleted */
function removeAnimatedText1(duration) {
  let animSpace = document.getElementById("animation-space");
  $(animSpace)
    .find(".login-anim-text")
    .each(function () {
      this.style.animation = `fadeOut ${duration}s ease-in-out`;
      setTimeout(() => this.remove(), duration * 1000);
    });
}

function removeAnimatedText2(duration) {
  let animSpace = document.getElementById("author-text");
  $(animSpace)
    .find(".author-text")
    .each(function () {
      this.style.animation = `fadeOut ${duration}s ease-in-out`;
      setTimeout(() => this.remove(), duration * 1000);
    });
}

const API_KEY = "PxXGfxj6Nbfh2VXEXwk57A==Vk0YqJQ6b7hF3B4f";
var category = "inspirational"; // for a list of possible categories, see https://api-ninjas.com/api/quotes#:~:text=category%20(optional)%20%2D%20category%20to%20limit%20results%20to.%20Possible%20values%20are%3A
var limit = 10;           // for a list of quotes

$(() =>
  $.ajax({
    method: "GET",
    url:
      `https://api.api-ninjas.com/v1/quotes?category=${category}&limit=${limit}`,
    headers: { "X-Api-Key": API_KEY },
    contentType: "application/json",
    success: function (result) {
      var troll_obj = {
        quote: "☕",
        category: "just for the lols",
        author: "men"
      }
      result = ([troll_obj]).concat(result);
      limit = result.length;

      console.log(result);
      const ANIMATION_DURATION = 0.8;   // in seconds
      const WAIT_DURATION = 10;          // in seconds
      count = 0;
      showAnimatedText1(result[count].quote, ANIMATION_DURATION);
      showAnimatedText2(result[count].author, ANIMATION_DURATION);
      setTimeout(() => {
        removeAnimatedText1(ANIMATION_DURATION);
        removeAnimatedText2(ANIMATION_DURATION);
      }, WAIT_DURATION * 1000);
      count++;
      setInterval(() => {
        showAnimatedText1(result[count].quote, ANIMATION_DURATION);
        showAnimatedText2(result[count].author, ANIMATION_DURATION);
        setTimeout(() => {
          removeAnimatedText1(ANIMATION_DURATION);
          removeAnimatedText2(ANIMATION_DURATION);
          count = (count + 1) % limit;
        }, WAIT_DURATION * 1000);
      }, ((ANIMATION_DURATION*2) + WAIT_DURATION) * 1000);
    },

    error: function ajaxError(jqXHR) {
      console.error("Error: ", jqXHR.responseText);
    },
  })
);
