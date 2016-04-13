import React from "react";
import { History } from 'react-router';
import reactMixin from 'react-mixin';
import util from "../utilities";
import autobind from 'autobind-decorator';

@autobind
class Generator extends React.Component {
  constructor() {
    super();

    this.state = {
      buttonHovered: false,
      buttonPressed: false
    }
  }

  generateList() {
    var UUID = util.generateUUID();
    this.history.pushState(null, '/list/' + UUID);
  }
  
  buttonMouseOver() {
    this.setState({
      buttonHovered: true
    });
  }
  buttonMouseOut() {
    this.setState({
      buttonHovered: false
    });
  }
  buttonMouseDown() {
    this.setState({
      buttonPressed: true
    });
  }
  
  render() {
    return (
      <div className="container">
        <h1 className="generator-header">Shopping List App</h1>
        <p className="generator-desc">Generate a new list to get started! Save the link as a bookmark for future reference or share it with others
        for <span>jolly collaboration</span>!</p>
        <div className="divider"></div>
        <div className="generator-button"
             onMouseOver={this.buttonMouseOver}
             onMouseOut={this.buttonMouseOut}
             onMouseDown={this.buttonMouseDown}
             style={{
                borderColor: this.state.buttonPressed ? "#84adb1" : "#73979A",
                backgroundColor: this.state.buttonHovered ? "#9BCCD0" : this.state.buttonPressed ? "#DFF5FF" : "#f9fffd"
             }}>Generate List</div>
      </div>
    )
  }
}

reactMixin.onClass(Generator, History);

export default Generator;