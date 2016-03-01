import React from "react";
import autobind from 'autobind-decorator';

@autobind
class AddItemBar extends React.Component {
  render() {
    return (
      <li className="add-item-bar">
        <div>
          <div className="add-item-count">
            <input type="text" ref="add-item-count" />
          </div>
          <div className="add-item-name">
            <input type="text" ref="add-item-name" />
          </div>
        </div>
      </li>
    )
  }
}

export default AddItemBar;