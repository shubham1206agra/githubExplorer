// button trigger selector
var btn = document.querySelector(".z");
// inputs selector
var inp = document.querySelector(".inp1");
var inp2 = document.querySelector(".inp2");
var inp3 = document.querySelector(".inp3");
// main content container selector
var content = document.querySelector("#sel");
// modal body selector
var modalContent = document.querySelector("#mbo");

// btn press event listener
btn.addEventListener("click", async function () {
    var user = inp.value;
    if (user === "" || user == null || user == undefined) return;
    var n = inp2.value;
    if (n === "" || n == null || n == undefined || n <= 0) return;
    // computing no. of pages
    var pages = Math.ceil(n / 100);
    if (pages > 10) return;
    // removing all previous event listener if present
    content.nodeValue = content.cloneNode(true);
    // spinner show
    content.innerHTML = `
    <div class="text-center">
        <div class="spinner-grow text-danger" style="width: 4rem; height: 4rem;" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    </div>`;
    var list = [];
    for (var i = 1; i <= pages; i++) {
        // fetch api for using github api
        var res = await fetch(
            `https://api.github.com/search/repositories?q=user:${user}&sort=forks&per_page=100&page=${i}`
        );
        var temp = await res.json();
        // error handling
        if (res.status != 200) {
            content.innerHTML = `
            <div class="text-center">
                <h3 class="display-4 text-danger">${temp.message}</h3>
                <p>${temp.errors[0].message}</p>
            </div>
            `;
            return;
        }
        list = list.concat(temp.items);
    }
    // load content in html
    var htmlC = `<div class="accordion" id="accordionContent">`;
    for (var i = 0; i < n && i < 1000 && i < list.length; i++) {
        var obj = list[i];
        htmlC += `<div class="accordion-item">
        <h2 class="accordion-header" id="heading${i + 1}">
            <button
                class="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapse${i + 1}"
                aria-expanded="false"
                aria-controls="collapse${i + 1}"
            >
                ${i + 1}. ${obj["full_name"]}
            </button>
        </h2>
        <div
            id="collapse${i + 1}"
            class="accordion-collapse collapse"
            aria-labelledby="heading${i + 1}"
            data-bs-parent="#accordionContent"
        >
            <div class="accordion-body">
                <div class="card-body">
                    <h5 class="card-title"><i class="fas fa-code-branch"></i> <a href="${
                        obj["html_url"]
                    }">${obj["full_name"]}</a></h5>
                    <h6 class="card-subtitle mb-2 text-muted">${
                        obj["description"]
                    }</h6>
                    <p class="card-text">Forks: <strong>${
                        obj["forks_count"]
                    }</strong>  |  Contributors: <span class="spq"><a data-repo="${obj["full_name"]}" data-bs-toggle="modal" data-bs-target="#contriModal" data-link="${
            obj["contributors_url"]
        }" class="beta">View</a></span> </p>
                </div>
            </div>
        </div>
    </div>`;
    }
    htmlC += `</div>`;
    content.innerHTML = htmlC;
    // selecting all btn for modal functioning
    document.querySelectorAll(".beta").forEach((el) => {
        // adding click listener on links for modal content loading
        el.addEventListener("click", async (ev) => {
            var m = inp3.value;
            if (m === "" || m == null || m == undefined || m <= 0) return;
            var contriList = [];
            var mPages = Math.ceil(m / 100);
            // spinner loading
            modalContent.innerHTML = `
                <div class="text-center">
                    <div class="spinner-border text-warning" style="width: 4rem; height: 4rem;" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>`;
            // searching for contributors
            for (var i = 1; i <= mPages; i++) {
                var res1 = await fetch(
                    `${el.dataset.link}?per_page=100&page=${i}`
                );
                var temp1 = await res1.json();
                contriList = contriList.concat(temp1);
            }
            // rendering content modal
            var inHtml = `<h4>${el.dataset.repo}</h4>`;
            inHtml += "<ol>";
            for (var i = 0; i < m && i < contriList.length; i++) {
                var userObj = contriList[i];
                inHtml += `<li><a href="${userObj["html_url"]}">${userObj["login"]}</a>: ${userObj["contributions"]}</li>`;
            }
            inHtml += "</ol>";
            modalContent.innerHTML = inHtml;
        });
    });
});
