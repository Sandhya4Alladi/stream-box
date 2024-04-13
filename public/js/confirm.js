document.getElementById('confirmButton').addEventListener('click', function(event) {
    event.preventDefault(); 
    $('#confirmationModal').modal('show'); 
});
  
document.getElementById('confirmActionButton').addEventListener('click', function() {
    console.log('Confirmed action');
    fetch('/auth/logout',{
        method: 'get'
    })
    .then(response => {
        if(response.ok){
            window.location.href = '/'
        }
    })
    $('#confirmationModal').modal('hide');
});  