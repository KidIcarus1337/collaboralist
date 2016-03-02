import React from "react";
import Item from "./Item"
import AddItemBar from "./AddItemBar"
import util from "../utilities";
import autobind from 'autobind-decorator';

@autobind
class List extends React.Component{
  constructor() {
    super();

    this.state = {
      items: {}
    }
  }

  componentDidMount() {
    this.setState({
      items: require("../sample-items")
    });
  }

  addItem(item) {
    var timestamp = (new Date()).getTime();
    this.state.items["item-" + timestamp] = item;
    this.setState({items: this.state.items});
  }

  renderItem(key) {
    return (
      <Item key={key} index={key} details={this.state.items[key]} checkItem={this.checkItem} />
    )
  }

  checkItem(key) {
    this.state.items[key].checked = !this.state.items[key].checked;
    this.setState({
      items: this.state.items
    });
  }

  render() {
    return (
      <div className="container">
        <h1 className="list-header unselectable">List</h1>
        <div className="list-dashboard">
          {/*<div className="reference-drawer"></div>*/}
          <div className="list-container">
            <div className="list">
              <ul>
                {Object.keys(this.state.items).map(this.renderItem)}
                <AddItemBar />
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default List;