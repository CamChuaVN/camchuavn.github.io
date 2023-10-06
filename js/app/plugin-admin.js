let pluginList = null;
let showMax = 5;
let page = 1;
let maxPage = 0;
let chosenPlugin = null;

retrieve('plugin-admin', null, function(data) {
    if(data.retcode != 0) {
        swal(failedLabel, data.message, 'error');
        return;
    }
    pluginList = data.data;
    maxPage = parseInt(pluginList.length / showMax) + (pluginList.length % showMax === 0 ? 0 : 1);

    let prevPlugin = document.getElementById('prevPlugin');
    let nextPlugin = document.getElementById('nextPlugin');

    prevPlugin.addEventListener('click', function() {
        prev();
    });
    nextPlugin.addEventListener('click', function() {
        next();
    });


    let _prevLicense = document.getElementById('prevLicense');
    let _nextLicense = document.getElementById('nextLicense');

    _prevLicense.addEventListener('click', function() {
        prevLicense();
    });
    _nextLicense.addEventListener('click', function() {
        nextLicense();
    });

    navigate(page);
});

function navigate(page) {
    let pluginTable = document.getElementById('pluginTable');
    let noData = document.getElementById('noData');
    pluginTable.innerHTML = '';
    if(pluginList && pluginList.length > 0 && page <= maxPage && page > 0) {
        let index = (page - 1) * showMax;
        noData.style.display = 'none';
        for(let i = index; i < Math.min(index + showMax, pluginList.length); i++) {
            let plugin = pluginList[i];

            let element = document.createElement('tr');
            element.classList.add('selector');

            let id = '<td class="border-bottom-0"><h6 class="fw-semibold mb-0">' + plugin.id + '</h6></td>';
            let name = '<td class="border-bottom-0"><h6 class="fw-semibold mb-0">' + plugin.name + '</h6></td>';
            let version = '<td class="border-bottom-0">' + plugin.version + '</td>';
            let price = '<td class="border-bottom-0">' + plugin.price + '</td>';

            element.addEventListener('click', function() {
                retrieve('plugin-admin-detail', {id: plugin.id}, function(data) {
                    console.log(data);
                    if(data.retcode != 0) {
                        swal(failedLabel, data.message, 'error');
                        return;
                    }
                    chosenPlugin = data.data;
                    licenseList = data.data.license;
                    pageLicense = 1;
                    maxPageLicense = parseInt(licenseList.length / showMax) + (licenseList.length % showMax === 0 ? 0 : 1);
                    checkedLicense = [];

                    let licenseDetail = document.getElementById('licenseDetail');
                    licenseDetail.style.cssText = 'display:none !important';
                    pluginDetail();
                });
            });

            let content = id + name + version + price;
            element.innerHTML = content;
            pluginTable.appendChild(element);
        }
    } else {
        noData.style.display = 'inline';
    }

    let prevPlugin = document.getElementById('prevPlugin');
    let pagePlugin = document.getElementById('pagePlugin');
    let nextPlugin = document.getElementById('nextPlugin');
    if(maxPage < 2) {
        prevPlugin.style.display = 'none';
        pagePlugin.style.display = 'none';
        nextPlugin.style.display = 'none';
    } else {
        prevPlugin.style.display = page < 2 ? 'none' : 'inline';
        nextPlugin.style.display = page >= maxPage ? 'none' : 'inline';
        pagePlugin.style.display = 'inline';
        pagePlugin.innerText = page + '/' + maxPage;
    }
}


