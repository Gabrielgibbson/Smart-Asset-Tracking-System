
function acceptInput() {
let name = document.querySelector(".input1").value;
let password = document.querySelector('.input2').value;
let role = document.querySelector('.input3').value;


if (role !== `Admin` || `Staff` || `Maintenance` ){
  document.querySelector('.required3').textContent = `role is invalid!`;
}else if (!role){
  document.querySelector('.required3').textContent = `Input role`;
}
if (role == `Admin`) {
if (name && !password){
  document.querySelector('.required2').textContent = `Enter password`;
  document.querySelector('.required1').textContent = ``;
  document.querySelector('.required3').textContent = ``;
} else if (!name && password){
  document.querySelector('.required1').textContent = `Enter name`;
  document.querySelector('.required2').textContent = ``;
  document.querySelector('.required3').textContent = ``;
} 
else if (name && password && role) {
  document.querySelector('.required1').textContent = ``;
  document.querySelector('.required2').textContent = ``;
  document.querySelector('.required3').textContent = ``;
  // document.querySelector('.login').innerHTML = `<button class="loginn" id="loginn" onclick="document.location='somenew.html'">Login
  //       </button>`
}
}else if (role == `Staff`) {
if (name && !password){
  document.querySelector('.required2').textContent = `Enter password`;
  document.querySelector('.required1').textContent = ``;
  document.querySelector('.required3').textContent = ``;
} else if (!name && password){
  document.querySelector('.required1').textContent = `Enter name`;
  document.querySelector('.required2').textContent = ``;
  document.querySelector('.required3').textContent = ``;
} else if (name && password && role) {
  document.querySelector('.required1').textContent = ``;
  document.querySelector('.required2').textContent = ``;
  document.querySelector('.required3').textContent = ``;
  // document.querySelector('.login').innerHTML = `<section class="java-btn"><button class="login" id="loginn" onclick="document.location='somenew2.html'">Login
  //       </button></section>`
}
} else if (role == `Maintenance`) {
if (name && !password){
  document.querySelector('.required2').textContent = `Enter password`;
  document.querySelector('.required1').textContent = ``;
  document.querySelector('.required3').textContent = ``;
} else if (!name && password){
  document.querySelector('.required1').textContent = `Enter name`;
  document.querySelector('.required2').textContent = ``;
  document.querySelector('.required3').textContent = ``;
} else if (name && password && role) {
  document.querySelector('.required1').textContent = ``;
  document.querySelector('.required2').textContent = ``;
  document.querySelector('.required3').textContent = ``;
  //  document.querySelector('.login').innerHTML = `<section class="java-btn"><button class="login" id="loginn" onclick="document.location='somenew3.html'">Login
  //       </button></section>` 
}
}
  if (!name && !password && !role) {
  alert('Enter all fields!')
  
} else if (name && password && role  == `Staff`,`Maintenance`,`Admin`){
  alert('Login Successful!')
 document.querySelector('.login').innerHTML = `<section class="java-btn"><button class="login" id="loginn" onclick="document.location='somenew3.html'">Login
        </button></section>`
      // }else if(name && password && role !== `Staff`,`Maintenance`,`Admin` ) {
      //   document.querySelector('.required3').textContent = `role is invalid!`;
      // }
  
}
}