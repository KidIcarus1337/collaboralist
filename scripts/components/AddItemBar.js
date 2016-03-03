import React from "react";
import Fuse from "fuse.js";
import autobind from 'autobind-decorator';

@autobind
class AddItemBar extends React.Component {
  parseEntry() {
    var entryValues = (this.refs.addItem.value).split(" ");
    var itemCount = isNaN(entryValues[0]) ? "" : entryValues.splice(0, 1);
    var searchParameter = entryValues.join(" ");
    return {itemCount: itemCount, searchParameter: searchParameter};
  }

  handleOnChange() {
    var parsedEntry = this.parseEntry();
  }

  handleSubmit(event) {
    event.preventDefault();
    var parsedEntry = this.parseEntry();
    var item = {
      name: parsedEntry.searchParameter,
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