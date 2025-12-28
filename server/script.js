function goMenu() {
    window.location.href = "menu/menu.html";
}

function goBook() {
    window.location.href = "book.html";
}

function goContact() {
    window.location.href = "contact.html";
}


const btn = document.getElementById("readmoreBTN");
const moreText = document.getElementById("moreText");

btn.addEventListener("click", () => {
    moreText.classList.toggle("hidden");

    if (moreText.classList.contains("hidden")) {
        btn.textContent = "Read More";
    } else {
        btn.textContent = "Read Less";
    }
});
