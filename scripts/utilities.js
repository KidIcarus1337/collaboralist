let utilities = {
  parseEntry(entry) {
    var entryValues = entry.split(" ");
    var filteredValues = entryValues.filter(function(val) {
      return val !== "-" && val !== "";
    });
    var itemCount = !isNaN(filteredValues[0]) ? filteredValues.splice(0, 1) : null;
    var formattedValues = filteredValues.map(this.capitalizeValues);
    var itemName = formattedValues !== [] ? formattedValues.join(" ") : null;
    return {itemCount: itemCount, itemName: itemName};
  },

  capitalizeValues(val){
    return val.charAt(0).toUpperCase() + val.slice(1);
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
}
};

export default utilities;