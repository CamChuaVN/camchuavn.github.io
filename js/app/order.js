let orderList = null;
let showMax = 5;
let page = 1;
let maxPage = 0;
let chosenOrder = null;

document.getElementById('orderDownload').addEventListener('click', function() {
    if(chosenOrder) {
        if(chosenOrder.status !== 0) {
            swal(failedLabel, messageLabel.orderDownloadOnlyComplete, 'error');
            return;
        }

        let link = chosenOrder.path;
        let linkHidden = document.getElementById('link');
        linkHidden.href = link;
        linkHidden.click();
    }
});

document.getElementById('orderNewButton').addEventListener('click', function() {
    let orderDetailZone = document.getElementById('orderDetail');
    orderDetailZone.style.display = 'none';

    let orderNewZone = document.getElementById('orderNew');
    orderNewZone.style.display = 'block';
    orderNewZone.scrollIntoView();
});

document.getElementById('orderNewSubmit').addEventListener('click', function() {
    let orderNewNameField = document.getElementById('orderNewNameField');

    let name = orderNewNameField.value;
    let description = orderNewDescriptionEditor.root.innerHTML;

    const time = Date.now();
    const type = 'ORDER_CREATE';
    const checkSum = CryptoJS.SHA512(name + "|" + time + "|" + type).toString();

    const data = {
        name: name,
        description: description,
        time: time,
        type: type,
        checkSum: checkSum
    }

    $.ajax({
        url: "/api/order/create",
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: function(res) {
            if(res.retcode === 0) {
                swal(successLabel, 'order_new_success: ' + res.data.id, 'success').then(function() {
                    window.location.reload();
                });
            } else {
                swal(failedLabel, res.message, 'error');
            }
        }
    });
});

document.getElementById('orderEdit').addEventListener('click', function() {
    let orderEditNameField = document.getElementById('orderEditNameField');

    let name = orderEditNameField.value;
    let description = orderDetailDescriptionEditor.root.innerHTML;

    const id = chosenOrder.id;
    const time = Date.now();
    const type = 'ORDER_EDIT';
    const checkSum = CryptoJS.SHA512(id + "|" + name + "|" + time + "|" + type).toString();

    const data = {
        id: id,
        name: name,
        description: description,
        time: time,
        type: type,
        checkSum: checkSum
    }

    $.ajax({
        url: "/api/order/edit",
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: function(res) {
            if(res.retcode === 0) {
                swal(successLabel, messageLabel.orderEditSuccess, 'success').then(function() {
                    window.location.reload();
                });
            } else {
                swal(failedLabel, res.message, 'error');
            }
        }
    });
});

document.getElementById('orderCancel').addEventListener('click', function() {
    if(!confirm(messageLabel.orderCancel)) return;

    const id = chosenOrder.id;
    const time = Date.now();
    const type = 'ORDER_CANCEL';
    const checkSum = CryptoJS.SHA512(id + "|" + time + "|" + type).toString();

    const data = {
        id: id,
        time: time,
        type: type,
        checkSum: checkSum
    }

    $.ajax({
        url: "/api/order/cancel",
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: function(res) {
            if(res.retcode === 0) {
                swal(successLabel, messageLabel.orderCancelConfirm, 'success').then(function() {
                    window.location.reload();
                });
            } else {
                swal(failedLabel, res.message, 'error');
            }
        }
    });
});

retrieve('order', null, function(data) {
    if(data.retcode != 0) {
        swal(failedLabel, data.message, 'error');
        return;
    }
    orderList = data.data;
    maxPage = parseInt(orderList.length / showMax) + (orderList.length % showMax === 0 ? 0 : 1);

    let prevOrder = document.getElementById('prevOrder');
    let nextOrder = document.getElementById('nextOrder');

    prevOrder.addEventListener('click', function() {
        prev();
    });
    nextOrder.addEventListener('click', function() {
        next();
    });

    navigate(page);
});

