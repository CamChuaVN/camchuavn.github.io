let licenseList = null;
let showMax = 5;
let page = 1;
let maxPage = 0;
let chosenLicense = null;

document.getElementById('downloadPlugin').addEventListener('click', function() {
    if(chosenLicense) {
        if(chosenLicense.to > 0) {
            let currentTime = new Date().now();
            if(chosenLicense.to > currentTime) return;
        }
        
        let link = chosenLicense.path;
        let linkHidden = document.getElementById('link');
        linkHidden.href = link;
        linkHidden.click();
    }
});
document.getElementById('copyKey').addEventListener('click', function() {
    if(chosenLicense) {
        let license = chosenLicense.key;
        navigator.clipboard.writeText(license);
        swal(successLabel, copyKeyLabel, 'success');
    }
});

retrieve('plugin', null, function(data) {
    if(data.retcode != 0) {
        swal(failedLabel, data.message, 'error');
        return;
    }
    licenseList = data.data;
    maxPage = parseInt(licenseList.length / showMax) + (licenseList.length % showMax === 0 ? 0 : 1);

    let prevPlugin = document.getElementById('prevPlugin');
    let nextPlugin = document.getElementById('nextPlugin');

    prevPlugin.addEventListener('click', function() {
        prev();
    });
    nextPlugin.addEventListener('click', function() {
        next();
    });

    navigate(page);
});

function navigate(page) {
    let pluginTable = document.getElementById('pluginTable');
    let noData = document.getElementById('noData');
    pluginTable.innerHTML = '';
    if(licenseList && licenseList.length > 0 && page <= maxPage && page > 0) {
        let index = (page - 1) * showMax;
        noData.style.display = 'none';
        for(let i = index; i < Math.min(index + showMax, licenseList.length); i++) {
            let license = licenseList[i];

            let element = document.createElement('tr');
            element.classList.add('selector');

            let name = '<td class="border-bottom-0"><h6 class="fw-semibold mb-0">' + license.name + '</h6></td>';
            let version = '<td class="border-bottom-0">' + license.version + '</td>';
            let key = '<td class="border-bottom-0">' + license.license + '</td>';
            let expire = '<td class="border-bottom-0">' + sanityExpire(license.expire) + '</td>';
            let status = '<td class="border-bottom-0"><span class="badge ' + (license.status === 'Online' ? 'bg-success' : 'bg-primary') + ' rounded-3 fw-semibold">' + license.status + '</span></td>';

            let id = license.id;
            element.addEventListener('click', function() {
                retrieve('plugin-detail', {id: id}, function(data) {
                    if(data.retcode != 0) {
                        swal(failedLabel, data.message, 'error');
                        return;
                    }
                    chosenLicense = data.data;
                    pluginDetail();
                });
            });

            let content = name + version + key + expire + status;
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

        if(fieldValue === 'expire') element.value = sanityExpire(chosenLicense[fieldValue]);
        else if(fieldValue === 'time') element.value = formatTime(chosenLicense[fieldValue]);
        else element.value = chosenLicense[fieldValue];
    });
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