function pluginDetail() {
    let pluginDetail = document.getElementById('pluginDetail');
    pluginDetail.style.display = 'inline';
    let elementsWithField = document.querySelectorAll('[field]');
    elementsWithField.forEach(element => {
        let fieldValue = element.getAttribute('field');
        element.value = chosenPlugin[fieldValue];
    });

    navigateLicense(pageLicense);

    let content = document.getElementById('pluginEdit');
    content.innerHTML = chosenPlugin.content;
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



let licenseList = null;
let pageLicense = 1;
let maxPageLicense = 0;
let chosenLicense = null;
let checkedLicense = [];

function navigateLicense(page) {
    let pluginTable = document.getElementById('licenseTable');
    let noData = document.getElementById('noLicense');
    pluginTable.innerHTML = '';
    if(licenseList && licenseList.length > 0 && page <= maxPageLicense && page > 0) {
        let index = (page - 1) * showMax;
        noData.style.display = 'none';
        for(let i = index; i < Math.min(index + showMax, licenseList.length); i++) {
            let plugin = licenseList[i];

            let element = document.createElement('tr');
            element.classList.add('selector');

            let choose = '<td class="border-bottom-0"><input type="checkbox" licenseId="' + plugin.id + '"' + (checkedLicense.includes(plugin.id) ? ' checked' : '') + '></td>';
            let id = '<td class="border-bottom-0"><h6 class="fw-semibold mb-0">' + plugin.id + '</h6></td>';
            let key = '<td class="border-bottom-0">' + plugin.key + '</td>';
            let expire  = '<td class="border-bottom-0">' + sanityExpire(plugin.expire) + '</td>';
            let status = '<td class="border-bottom-0">' + plugin.status + '</td>';
            let owner = '<td class="border-bottom-0">' + plugin.owner + '</td>';

            element.addEventListener('click', function() {
                retrieve('license-admin-detail', {id: plugin.id}, function(data) {
                    console.log(data);
                    if(data.retcode != 0) {
                        swal(failedLabel, data.message, 'error');
                        return;
                    }
                    chosenLicense = data.data;
                    licenseDetail();
                });
            });

            let content = choose + id + key + expire + status + owner;
            element.innerHTML = content;
            pluginTable.appendChild(element);
        }

        let licenseCheckbox = document.querySelectorAll("input[licenseId]");
        licenseCheckbox.forEach(element => {
            element.addEventListener('click', function(e) {
                e.stopPropagation();
            });
            element.addEventListener('change', function() {
                let id = parseInt(this.getAttribute('licenseId'));
                if(this.checked) {
                    let index = checkedLicense.indexOf(id);
                    if(index === -1) {
                        checkedLicense.push(id);
                    }
                } else {
                    let index = checkedLicense.indexOf(id);
                    if(index !== -1) {
                        checkedLicense.splice(index, 1);
                    }
                }
            });
        });
    } else {
        noData.style.display = 'inline';
    }

    let prevPlugin = document.getElementById('prevLicense');
    let pagePlugin = document.getElementById('pageLicense');
    let nextPlugin = document.getElementById('nextLicense');
    if(maxPageLicense < 2) {
        prevPlugin.style.display = 'none';
        pagePlugin.style.display = 'none';
        nextPlugin.style.display = 'none';
    } else {
        prevPlugin.style.display = page < 2 ? 'none' : 'inline';
        nextPlugin.style.display = page >= maxPageLicense ? 'none' : 'inline';
        pagePlugin.style.display = 'inline';
        pagePlugin.innerText = page + '/' + maxPageLicense;
    }
}

function licenseDetail() {
    let pluginDetail = document.getElementById('licenseDetail');
    pluginDetail.style.display = 'inline';
    let elementsWithField = document.querySelectorAll('[licenseField]');
    elementsWithField.forEach(element => {
        let fieldValue = element.getAttribute('licenseField');
        
        if(fieldValue === 'expire') element.value = sanityExpire(chosenLicense[fieldValue]);
        else if(fieldValue === 'time') element.value = formatTime(chosenLicense[fieldValue]);
        else element.value = chosenLicense[fieldValue];
    });
}


function prevLicense() {
    if(pageLicense > 1) {
        pageLicense -= 1;
        navigateLicense(pageLicense);
    }
}

function nextLicense() {
    if(pageLicense < maxPageLicense) {
        pageLicense += 1;
        navigateLicense(pageLicense);
    }
}



$(document).ready(function() {

    $("#pluginSubmit").submit(function(e) {
        e.preventDefault();
        if(!chosenPlugin) return;
        
        var formArray = $("#pluginSubmit").serializeArray();
        var formData = {};
        formArray.forEach(function(field) {
            formData[field.name] = field.value;
        });

        const id = chosenPlugin.id;
        const time = Date.now();
        const type = 'SERVICE_EDIT';
        const checkSum = CryptoJS.SHA512(id + "|" + time + "|" + type).toString();
        const content = editorInfo.root.innerHTML;
        
        const data = {
            id: id,
            time: time,
            type: type,
            checkSum: checkSum,
            content: content
        };

        if(formData.price) data.price = formData.price;
        if(formData.selling) data.selling = formData.selling;
        if(formData.author) data.author = formData.author;
        if(formData.path) data.path = formData.path;
        if(formData.icon) data.icon = formData.icon;
        if(formData.description) data.description = formData.description;

        $.ajax({
            url: "/api/service/edit",
            type: 'post',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            success: function(res) {
                if(res.retcode === 0) {
                    swal('Thành Công', 'edit success', 'success').then(function() {
                        window.location.reload();
                    });
                } else {
                    swal('Thất Bại', res.message, 'error');
                }
            }
        });
    });

});


function sanityExpire(milliseconds) {
    if(milliseconds <= 0) return foreverLabel;
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

function formatTime(seconds) {
    let days = Math.floor(seconds / (3600 * 24));
    let hours = Math.floor((seconds % (3600 * 24)) / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;
  
    let formattedTime = '';
    if(days > 0) formattedTime += `${parseInt(days)}d `;
    if(hours > 0) formattedTime += `${parseInt(hours)}h `;
    if(minutes > 0) formattedTime += `${parseInt(minutes)}m `;
    if(remainingSeconds > 0) formattedTime += `${parseInt(remainingSeconds)}s`;
    return formattedTime.trim();
}
