let utilities = {

  // Generate new UUID
  generateUUID() {
    var dateTime = new Date().getTime();
    var UUID = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var random = (dateTime + Math.random() * 16) % 16 | 0;
      dateTime = Math.floor(dateTime / 16);
      return (c == "x" ? random : (random&0x3|0x8)).toString(16);
    });
    return UUID;
  },

  // Parse text to separate an item's name and amount
  parseEntry(entry) {
    var entryValues = entry.split(" "); // Separate at spaces

    // Remove dashes and extended white space
    var filteredValues = entryValues.filter(function(val) {
      return val !== "-" && val !== "";
    });

    // If first item in filteredValues is a number, set item's amount to that value; otherwise, 0
    var itemCount = !isNaN(filteredValues[0]) ? (filteredValues.splice(0, 1))[0] : 0;

    var formattedValues = filteredValues.map(this.capitalize); // Capitalize first letter of every word
    var itemName = formattedValues !== [] ? formattedValues.join(" ") : null; // Combine words into one variable
    return {itemCount: itemCount, itemName: itemName};
  },

  // Capitalize first letter of word
  capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  },

  // Take history object from state and reformat it into a configuration that fuse.js can utilize
  reformatHistory(history) {
    var newHistory = [];

    // Remove placeholder if it exists
    if (history.hasOwnProperty("placeholder")) {
      delete history["placeholder"];
    }

    Object.keys(history).map(function(name) {
      newHistory.push({name: name, count: history[name]});
    });
    return newHistory;
  },

  // Set a selection range for the input field in addItemBar; primarily used for the autofill functionality
  setInputSelection(input, startPos, endPos) {
    input.focus();
    if (typeof input.selectionStart != "undefined") {
      input.selectionStart = startPos;
      input.selectionEnd = endPos;
    } else if (document.selection && document.selection.createRange) {
      // IE branch
      input.select();
      var range = document.selection.createRange();
      range.collapse(true);
      range.moveEnd("character", endPos);
      range.moveStart("character", startPos);
      range.select();
    }
  },

  reinsert(arr, from, to) {
    const _arr = arr.slice(0);
    const val = _arr[from];
    _arr.splice(from, 1);
    _arr.splice(to, 0, val);
    return _arr;
  },
  
  clamp(n, min, max) {
    return Math.max(Math.min(n, max), min);
  },

  // Retrieve the current height of the entire page
  getDocHeight() {
    return Math.max(
      document.documentElement.clientHeight,
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
  }
};

export default utilities;