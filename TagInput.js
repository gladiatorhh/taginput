let inputs = [...document.getElementsByClassName("tag-input")];

document.addEventListener("keydown", function (event) {
    if (event.key == "Enter") {
        return false;
    }
});

inputs.forEach(element => {
    ConvertToTagInput(element);
});



function ConvertToTagInput(element) {

    if (!ValidateElement(element)) {
        return console.error("Selected element is not valid")
    }


    element.style.display = "none";
    let parentElement = element.parentElement;

    CreateUiElements(parentElement, element);

}

// create ui elements and return the created elements
function CreateUiElements(parentElement, baseElement) {
    let list = document.createElement("ul");
    list.classList.add("tag-input-list");
    let input = document.createElement("input");
    input.type = "text";
    input.classList.add("tag-input-text");
    input.placeholder = baseElement.placeholder;
    input.addEventListener('keyup', function (event) { AddTag(event, this, baseElement) });
    list.appendChild(input);

    parentElement.appendChild(list);
    GetDefaultValue(baseElement, list);
}

function GetDefaultValue(baseElement, listContainer) {
    let tags = [];
    let defaultTags = baseElement.value;

    if (defaultTags !== null && defaultTags.trim().length > 0) {
        defaultTags.replace(/\s+/g, ' ').split(",").forEach(tag => tags.push(tag.trim()));
        UpdateTagsUiList(tags, listContainer, baseElement);
    }
}

function AddTag(event, tagInput, baseElement) {
    if (event.key == 'Enter') {
        let inputTag = tagInput.value.replace(/\s+/g, ' ').trim();
        let tags = baseElement.value.trim().split(',')
            .filter(ar => (ar.trim().length > 0 && ar !== undefined && ar !== null));
        if (inputTag.length > 0) {
            inputTag.split(",").forEach(tag => {
                if (!tags.includes(tag)) {
                    tags.push(tag);
                    UpdateTagsUiList(tags, tagInput.parentElement, baseElement);
                }
            })
        }

        tagInput.value = "";
    }
}

function ValidateElement(inputElement) {
    let tagName = inputElement.tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
        return true;
    }
    else {
        return false;
    }
}

function RemoveTag(tag, baseElement) {
    let tags = baseElement.value.trim().split(',')
        .filter(ar => (ar.trim().length > 0 && ar !== undefined && ar !== null));
    const index = tags.indexOf(tag.getAttribute("data-remove-text"));
    if (index > -1) {
        tags = [...tags.slice(0, index), ...tags.slice(index + 1)];
    }
    UpdateTagsUiList(tags, tag.parentElement.parentElement, baseElement);
}

function UpdateTagsUiList(tagList, containerList, baseElement) {
    containerList.querySelectorAll("li").forEach(element => element.remove());
    baseElement.value = tagList.join(',');
    tagList.slice().reverse().forEach(tag => {
        let listItem = document.createElement("li");
        listItem.classList.add("input-tag-item");
        let tagText = document.createElement("span");
        tagText.classList.add("input-tag-text-container");
        tagText.appendChild(document.createTextNode(tag));
        let removeBtn = document.createElement("span");
        removeBtn.innerHTML = "&#10005;";
        removeBtn.classList.add("input-tag-remove-btn");
        removeBtn.addEventListener("click", function () { RemoveTag(this, baseElement) });
        removeBtn.setAttribute("data-remove-text", tag);
        listItem.appendChild(tagText);
        listItem.appendChild(removeBtn);
        containerList.insertBefore(listItem, containerList.firstChild);
    });
}