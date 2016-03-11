import React from "react";
import Fuse from "fuse.js";
import util from "../utilities";
import autobind from 'autobind-decorator';

@autobind
class AddItemBar extends React.Component {
  constructor() {
    super();

    this.state = {
      deletePressed: false
    }
  }

  handleOnChange(event) {
    var addItemInput = this.refs.addItem;
    var parsedEntry = util.parseEntry(addItemInput.value);
    var fuse = new Fuse(this.props.history, {keys: ["name"], id: "name"});
    var suggestions = fuse.search(parsedEntry.itemName);
    this.props.populateSuggestions(suggestions);
    var countSpace = !parsedEntry.itemCount ? 0 : parsedEntry.itemCount.toString().length + 1;
    if (suggestions.length !== 0 &&
        !this.state.deletePressed &&
        event.target.value.substring(countSpace, event.target.value.length).toLowerCase() === suggestions[0].substring(0, event.target.value.length - countSpace).toLowerCase()) {
      var selectionStart = addItemInput.value.length;
      var selectionEnd = suggestions[0].length + countSpace;
      addItemInput.value = addItemInput.value.substring(0, countSpace) + suggestions[0];
      util.setInputSelection(addItemInput, selectionStart, selectionEnd);
      this.props.changeHighlightIndex(0);
    } else {
      this.props.changeHighlightIndex(-1);
    }
  }

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
    if (event.which === 40 && suggestions.length !== 0) {
      newIndex = highlightIndex === suggestions.length - 1 ? 0 : highlightIndex + 1;
      this.props.changeHighlightIndex(newIndex);
      addItemInput.value = addItemInput.value.substring(0, countSpace) + suggestions[newIndex];
    } else if (event.which === 38 && suggestions.length !== 0) {
      newIndex = highlightIndex === 0 || highlightIndex === -1 ? suggestions.length - 1 : highlightIndex - 1;
      this.props.changeHighlightIndex(newIndex);
      addItemInput.value = addItemInput.value.substring(0, countSpace) + suggestions[newIndex];
      setTimeout(function () {
        util.setInputSelection(addItemInput, addItemInput.value.length, addItemInput.value.length);
      }, 0);
    }
  }

  handleOnBlur() {
    if (!this.props.suggestionsHover) {
      this.props.populateSuggestions([]);
    }
  }

  submitItem(parsedEntry) {
    var item = {
      name: parsedEntry.itemName,
      count: parsedEntry.itemCount,
      checked: false
    };
    this.props.addItem(item);
    this.refs.addItem.value = "";
    this.props.populateSuggestions([]);
  }

  handleSubmit(event) {
    event.preventDefault();
    var parsedEntry = util.parseEntry(this.refs.addItem.value);
    if (!parsedEntry.itemName) {
      return;
    }
    this.submitItem(parsedEntry);
  }

  suggestionSubmit(index) {
    var addItemInput = this.refs.addItem;
    var suggestions = this.props.suggestions;
    var parsedEntry = util.parseEntry(addItemInput.value);
    var countSpace = !parsedEntry.itemCount ? 0 : parsedEntry.itemCount.toString().length + 1;
    addItemInput.value = addItemInput.value.substring(0, countSpace) + suggestions[index];
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