function navigate(page) {
    let pluginTable = document.getElementById('orderTable');
    let noData = document.getElementById('noData');
    pluginTable.innerHTML = '';
    if(orderList && orderList.length > 0 && page <= maxPage && page > 0) {
        let index = (page - 1) * showMax;
        noData.style.display = 'none';
        for(let i = index; i < Math.min(index + showMax, orderList.length); i++) {
            let order = orderList[i];

            let element = document.createElement('tr');
            element.classList.add('selector');

            let id = '<td class="border-bottom-0"><h6 class="fw-semibold mb-0">' + order.id + '</h6></td>';
            let name = '<td class="border-bottom-0">' + order.name + '</td>';
            let creation = '<td class="border-bottom-0">' + formatTime(order.creation) + '</td>';
            let status = '<td class="border-bottom-0">' + messageLabel.status[order.status] + '</td>';

            let _id = order.id;
            element.addEventListener('click', function() {
                retrieve('order-detail', {id: _id}, function(data) {
                    if(data.retcode != 0) {
                        swal(failedLabel, data.message, 'error');
                        return;
                    }
                    chosenOrder = data.data;
                    orderDetail();
                });
            });

            let content = id + name + creation + status;
            element.innerHTML = content;
            pluginTable.appendChild(element);
        }
    } else {
        noData.style.display = 'inline';
    }

    let prevOrder = document.getElementById('prevOrder');
    let pageOrder = document.getElementById('pageOrder');
    let nextOrder = document.getElementById('nextOrder');
    if(maxPage < 2) {
        prevOrder.style.display = 'none';
        pageOrder.style.display = 'none';
        nextOrder.style.display = 'none';
    } else {
        prevOrder.style.display = page < 2 ? 'none' : 'inline';
        nextOrder.style.display = page >= maxPage ? 'none' : 'inline';
        pageOrder.style.display = 'inline';
        pageOrder.innerText = page + '/' + maxPage;
    }
}

function orderDetail() {
    let orderDetail = document.getElementById('orderDetail');
    orderDetail.style.display = 'inline';
    let elementsWithField = document.querySelectorAll('[field]');
    elementsWithField.forEach(element => {
        let fieldValue = element.getAttribute('field');

        if(fieldValue === 'creation' || fieldValue === 'claimTime' || fieldValue === 'completeTime') element.value = formatTime(chosenOrder[fieldValue]);
        else if(fieldValue === 'expectTime') element.value = formatTimeNoHour(chosenOrder[fieldValue]);
        else if(fieldValue === 'description') orderDetailDescriptionEditor.setContents(orderDetailDescriptionEditor.clipboard.convert(chosenOrder.description), 'silent');
        else if(fieldValue === 'status') element.value = messageLabel.status[chosenOrder[fieldValue]];
        else element.value = chosenOrder[fieldValue];
    });

    let orderNew = document.getElementById('orderNew');
    orderNew.style.display = 'none';

    let orderClaimerContact = document.getElementById('orderClaimerContact');
    if(chosenOrder['contact']) {
        orderDetailContactEditor.setContents(orderDetailContactEditor.clipboard.convert(chosenOrder['contact']), 'silent');
        orderClaimerContact.style.cssText = 'display:block !important';
    } else {
        orderClaimerContact.style.cssText = 'display:none !important';
    }
}


function prev() {
    if(page > 1) {
        page -= 1;
        navigate(page);
    }
}

function next() {
    if(page < maxPage) {
        page += 1;
        navigate(page);
    }
}



function formatTime(milliseconds) {
    if(milliseconds <= 0) return '';
    let date = new Date(milliseconds);
    let hours = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');
    let seconds = String(date.getSeconds()).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    let formattedDate = `${hours}:${minutes}:${seconds} ${day}-${month}-${year}`;
    return formattedDate;
}

function formatTimeNoHour(milliseconds) {
    if(milliseconds <= 0) return '';
    let date = new Date(milliseconds);
    let day = String(date.getDate()).padStart(2, '0');
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let year = date.getFullYear();
    let formattedDate = `${day}-${month}-${year}`;
    return formattedDate;
}
