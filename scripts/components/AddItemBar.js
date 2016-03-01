import React from "react";
import autobind from 'autobind-decorator';

@autobind
class AddItemBar extends React.Component {
  render() {
    return (
      <li className="add-item-bar">
        <div>
          <input type="text" className="add-item-count" ref="add-item-count" />
          <input type="text" className="add-item-name" ref="add-item-name" placeholder="New Item" />
        </div>
      </li>
    )
  }
}

export default AddItemBar;