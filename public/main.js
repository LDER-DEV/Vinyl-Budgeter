var trash = document.getElementsByClassName("fa-trash");
var submit = document.querySelector('.submitButton')
var check = document.getElementsByClassName("fa-check");
var totalBudget = document.querySelector('.totalBudget')


Array.from(trash).forEach(function(element) {
      element.addEventListener('click', function(){
        const name = this.parentNode.parentNode.childNodes[1].innerText
        const album = this.parentNode.parentNode.childNodes[5].innerText
        fetch('recordinfo', {
          method: 'delete',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'name': name,
            'album': album
          })
        }).then(function (response) {
          window.location.reload()
        })
      });
});



Array.from(check).forEach(function(element) {
  element.addEventListener('click', function(){
    fetch('/recordinfo/budget', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        budget: document.getElementById('budget').innerText
      })
    })
    .then(response => {
      if (response.ok) {
        alert('Your new Budget has been Applied! Subtract your costs')
        return response.json()    
  }})
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  });
});