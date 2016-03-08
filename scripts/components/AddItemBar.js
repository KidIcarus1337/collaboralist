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
    var addItem = this.refs.addItem;
    var parsedEntry = util.parseEntry(addItem.value);
    var fuse = new Fuse(this.props.history, {keys: ["name"], id: "name"});
    var suggestions = fuse.search(parsedEntry.itemName);
    this.props.populateSuggestions(suggestions);
    var countSpace = !parsedEntry.itemCount ? 0 : parsedEntry.itemCount.toString().length + 1;
    if (suggestions.length !== 0 &&
        !this.state.deletePressed &&
        event.target.value.substring(countSpace, event.target.value.length).toLowerCase() === suggestions[0].substring(0, event.target.value.length - countSpace).toLowerCase()) {
      var selectionStart = addItem.value.length;
      var selectionEnd = suggestions[0].length + countSpace;
      addItem.value = addItem.value.substring(0, countSpace) + suggestions[0];
      util.setInputSelection(addItem, selectionStart, selectionEnd);
    } else {
      addItem.value = event.target.value;
    }
  }

  handleOnKeyDown(event) {
    this.setState({
      deletePressed: !(event.which !== 8 && event.which !== 46)
    });
  }

  handleOnBlur() {
    this.props.populateSuggestions([]);
  }

  handleSubmit(event) {
    event.preventDefault();
    var parsedEntry = util.parseEntry(this.refs.addItem.value);
    if (!parsedEntry.itemName) {
      return;
    }
    var item = {
      name: parsedEntry.itemName,
      count: parsedEntry.itemCount,
      checked: false
    };
    this.props.addItem(item);
    this.refs.addItem.value = "";
    this.props.populateSuggestions([]);
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