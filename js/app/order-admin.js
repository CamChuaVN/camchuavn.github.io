let showMax = 5;
let chosenOrder = null;

let overrallList = null;
let overrallPage = 1;
let overrallMaxPage = 0;

let waitingList = null;
let waitingPage = 1;
let waitingMaxPage = 0;

let pendingList = null;
let pendingPage = 1;
let pendingMaxPage = 0;

let completedList = null;
let completedPage = 1;
let completedMaxPage = 0;

document.getElementById('orderClaim').addEventListener('click', function() {
    let claimPrice = document.getElementById('claimPrice');
    let claimExpect = document.getElementById('claimExpect');

    if(!claimPrice.value) {
        swal(failedLabel, messageLabel.orderClaimInputPrice, 'error');
        return;
    }

    if(!claimExpect.value) {
        swal(failedLabel, messageLabel.orderClaimInputExpect, 'error');
        return;
    }

    let dateExpect = new Date(claimExpect.value);
    let expectTime = dateExpect.getTime();

    const id = chosenOrder.id;
    const price = claimPrice.value;
    const time = Date.now();
    const type = 'ORDER_CLAIM';
    const checkSum = CryptoJS.SHA512(id + "|" + price + "|" + expectTime + "|" + time + "|" + type).toString();
        
    const data = {
        id: id,
        price: price,
        expect: expectTime,
        time: time,
        type: type,
        checkSum: checkSum
    };

    $.ajax({
        url: "/api/order/claim",
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: function(res) {
            if(res.retcode === 0) {
                swal(successLabel, messageLabel.orderClaimSuccess, 'success').then(function() {
                    window.location.reload();
                });
            } else {
                swal(failedLabel, res.message, 'error');
            }
        }
    });
});

document.getElementById('orderContact').addEventListener('click', function() {
    const contact = orderContactEditor.root.innerHTML;
    
    const time = Date.now();
    const type = 'ORDER_CONTACT-UPDATE';
    const checkSum = CryptoJS.SHA512(time + "|" + type).toString();

    const data = {
        contact: contact,
        time: time,
        type: type,
        checkSum: checkSum
    }

    $.ajax({
        url: "/api/order/contact-update",
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(data),
        success: function(res) {
            if(res.retcode === 0) {
                swal(successLabel, messageLabel.orderContactUpdateSuccess, 'success').then(function() {
                    window.location.reload();
                });
            } else {
                swal(failedLabel, res.message, 'error');
            }
        }
    });
});

retrieve('order-admin', null, function(data) {
    console.log(data);
    if(data.retcode != 0) {
        swal(failedLabel, data.message, 'error');
        return;
    }
    
    overrallList = data.data.overrall;
    overrallMaxPage = parseInt(overrallList.length / showMax) + (overrallList.length % showMax === 0 ? 0 : 1);

    waitingList = data.data.waiting;
    waitingMaxPage = parseInt(waitingList.length / showMax) + (waitingList.length % showMax === 0 ? 0 : 1);

    pendingList = data.data.pending;
    pendingMaxPage = parseInt(pendingList.length / showMax) + (pendingList.length % showMax === 0 ? 0 : 1);

    completedList = data.data.completed;
    completedMaxPage = parseInt(completedList.length / showMax) + (completedList.length % showMax === 0 ? 0 : 1);

    navigateOverrall(overrallPage);
    navigateWaiting(waitingPage);
    navigatePending(pendingPage);
    navigateCompleted(completedPage);

    orderContactEditor.setContents(orderContactEditor.clipboard.convert(data.data.contact), 'silent');
});


