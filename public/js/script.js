// b1 = document.getElementById("b1")
// b1.addEventListner("click", ()=>{

//     s1 = document.getElementById("s1")
//     s2 = document.getElementById("s2")
//     a = document.getElementById("a")
//     category = s1.value;
//     link = a.href;
//     a.href = link+"/category/" + category;
//     console.log(a.href)
// })

// JS code for form validation
// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()
  

