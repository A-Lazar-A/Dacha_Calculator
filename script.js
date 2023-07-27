const ul = document.querySelector("ul");
const removeBtn = document.querySelector("button")
input = ul.querySelector("input");
counterName = document.querySelector(".details span");
const form = document.querySelector("form");
formInputName = document.getElementById("product");
formInputPrice = document.getElementById("price");
const addBtn = form.querySelector("button")
const tableTbody = document.querySelector("table.datatable").querySelector("tbody");
const calcTable = document.querySelector("table.calculated");
const calcBtn = document.querySelector('.calculate').querySelector("button");

let tags = (JSON.parse(localStorage.getItem("tags-list"))) ? JSON.parse(localStorage.getItem("tags-list")) : [];
let maxNames = 20;
let products = (JSON.parse(localStorage.getItem("products-list"))) ? JSON.parse(localStorage.getItem("products-list")) : [];
let calcData = new Map();


const data = {
    labels: [],
    datasets: [{
        label: '',
        data: [],
        hoverOffset: 4
    }]
};
const config = {
    type: 'doughnut',
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'People'
            }
        }
    },
};
let chart = new Chart(
    document.getElementById('chart'),
    config
)




function countName() {

    counterName.innerText = maxNames - tags.length;

}

function createTag() {
    tags.forEach(tag => {
        let liTag = `<li >${tag} <i class="uit uit-multiply" onclick="remove(this, '${tag}')"></i></li>`;
        ul.insertAdjacentHTML("afterbegin", liTag);
    })
}

function createProduct() {
    let allRows = "";
    let td = ``;
    tags.forEach(tag => {
        let option = `<option>${tag}</option>`;
        td += option;
    })
    products.forEach((product, id) => {
        let row = `<tr>
                <td>${product["name"]}</td>
                <td>
                    <div class="input-group">

                        <input type="number" class="form-control" value="${product["price"]}">
                        <span class="input-group-text" >RUB</span>
                    </div>
                </td>
                <td>
                    <select class="selectpicker" multiple data-container="body" data-live-search="true" data-width="fit" data-actions-box="true" data-selected-text-format="count > 2">
                        ${td}
                    </select>
                </td>
                <td>
                    <button class="btn btn-danger" onclick="remove_product(this, ${id})">DELETE</button>
                </td>
            </tr>`;
        allRows += row;
    });
    tableTbody.innerHTML = allRows;

}

createTag(); //initial from local storage
createProduct();
let selectors = tableTbody.querySelectorAll(".selectpicker");

function addSelects(tag) {

    selectors.forEach(select => {

        let option = `<option>${tag}</option>`;

        select.insertAdjacentHTML("afterbegin", option);
        $(select).selectpicker('refresh');

    })
}

function removeSelect(tag) {
    selectors.forEach(select => {

        for (const op of select.querySelectorAll('option')) {
            if (op.textContent.includes(tag)) {
                op.remove();
                break;
            }
        }
        $(select).selectpicker('refresh');

    })
}

function refreshSelect() {
    selectors.forEach(select => {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
            $(select).selectpicker('mobile');
        }

        $(select).selectpicker('refresh');
    })
}

function remove_product(el, id) {

    products.splice(id, 1);

    localStorage.setItem("products-list", JSON.stringify(products));
    createProduct();
    selectors = tableTbody.querySelectorAll(".selectpicker");
    refreshSelect();
}

function remove(element, tag) {
    let index = tags.indexOf(tag);
    tags.splice(index, 1);
    element.parentElement.remove();
    localStorage.setItem("tags-list", JSON.stringify(tags));
    countName();
    removeSelect(tag);
}

function addTag(e) {
    if (e.key === " ") {
        let tag = e.target.value.trim();
        if (tag.length >= 1 && !tags.includes(tag)) {
            if (tags.length < 20) {
                tags.push(tag);
                localStorage.setItem("tags-list", JSON.stringify(tags));
                let liTag = `<li >${tag} <i class="uit uit-multiply" onclick="remove(this, '${tag}')"></i></li>`;
                ul.insertAdjacentHTML("afterbegin", liTag);
                countName();
                let option = `<option>${tag}</option>`;
                addSelects(tag);
            }
        }
        input.value = ''
    }
}


function addProduct() {
    let name = formInputName.value.trim();
    let price = +formInputPrice.value;
    let productInfo = {name: name, price: price};
    products.push(productInfo);
    localStorage.setItem("products-list", JSON.stringify(products));
    formInputName.value = '';
    formInputPrice.value = '';


    createProduct();
    selectors = tableTbody.querySelectorAll(".selectpicker");
    refreshSelect();
}

function createChart(names, prices, ){

    const data = {
        labels: names,
        datasets: [{
            label: 'Sum',
            data: prices,

            hoverOffset: 4
        }]
    };
    chart.data = data;
    chart.update();
    document.getElementById('chart').parentElement.classList.remove("visually-hidden");
}
function calculate() {
    let tableRows = tableTbody.rows;

    for (let row of tableRows) {
        let selectedOptions = Array.from(row.children[2].querySelector("select").selectedOptions);
        let options = row.children[2].querySelector("select").options;
        let product = row.children[0].innerText;
        let price = row.children[1].querySelector("input").value / selectedOptions.length;
        let selectedNames = [];
        for (let opt of options) {
            if (selectedOptions.includes(opt)) {

                if (calcData.has(opt.innerText)) {
                    calcData.get(opt.innerText)[product] = price;
                } else {
                    calcData.set(opt.innerText, {[product]: price});
                }
            } else {
                if (calcData.has(opt.innerText)) {
                    calcData.get(opt.innerText)[product] = 0;
                } else {
                    calcData.set(opt.innerText, {[product]: 0});
                }
            }

        }

    }
    console.log(calcData);
    showCalcTable();


}

function showCalcTable() {
    let tr  = '';
    let rows = '';
    let names = [];
    let prices = [];

    products.forEach(product => {
        let th = `<th scope="col">${product.name}</th>`;
        tr += th;

    })
    calcData.forEach((value, key) => {
        let row = `<td>${key}</td>`;
        let total = 0
        products.forEach(product=>{
            row += `<td>${value[product.name].toFixed(2)}</td>`
            total += +value[product.name];
        })
        names.push(key);
        prices.push(total);

        row += `<td class="table-primary">${total.toFixed(2)}</td>`;
        rows += `<tr>${row}</tr>`;
    })


    let thred = `<tr>
                        <th scope="col">Name</th>
                        ${tr}
                        <th scope="col">Total</th>
                    </tr>`

    calcTable.querySelector("thead").innerHTML = thred;
    calcTable.querySelector("tbody").innerHTML = rows;
    calcTable.parentElement.parentElement.classList.remove("visually-hidden");
    createChart(names, prices);
}

addBtn.addEventListener("click", addProduct);

input.addEventListener("keyup", addTag);
removeBtn.addEventListener("click", () => {
    tags.length = 0;
    ul.querySelectorAll("li").forEach(li => li.remove());
    countName();
    localStorage.setItem("tags-list", JSON.stringify(tags));
});
calcBtn.addEventListener('click', calculate);