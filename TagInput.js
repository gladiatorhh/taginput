const inputs = [...document.getElementsByClassName("tag-input")];

document.addEventListener("keydown", function (event) {
    if (event.key == "Enter") {
        event.preventDefault();
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
function CreateUiElements(parentElement, baseInput) {

    let ajaxAutoCompleteUrl = baseInput.getAttribute('data-auto-complete-url');

    let list = document.createElement("ul");
    list.classList.add("tag-input-list");

    let inputContainer = document.createElement("div");
    inputContainer.classList.add("tag-input-input-container");

    let input = document.createElement("input");
    input.type = "text";
    input.classList.add("tag-input-text");
    input.placeholder = baseInput.placeholder;

    inputContainer.appendChild(input);
    let autoComplete;
    if (ajaxAutoCompleteUrl != undefined && ajaxAutoCompleteUrl.trim().length > 0) {
        autoComplete = document.createElement("ul");
        autoComplete.classList.add("auto-complete-list");
        inputContainer.appendChild(autoComplete);
    }

    input.addEventListener('keyup', function (event) {
        AddTag(event, this, baseInput);
        if (ajaxAutoCompleteUrl != undefined && ajaxAutoCompleteUrl.trim().length > 0) {
            if (event.keyCode != 40 && event.keyCode != 38) {
                AutoComplete(this, ajaxAutoCompleteUrl.trim());
            }
            NavigateAutoComplete(event, this);
        }
    });

    list.appendChild(inputContainer);

    parentElement.appendChild(list);
    GetDefaultValue(baseInput, list);
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
                    UpdateTagsUiList(tags, tagInput.parentElement.parentElement, baseElement);
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
    let listItem;
    let tagText;
    let removeBtn;
    tagList.slice().reverse().forEach(tag => {
        listItem = document.createElement("li");
        listItem.classList.add("input-tag-item");

        tagText = document.createElement("span");
        tagText.classList.add("input-tag-text-container");
        tagText.appendChild(document.createTextNode(tag));

        removeBtn = document.createElement("span");
        removeBtn.innerHTML = "&#10005;";
        removeBtn.classList.add("input-tag-remove-btn");
        removeBtn.addEventListener("click", function () { RemoveTag(this, baseElement) });
        removeBtn.setAttribute("data-remove-text", tag);

        listItem.appendChild(tagText);
        listItem.appendChild(removeBtn);

        containerList.insertBefore(listItem, containerList.firstChild);
    });
}


async function AutoComplete(currentInput, url) {
    let response = await fetch(url + "?search=" + currentInput.value.trim())
        .then(response => response.json())
        .then(json => json);

    if (currentInput.value.trim().length === 0)
        response = [];

    FillAutoComplete(response, currentInput);
}

function FillAutoComplete(data, input) {
    let htmlList = data.map(object =>
        `<li class="auto-complete-list-item"><button type="button" onclick="FillTag(this,'${object}')">${object}</button></li>`)
        .join("");

    input.parentElement.lastChild.innerHTML = htmlList;
}

function FillTag(element, text) {
    let mainInput = element.parentElement.parentElement.parentElement.firstChild.value;
    mainInput = text;
    mainInput.focus();
    mainInput.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Enter' }));
}

function NavigateAutoComplete(baseEvent, input) {
    let autoCompleteItems = Array.from(input.parentElement.lastChild.children);
    let elementCount = autoCompleteItems.length;

    let activeElement = autoCompleteItems.findIndex(e => e.classList.contains("active-auto-complete-item"));
    switch (baseEvent.keyCode) {
        case 40:
            if (activeElement !== -1) {
                autoCompleteItems[activeElement].classList.remove("active-auto-complete-item");
                autoCompleteItems[activeElement].querySelector('button').removeEventListener("keydown", null);
            }

            if ((activeElement + 1) === elementCount) {
                activeElement = 0;
            }

            autoCompleteItems[activeElement + 1].classList.add("active-auto-complete-item");
            autoCompleteItems[activeElement + 1].querySelector('button').focus();
            autoCompleteItems[activeElement + 1].querySelector('button').addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    FillTag(autoCompleteItems[activeElement + 1].querySelector('button'), autoCompleteItems[activeElement + 1].querySelector('button').innerText);
                }
                input.focus();
            });
            break;

        case 38:
            if (activeElement > 0) {
                autoCompleteItems[activeElement].classList.remove("active-auto-complete-item");
                autoCompleteItems[activeElement].querySelector('button').removeEventListener("keydown", null);

                if (activeElement > 0) {

                    autoCompleteItems[activeElement - 1].classList.add("active-auto-complete-item");
                    autoCompleteItems[activeElement - 1].querySelector('button').focus();
                    autoCompleteItems[activeElement - 1].querySelector('button').addEventListener("keydown", (event) => {
                        if (event.key === "Enter") {
                            FillTag(this, this.value);
                        }
                        input.focus();
                    });
                }
            }

            if ((activeElement + 1) === elementCount) {
                activeElement = 0;
            }
            break;
    }
}