let utilities = {
  parseEntry(entry) {
    var entryValues = entry.split(" ");
    var filteredValues = entryValues.filter(function(val) {
      return val !== "-" && val !== "";
    });
    var itemCount = !isNaN(filteredValues[0]) ? (filteredValues.splice(0, 1))[0] : 0;
    var formattedValues = filteredValues.map(this.capitalizeValues);
    var itemName = formattedValues !== [] ? formattedValues.join(" ") : null;
    return {itemCount: itemCount, itemName: itemName};
  },

  capitalizeValues(val) {
    return val.charAt(0).toUpperCase() + val.slice(1);
  },

  reformatHistory(history) {
    var newHistory = [];
    Object.keys(history).forEach(function(name) {
      newHistory.push({name: name, count: history[name]});
    });
    return newHistory;
  },

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
  }
};

export default utilities;