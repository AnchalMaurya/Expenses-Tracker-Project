//.........Js to add expense page.....
let btn1 = document.querySelector("#expense");

btn1.addEventListener("click",()=>{
    window.location.href = "index.html";
})

//......Js..to..check...balance....
let btn2 = document.querySelector("#income");
let box1 = document.querySelector(".incom_detail");

btn2.addEventListener("click",()=>{
    let p = document.createElement("p");
    p.innerText = " Your Current Balance is : 50,000.";
    box1.appendChild(p);
})