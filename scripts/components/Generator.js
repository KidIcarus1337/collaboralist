import React from "react";
import Footer from "./Footer";
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

  componentDidMount() {
    window.addEventListener('touchend', this.buttonMouseUp);
    window.addEventListener('mouseup', this.buttonMouseUp);
  }

  generateList() {
    window.removeEventListener('touchend', this.buttonMouseUp);
    window.removeEventListener('mouseup', this.buttonMouseUp);
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
  buttonMouseUp() {
    this.setState({
      buttonPressed: false
    });
  }
  
  render() {
    return (
      <div className="component-wrapper">
        <div className="container generator-container">
          <h1 className="generator-header logo">Collaboralist</h1>
          <p className="generator-desc">A simple web app for online, persistent shopping lists.</p>
          <div className="generator-button unselectable"
               onMouseOver={this.buttonMouseOver}
               onMouseOut={this.buttonMouseOut}
               onMouseDown={this.buttonMouseDown}
               onClick={this.generateList}
               style={{
                  borderColor: this.state.buttonPressed ? "#69898D" : "#73979A",
                  backgroundColor: this.state.buttonPressed ? "#9BCCD0" : this.state.buttonHovered ? "#EFFDFF" : "#f9fffd"
               }}>Generate List</div>
          <div className="generator-divider"></div>
          <h1 className="generator-instruct-header">Nothing To It!</h1>
          <ul className="generator-instruct">
            <li>
              <h2>1 • Create a list</h2>
              <p>This generates a unique URL.</p>
            </li>
            <li>
              <h2>2 • Save your link</h2>
              <p>Make a bookmark of your list to ensure that you never lose it.</p>
            </li>
            <li>
              <h2>3 • Share it</h2>
              <p>Send the link to others to view and edit the list simultaneously.</p>
            </li>
          </ul>
        </div>
        <Footer />
      </div>
    )
  }
}

reactMixin.onClass(Generator, History);

export default Generator;