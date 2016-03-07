import React from "react";
import Fuse from "fuse.js";
import util from "../utilities";
import autobind from 'autobind-decorator';

@autobind
class AddItemBar extends React.Component {
  handleOnChange() {
    var parsedEntry = util.parseEntry(this.refs.addItem.value);
    var fuse = new Fuse(this.props.history, {keys: ["name"], id: "name"});
    var suggestions = fuse.search(parsedEntry.itemName);
    this.props.populateSuggestions(suggestions);
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
  }

  render() {
    return (
      <li className="add-item-bar">
        <form onSubmit={this.handleSubmit}>
          <input className="add-item"
                 onChange={this.handleOnChange}
                 type="text"
                 ref="addItem"
                 placeholder="New Item" />
        </form>
      </li>
    )
  }
}

export default AddItemBar;