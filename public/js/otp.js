document.addEventListener('DOMContentLoaded', function() {
    const otpInputs = document.querySelectorAll('.otpInput');

    otpInputs.forEach(function(input, index) {
        input.addEventListener('input', function() {
            if (index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });
    });
});

function showToastMsg(message) {
    const myToast = document.getElementById('myToast');
    const toastbody = document.getElementById('toast-body');
    toastbody.innerHTML = message;
    const toast = new bootstrap.Toast(myToast);
    toast.show();
}

function validateOTP(){
    var d1=document.getElementsByName("d1")[0].value;
    var d2=document.getElementsByName("d2")[0].value;
    var d3=document.getElementsByName("d3")[0].value;
    var d4=document.getElementsByName("d4")[0].value;
    var d5=document.getElementsByName("d5")[0].value;
    var d6=document.getElementsByName("d6")[0].value;

    fetch('/auth/forgotpw/validateOTP', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({d1:d1, d2:d2, d3:d3, d4:d4, d5:d5, d6:d6})
    })
    .then(response => {
        console.log("response:",response);
            if(response.ok){
                console.log("response is ok")
                showToastMsg('OTP verified successfully.');
                window.location.href = '/auth/resetpassword'; 
            }else{
                showToastMsg('Invalid OTP.');
                window.location.href = '/auth/forgotpassword';
            }})
            .catch(error => {
                console.error('Error:', error);
            });
}