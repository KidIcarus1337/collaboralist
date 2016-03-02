import React from "react";
import {Motion, spring} from 'react-motion';
import autobind from 'autobind-decorator';

@autobind
class AddItemBar extends React.Component {
  handleOnChange() {
    var entryValues = (this.refs.addItem.value).split(" ");
    if (!isNaN(entryValues[0])) {
      entryValues.shift();
      var searchParameter = entryValues.join(" ");
      console.log(searchParameter);
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    alert("blah");
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