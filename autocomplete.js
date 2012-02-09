function InputSuggestions(inputID, list) {
    var self = this,
        html,
        suggestionBox = document.createElement('div'),
        input,
        selectedIndex = -1;

    this.list = list || []; // this is the list of strings to filter on text input
    this.inputID = inputID || ''; // the id of the text input

    function addEvent(element, eventName, func) {
        if (element.addEventListener) {
            element.addEventListener(eventName, func);
        } else if (element.attachEvent) {
            element.attachEvent('on' + eventName, func);
        }
    }

    function buildSuggestionBox(suggestions) {
        var list = document.createElement('ul'),
            item,
            i = 0;

        if (suggestions.length < 1) {
            return;
        }

        // empty the suggestion box to remove any existing suggestions
        if (suggestionBox.hasChildNodes()) {
            suggestionBox.removeChild(suggestionBox.getElementsByTagName('ul')[0]);
        }
        function makeHoverHandler(index) {
            return function () {
                var items = suggestionBox.getElementsByTagName('li');

                // remove selection class from the existing selected item
                // (including keyboard-selected)
                if (selectedIndex > -1) {
                    items[selectedIndex].className = items[selectedIndex].className.replace(' selected', '');
                }
                items[index].className += ' selected';
                selectedIndex = index;
            };
        }
        function makeUnHoverHandler(item) {
            return function () {
                item.className = item.className.replace(' selected', '');
            };
        }
        function makeClickHandler(item) {
            return function () {
                input.value = item.childNodes[0].nodeValue;
                input.focus();
                suggestionBox.style.display = "none";
                selectedIndex = -1;
            };
        }

        for (i = 0; i < suggestions.length; i++) {
            item = document.createElement('li');
            item.appendChild(document.createTextNode(suggestions[i]));
            item.onmouseover = makeHoverHandler(i);
            item.onmouseout = makeUnHoverHandler(item);
            item.onclick = makeClickHandler(item);
            list.appendChild(item);
        }

        suggestionBox.appendChild(list);
        suggestionBox.style.display = "block";
    }

    function getFilteredItems(text) {
        var i, filteredItems = [];

        for (i = 0; i < self.list.length; i++) {
            if (self.list[i].length >= text.length && self.list[i].toLowerCase().lastIndexOf(text.toLowerCase(), 0) === 0) {
                filteredItems.push(self.list[i]);
            }
        }
        return filteredItems;
    }

    function changeSelection(key) {
        var items = suggestionBox.getElementsByTagName('li'),
            nextIndex;

        if (selectedIndex > -1) {
            items[selectedIndex].className = items[selectedIndex].className.replace(' selected', '');
        }
        if (key === 38) {
            nextIndex = (selectedIndex - 1 >= 0) ? selectedIndex - 1 : items.length - 1;
        } else {
            nextIndex = (selectedIndex + 1 < items.length) ? selectedIndex + 1 : 0;
        }
        items[nextIndex].className += ' selected';
        selectedIndex = nextIndex;
    }

    function makeKeyboardSelection() {
        var items = suggestionBox.getElementsByTagName('li');

        if (selectedIndex > -1) {
            input.value = items[selectedIndex].childNodes[0].nodeValue;
            suggestionBox.style.display = "none";
            selectedIndex = -1;
        }
    }
    
    this.initialize = function () {
        var parent;
        
        html = document.getElementsByTagName('html')[0];
        input = document.getElementById(self.inputID);
        parent = input.parentNode;

        suggestionBox.setAttribute('id', 'suggestion');
        suggestionBox.style.minWidth = (input.offsetWidth - 2) + 'px'; // -2px for border
        suggestionBox.style.left = input.offsetLeft + 'px';
        suggestionBox.style.top = input.offsetTop + input.offsetHeight + 'px';
        parent.insertBefore(suggestionBox, input.nextSibling);

        addEvent(input, 'keydown', function (e) {
            var key = e ? e.keyCode : window.event.keyCode;

            // up arrow and down arrow change the selection in the box
            if (key === 38 || key === 40) {
                buildSuggestionBox(getFilteredItems(input.value)); // show suggestions if they aren't shown
                changeSelection(key);
                return false;
            } else if (key === 13) { // return key should make a selection if the box is open
                makeKeyboardSelection();
                return false;
            } else if (key === 9 || key === 27) { // close box on tab or esc
                suggestionBox.style.display = "none";
            }
        });

        addEvent(input, 'keyup', function (e) {
            var key = e ? e.keyCode : window.event.keyCode,
                invalid = [9, 13, 27, 38, 40], // keys to avoid (tab, enter, esc, arrows)
                i;

            for (i = 0; i < invalid.length; i++) {
                if (key === invalid[i]) {
                    return;
                }
            }
            
            suggestionBox.style.display = "none";
            if (input.value !== null && input.value !== "") {
                buildSuggestionBox(getFilteredItems(input.value));
            }
        });
        
        addEvent(html, 'click', function () {
            suggestionBox.style.display = "none";
        });
    }
}
/*
var menu = new InputSuggestions();
menu.list = ["corn", "beans", "avocado", "mango", "orange", "pear", "peas", "carrots", "milk", "cheese", "blueberries", "cucumbers", "butternut squash"];
menu.inputID = "suggestion";
menu.initialize();
*/
