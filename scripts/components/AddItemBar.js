import React from "react";
import Fuse from "fuse.js";
import util from "../utilities";
import autobind from "autobind-decorator";

@autobind
class AddItemBar extends React.Component {
  constructor() {
    super();

    this.state = {
      deletePressed: false // Boolean used to prevent autofilling functionality being applied when deleting input text
    }
  }

  // Handler for whenever the input text changes
  handleOnChange(event) {
    var addItemInput = this.refs.addItem;
    var parsedEntry = util.parseEntry(addItemInput.value); // Parse input text

    // Retrieve history from state and reformat it in a way that fuse.js can use it
    var history = JSON.parse(JSON.stringify(this.props.history));
    history = util.reformatHistory(history);
    var fuse = new Fuse(history, {keys: ["name"], id: "name"});

    var suggestions = fuse.search(parsedEntry.itemName); // Perform fuse search on parsed name
    this.props.populateSuggestions(suggestions); // Populate suggestions state with search results
    var countSpace = !parsedEntry.itemCount ? 0 : parsedEntry.itemCount.toString().length + 1; // Account for amount entered when autofilling
    if (suggestions.length !== 0 &&
        !this.state.deletePressed &&
        event.target.value.substring(countSpace, event.target.value.length).toLowerCase() === suggestions[0].substring(0, event.target.value.length - countSpace).toLowerCase()) {

      // Define beginning and ending indices for the autofill text selection
      var selectionStart = addItemInput.value.length;
      var selectionEnd = suggestions[0].length + countSpace;

      addItemInput.value = addItemInput.value.substring(0, countSpace) + suggestions[0]; // Set input text name to top suggestion
      util.setInputSelection(addItemInput, selectionStart, selectionEnd); // Select the autofill text
      this.props.changeHighlightIndex(0); // Highlight top suggestion
    } else {
      this.props.changeHighlightIndex(-1); // No suggestions to highlight
    }
  }

  // Handler for typing in the input
  handleOnKeyDown(event) {
    this.setState({
      deletePressed: !(event.which !== 8 && event.which !== 46)
    });
    var addItemInput = this.refs.addItem;
    var parsedEntry = util.parseEntry(addItemInput.value);
    var countSpace = !parsedEntry.itemCount ? 0 : parsedEntry.itemCount.toString().length + 1;
    var highlightIndex = this.props.highlightIndex;
    var suggestions = this.props.suggestions;
    var newIndex;

    // If down arrow key pressed, select the next suggestion
    if (event.which === 40 && suggestions.length !== 0) {
      newIndex = highlightIndex === suggestions.length - 1 ? 0 : highlightIndex + 1; // Calculate new highlight index
      this.props.changeHighlightIndex(newIndex); // Apply new highlight index
      addItemInput.value = addItemInput.value.substring(0, countSpace) + suggestions[newIndex]; // Update input text name

    // If up arrow key pressed, select the previous suggestion
    } else if (event.which === 38 && suggestions.length !== 0) {
      event.preventDefault(); // Prevent input cursor being set to the beginning of the text
      newIndex = highlightIndex === 0 || highlightIndex === -1 ? suggestions.length - 1 : highlightIndex - 1; // Calculate new highlight index
      this.props.changeHighlightIndex(newIndex); // Apply new highlight index
      addItemInput.value = addItemInput.value.substring(0, countSpace) + suggestions[newIndex]; // Update input text name
    }
  }

  // Handler for removing suggestions upon losing focus on the input
  handleOnBlur() {
    if (!this.props.suggestionsHover) {
      this.props.populateSuggestions([]);
    }
  }

  // Handler for submitting a new item
  submitItem(parsedEntry) {
    var item = {
      name: parsedEntry.itemName,
      count: parsedEntry.itemCount,
      checked: false
    };
    this.props.addItem(item);
    this.refs.addItem.value = ""; // Clear the input field
    this.props.populateSuggestions([]); // Remove suggestions
  }

  // Handler for submitting a new item via the input
  handleSubmit(event) {
    event.preventDefault();
    var parsedEntry = util.parseEntry(this.refs.addItem.value);

    // Do nothing if there's no item name
    if (!parsedEntry.itemName) {
      return;
    }

    this.submitItem(parsedEntry);
  }

  // Handler for submitting a new item via a suggestion selection
  suggestionSubmit(index) {
    var addItemInput = this.refs.addItem;
    var suggestions = this.props.suggestions;
    var parsedEntry = util.parseEntry(addItemInput.value);
    var countSpace = !parsedEntry.itemCount ? 0 : parsedEntry.itemCount.toString().length + 1;
    addItemInput.value = addItemInput.value.substring(0, countSpace) + suggestions[index]; // Set input text name value to selected suggestion
    parsedEntry = util.parseEntry(addItemInput.value);
    this.submitItem(parsedEntry);
  }

  render() {
    return (
      <li className="add-item-bar">
        <form onSubmit={this.handleSubmit}>
          <input className="add-item"
                 onChange={this.handleOnChange}
                 onKeyDown={this.handleOnKeyDown}
                 onBlur={this.handleOnBlur}
                 type="text"
                 ref="addItem"
                 placeholder="New Item" />
        </form>
      </li>
    )
  }
}

export default AddItemBar;