const customSave = document.getElementById('customSave')
const logo = document.getElementById('logo')
const color = document.getElementById('color')

let selectedTheme = '';

const themeRadios = document.getElementsByName('theme');

function updateSelectedTheme() {
    for (let i = 0; i < themeRadios.length; i++) {
        if (themeRadios[i].checked) {
            selectedTheme = themeRadios[i].value;
            console.log('Selected theme:', selectedTheme);
            break; 
        }
    }
}

for (let i = 0; i < themeRadios.length; i++) {
    themeRadios[i].addEventListener('click', updateSelectedTheme);
}

let isEditMode = false;

customSave.addEventListener('click', function(event){
    event.preventDefault();
    if (!isEditMode) {
        toggleEditMode();
    } else {
        const formData = new FormData();
        if(logo.files[0])
            formData.append('imageFile', logo.files[0]);
        formData.append('color', color.value);
        formData.append('theme', selectedTheme);
        console.log(formData);
        fetch('/customs/update',{
            method: 'post',
            body: formData,
        })
        .then(response => {
            if(response.ok){
                window.location.href = '/customs'; // Redirect to the '/customs' page
            } else {
                console.log(response);
            }
        })
        .catch(err => {
            console.error("Error updating the settings:", err);
        });
    }
})

function toggleEditMode() {
    if(!isEditMode){
        document.getElementById("form-div").classList.remove("bg-white")
        document.getElementById("form-div").classList.add("bg-secondary")
    }else{
        document.getElementById("form-div").classList.add("bg-white")
        document.getElementById("form-div").classList.remove("bg-secondary")
    }
    isEditMode = !isEditMode;
    logo.disabled = !isEditMode;
    color.disabled = !isEditMode;
    document.getElementById('theme1').disabled = !isEditMode;
    document.getElementById('theme2').disabled = !isEditMode;
    document.getElementById('theme3').disabled = !isEditMode;    
    document.getElementById('theme4').disabled = !isEditMode;    
    customSave.textContent =  isEditMode ? 'Save' : 'Edit';
};

const cancel = document.getElementById('cancel');
cancel.addEventListener('click', function(event){
    window.location.href='/'
});