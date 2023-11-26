$(document).ready(function() {

    $("#signUpForm").submit(function(e) {
        e.preventDefault();
        
        var formArray = $("#signUpForm").serializeArray();
        var formData = {};
        formArray.forEach(function(field) {
            formData[field.name] = field.value;
        });

        if(!formData.email) {
            swal(language['failedLabel'], language['signUp_Email_Require'], 'error');
            return;
        }

        if(!formData.name) {
            swal(language['failedLabel'], language['signUp_Name_Require'], 'error');
            return;
        }

        if(!formData.password) {
            swal(language['failedLabel'], language['signUp_Password_Require'], 'error');
            return;
        }

        const email = formData.email;
        const name = formData.name;
        const password = formData.password;
        
        const data = {
            email: email,
            name: name,
            password: password
        };

        retrieve('sign-up', data, function(res) {
            if(res.retcode != 0) {
                swal(language['failedLabel'], res.message, 'error');
                return;
            }

            swal(language['successLabel'], language['signUp_Success'], 'success').then(function() {
                window.location.reload();
            });
        });
    });

});
