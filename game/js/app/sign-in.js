$(document).ready(function() {

    $("#signInForm").submit(function(e) {
        e.preventDefault();
        
        var formArray = $("#signInForm").serializeArray();
        var formData = {};
        formArray.forEach(function(field) {
            formData[field.name] = field.value;
        });

        if(!formData.email) {
            swal(language['failedLabel'], language['signIn_Email_Require'], 'error');
            return;
        }

        if(!formData.password) {
            swal(language['failedLabel'], language['signIn_Password_Require'], 'error');
            return;
        }

        const email = formData.email;
        const password = formData.password;
        
        const data = {
            email: email,
            password: password
        };

        retrieve('sign-in', data, function(res) {
            if(res.retcode != 0) {
                swal(language['failedLabel'], res.message, 'error');
                return;
            }

            setCookie('token', res.data.token, 3);

            swal(language['successLabel'], language['signIn_Success'], 'success').then(function() {
                window.location.href = '/account';
            });
        });
    });

});