function navigateOverrall(page) {
    let table = document.getElementById('orderOverrallTable');
    let noData = document.getElementById('noDataOverrall');
    table.innerHTML = '';
    if(overrallList && overrallList.length > 0 && page <= overrallMaxPage && page > 0) {
        let index = (page - 1) * showMax;
        noData.style.display = 'none';
        for(let i = index; i < Math.min(index + showMax, overrallList.length); i++) {
            let order = overrallList[i];

            let element = document.createElement('tr');
            element.classList.add('selector');

            let id = '<td class="border-bottom-0"><h6 class="fw-semibold mb-0">' + order.id + '</h6></td>';
            let name = '<td class="border-bottom-0">' + order.name + '</td>';
            let creation = '<td class="border-bottom-0">' + formatTime(order.creation) + '</td>';
            let status = '<td class="border-bottom-0">' + messageLabel.status[order.status] + '</td>';

            let _id = order.id;
            element.addEventListener('click', function() {
                retrieve('order-admin-detail', {id: _id}, function(data) {
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
            table.appendChild(element);
        }
    } else {
        noData.style.display = 'block';
    }

    let prevTable = document.getElementById('prevOrderOverrall');
    let pageTable = document.getElementById('pageOrderOverrall');
    let nextTable = document.getElementById('nextOrderOverrall');
    if(overrallMaxPage < 2) {
        prevTable.style.display = 'none';
        pageTable.style.display = 'none';
        nextTable.style.display = 'none';
    } else {
        prevTable.style.display = page < 2 ? 'none' : 'inline';
        nextTable.style.display = page >= overrallMaxPage ? 'none' : 'inline';
        pageTable.style.display = 'inline';
        pageTable.innerText = page + '/' + overrallMaxPage;
    }
}

function prevOverrall() {
    if(overrallPage > 1) {
        overrallPage -= 1;
        navigateOverrall(overrallPage);
    }
}

function nextOverrall() {
    if(overrallPage < overrallMaxPage) {
        overrallPage += 1;
        navigateOverrall(overrallPage);
    }
}


function navigateWaiting(page) {
    let table = document.getElementById('orderWaitingTable');
    let noData = document.getElementById('noDataWaiting');
    table.innerHTML = '';
    if(waitingList && waitingList.length > 0 && page <= waitingMaxPage && page > 0) {
        let index = (page - 1) * showMax;
        noData.style.display = 'none';
        for(let i = index; i < Math.min(index + showMax, waitingList.length); i++) {
            let order = waitingList[i];

            let element = document.createElement('tr');
            element.classList.add('selector');

            let id = '<td class="border-bottom-0"><h6 class="fw-semibold mb-0">' + order.id + '</h6></td>';
            let name = '<td class="border-bottom-0">' + order.name + '</td>';
            let creator = '<td class="border-bottom-0">' + order.creator + '</td>';
            let creation = '<td class="border-bottom-0">' + formatTime(order.creation) + '</td>';

            let _id = order.id;
            element.addEventListener('click', function() {
                retrieve('order-admin-detail', {id: _id}, function(data) {
                    if(data.retcode != 0) {
                        swal(failedLabel, data.message, 'error');
                        return;
                    }
                    chosenOrder = data.data;
                    orderDetail();
                });
            });

            let content = id + name + creator + creation;
            element.innerHTML = content;
            table.appendChild(element);
        }
    } else {
        noData.style.display = 'block';
    }

    let prevTable = document.getElementById('prevOrderWaiting');
    let pageTable = document.getElementById('pageOrderWaiting');
    let nextTable = document.getElementById('nextOrderWaiting');
    if(waitingMaxPage < 2) {
        prevTable.style.display = 'none';
        pageTable.style.display = 'none';
        nextTable.style.display = 'none';
    } else {
        prevTable.style.display = page < 2 ? 'none' : 'inline';
        nextTable.style.display = page >= waitingMaxPage ? 'none' : 'inline';
        pageTable.style.display = 'inline';
        pageTable.innerText = page + '/' + waitingMaxPage;
    }
}

function prevWaiting() {
    if(waitingPage > 1) {
        waitingPage -= 1;
        navigateWaiting(waitingPage);
    }
}

function nextWaiting() {
    if(waitingPage < waitingMaxPage) {
        waitingPage += 1;
        navigateWaiting(overrallPage);
    }
}


function navigatePending(page) {
    let table = document.getElementById('orderPendingTable');
    let noData = document.getElementById('noDataPending');
    table.innerHTML = '';
    if(pendingList && pendingList.length > 0 && page <= pendingMaxPage && page > 0) {
        let index = (page - 1) * showMax;
        noData.style.display = 'none';
        for(let i = index; i < Math.min(index + showMax, pendingList.length); i++) {
            let order = pendingList[i];

            let element = document.createElement('tr');
            element.classList.add('selector');

            let id = '<td class="border-bottom-0"><h6 class="fw-semibold mb-0">' + order.id + '</h6></td>';
            let name = '<td class="border-bottom-0">' + order.name + '</td>';
            let price = '<td class="border-bottom-0">' + order.price + '</td>';
            let creator = '<td class="border-bottom-0">' + order.creator + '</td>';
            let creation = '<td class="border-bottom-0">' + formatTimeNoHour(order.expectTime) + '</td>';

            let _id = order.id;
            element.addEventListener('click', function() {
                retrieve('order-admin-detail', {id: _id}, function(data) {
                    if(data.retcode != 0) {
                        swal(failedLabel, data.message, 'error');
                        return;
                    }
                    chosenOrder = data.data;
                    orderDetail();
                });
            });

            let content = id + name + price + creator + creation;
            element.innerHTML = content;
            table.appendChild(element);
        }
    } else {
        noData.style.display = 'block';
    }

    let prevTable = document.getElementById('prevOrderPending');
    let pageTable = document.getElementById('pageOrderPending');
    let nextTable = document.getElementById('nextOrderPending');
    if(pendingMaxPage < 2) {
        prevTable.style.display = 'none';
        pageTable.style.display = 'none';
        nextTable.style.display = 'none';
    } else {
        prevTable.style.display = page < 2 ? 'none' : 'inline';
        nextTable.style.display = page >= pendingMaxPage ? 'none' : 'inline';
        pageTable.style.display = 'inline';
        pageTable.innerText = page + '/' + pendingMaxPage;
    }
}

function prevPending() {
    if(pendingPage > 1) {
        pendingPage -= 1;
        navigatePending(pendingPage);
    }
}

function nextPending() {
    if(pendingPage < pendingMaxPage) {
        pendingPage += 1;
        navigatePending(pendingPage);
    }
}


function navigateCompleted(page) {
    let table = document.getElementById('orderCompletedTable');
    let noData = document.getElementById('noDataCompleted');
    table.innerHTML = '';
    if(completedList && completedList.length > 0 && page <= completedMaxPage && page > 0) {
        let index = (page - 1) * showMax;
        noData.style.display = 'none';
        for(let i = index; i < Math.min(index + showMax, completedList.length); i++) {
            let order = completedList[i];

            let element = document.createElement('tr');
            element.classList.add('selector');

            let id = '<td class="border-bottom-0"><h6 class="fw-semibold mb-0">' + order.id + '</h6></td>';
            let name = '<td class="border-bottom-0">' + order.name + '</td>';
            let price = '<td class="border-bottom-0">' + order.price + '</td>';
            let creator = '<td class="border-bottom-0">' + order.creator + '</td>';
            let creation = '<td class="border-bottom-0">' + formatTime(order.completeTime) + '</td>';

            let _id = order.id;
            element.addEventListener('click', function() {
                retrieve('order-admin-detail', {id: _id}, function(data) {
                    if(data.retcode != 0) {
                        swal(failedLabel, data.message, 'error');
                        return;
                    }
                    chosenOrder = data.data;
                    orderDetail();
                });
            });

            let content = id + name + price + creator + creation;
            element.innerHTML = content;
            table.appendChild(element);
        }
    } else {
        noData.style.display = 'block';
    }

    let prevTable = document.getElementById('prevOrderCompleted');
    let pageTable = document.getElementById('pageOrderCompleted');
    let nextTable = document.getElementById('nextOrderCompleted');
    if(completedMaxPage < 2) {
        prevTable.style.display = 'none';
        pageTable.style.display = 'none';
        nextTable.style.display = 'none';
    } else {
        prevTable.style.display = page < 2 ? 'none' : 'inline';
        nextTable.style.display = page >= completedMaxPage ? 'none' : 'inline';
        pageTable.style.display = 'inline';
        pageTable.innerText = page + '/' + completedMaxPage;
    }
}

function prevCompleted() {
    if(completedPage > 1) {
        completedPage -= 1;
        navigateCompleted(completedPage);
    }
}

function nextCompleted() {
    if(completedPage < completedMaxPage) {
        completedPage += 1;
        navigateCompleted(completedPage);
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
    orderDetail.scrollIntoView();
}


$(document).ready(function() {

    $("#orderComplete").submit(function(e) {
        e.preventDefault();
        if(!chosenOrder) return;
        
        var formArray = $("#orderComplete").serializeArray();
        var formData = {};
        formArray.forEach(function(field) {
            formData[field.name] = field.value;
        });

        if(!formData.path) {
            swal(failedLabel, messageLabel.orderCompleteInputPath, 'error');
            return;
        }

        const id = chosenOrder.id;
        const path = formData.path;
        const time = Date.now();
        const type = 'ORDER_COMPLETE';
        const checkSum = CryptoJS.SHA512(id + "|" + path + "|" + time + "|" + type).toString();
        
        const data = {
            id: id,
            path: path,
            time: time,
            type: type,
            checkSum: checkSum
        };

        $.ajax({
            url: "/api/order/complete",
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            success: function(res) {
                if(res.retcode === 0) {
                    swal(successLabel, messageLabel.orderComplete, 'success').then(function() {
                        window.location.reload();
                    });
                } else {
                    swal(failedLabel, res.message, 'error');
                }
            }
        });
    });

});



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
