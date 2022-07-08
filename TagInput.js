let inputs = [...document.getElementsByClassName("tag-input")];
let tags = [];

console.log(inputs)
console.log(typeof inputs)

inputs.forEach(element => {
    ConvertToTagInput(element);
});



function ConvertToTagInput(element) {

    if (!ValidateElement(element)) {
        return console.error("Selected element is not valid")
    }


    element.style.display = "none";
    let parentElement = element.parentNode;

    parentElement.insertAdjacentHTML('beforeend',
        `<ul class="tag-input-list"><input class="tag-input-text" placeholder="${element.placeholder}" onkeyup="AddTag(event,this)"/></ul>`);
}


function AddTag(event, element) {
    if (event.key == 'Enter') {
        let inputTag = element.value.replace(/\s+/g, ' ').trim();

        if (inputTag.length > 0) {
            inputTag.split(",").forEach(tag => {
                if (!tags.includes(tag)) {
                    tags.push(tag);
                    UpdateTagsUiList(tags, element);
                }
            })

        }

        element.value = "";
    }
}

function ValidateElement(element) {
    let tagName = element.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
        return true;
    }
    else {
        return false;
    }
}

function RemoveTag(element) {
    const index = tags.indexOf(element.getAttribute("data-remove-text"));
    if (index > -1) {
        tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
    }
    UpdateTagsUiList(tags, element.parentElement);
}

function UpdateTagsUiList(tagList, element) {
    let parentElement = element.parentElement;
    parentElement.querySelectorAll("li").forEach(element => element.remove());

    tagList.slice().reverse().forEach(tag => {
        parentElement.insertAdjacentHTML("afterbegin",
            `<li class="input-tag-item"><span class="input-tag-text-container">${tag}</span><span class="input-tag-remove-btn" onclick="RemoveTag(this)" data-remove-text="${tag}">&#10005;<span></li>`);
    });
}