retrieve('info', null, function(data) {
    if(data.retcode != 0) {
        swal(failedLabel, data.message, 'error');
        return;
    }
    accountDetail(data.data);
});

function accountDetail(data) {
    let elementsWithField = document.querySelectorAll('[field]');
    elementsWithField.forEach(element => {
        let fieldValue = element.getAttribute('field');
        element.value = data[fieldValue];
    });
}


$(document).ready(function() {

    $("#changePassword").submit(function(e) {
        e.preventDefault();
        
        var formArray = $("#changePassword").serializeArray();
        var formData = {};
        formArray.forEach(function(field) {
            formData[field.name] = field.value;
        });

        if(!formData.old) {
            swal(failedLabel, requireOldPassword, 'error');
            return;
        }

        if(!formData.new) {
            swal(failedLabel, requireNewPassword, 'error');
            return;
        }

        const oldPassword = CryptoJS.SHA256(formData.old).toString();
        const newPassword = CryptoJS.SHA256(formData.new).toString();
        const time = Date.now();
        const type = 'ACCOUNT_CHANGE_PASSWORD';
        const checkSum = CryptoJS.SHA512(oldPassword + "|" + newPassword + "|" + time + "|" + type).toString();
        
        const data = {
            oldPassword: oldPassword,
            newPassword: newPassword,
            time: time,
            type: type,
            checkSum: checkSum
        };

        $.ajax({
            url: "/api/account/change-password",
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            success: function(res) {
                if(res.retcode === 0) {
                    let data = res.data;
                    setCookie('token', data.token, 3);
                    swal(successLabel, changePasswordSuccess, 'success').then(function() {
                        window.location.reload();
                    });
                } else {
                    swal(failedLabel, res.message, 'error');
                }
            }
        });
    });

});
