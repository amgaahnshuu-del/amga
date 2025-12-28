const form = document.getElementById("contactForm");
const statusMessage = document.getElementById("statusMessage");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (name && email && message) {
        statusMessage.style.color = "green";
        statusMessage.textContent = "Амжилттай илгээгдлээ! Баярлалаа 😊";
        form.reset();
    } else {
        statusMessage.style.color = "red";
        statusMessage.textContent = "Бүх талбарыг бөглөнө үү!";
    }
});
