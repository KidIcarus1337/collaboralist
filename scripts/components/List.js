import React from "react";
import Item from "./Item"
import AddItemBar from "./AddItemBar";
import SearchSuggestions from "./SearchSuggestions";
import range from 'lodash.range';
import util from "../utilities";
import autobind from 'autobind-decorator';

@autobind
class List extends React.Component{
  constructor() {
    super();

    this.state = {
      name: "List",
      items: {},
      history: {},
      suggestions: [],
      highlightIndex: 0,
      suggestionsHover: false,
      autoDelete: true,
      delta: 0,
      mouse: 0,
      isPressed: false,
      lastPressed: 0,
      order: []
    }
  }

  componentDidMount() {
    this.setState({
      items: require("../sample-items"),
      history: require("../sample-history")
    });
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleMouseUp);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  }

  updateItem(key, entry) {
    var parsedEntry = util.parseEntry(entry);
    if (!parsedEntry.itemName) {
      return this.deleteItem(key);
    }
    this.state.items[key].count = parsedEntry.itemCount;
    this.state.items[key].name = parsedEntry.itemName;
    this.setState({items: this.state.items});
  }

  addItem(item) {
    var timestamp = (new Date()).getTime();
    this.state.items["item-" + timestamp] = item;
    this.setState({items: this.state.items});
  }

  renderItem(key, index) {
    return (
      <Item key={key}
            index={key}
            details={this.state.items[key]}
            checkItem={this.checkItem}
            updateItem={this.updateItem}
            deleteItem={this.deleteItem}
            autoDelete={this.state.autoDelete}
            mouse={this.state.mouse}
            isPressed={this.state.isPressed}
            order={this.state.order}
            initialOrder={range(this.state.items.length)}
            lastPressed={this.state.lastPressed}
            orderIndex={index}
            onMouseDown={this.handleMouseDown}
            onTouchStart={this.handleTouchStart}/>
    )
  }

  checkItem(key) {
    this.state.items[key].checked = !this.state.items[key].checked;
    this.setState({
      items: this.state.items
    });
  }

  deleteItem(key) {
    delete this.state.items[key];
    this.setState({
      items: this.state.items
    });
  }

  handleTouchStart(key, pressLocation, e) {
    this.handleMouseDown(key, pressLocation, e.touches[0]);
  }

  handleTouchMove(e) {
    e.preventDefault();
    this.handleMouseMove(e.touches[0]);
  }

  handleMouseDown(event, pos, pressY) {
    if (!this.state.order) {
      this.setState({
        order: range(this.state.items.length)
      });
    }
    console.log(this.state.order);
    this.setState({
      delta: event.pageY - pressY,
      mouse: pressY,
      isPressed: true,
      lastPressed: pos
    });
  }

  handleMouseMove(event) {
    const isPressed = this.state.isPressed;
    const delta = this.state.delta;
    const order = this.state.order;
    const lastPressed = this.state.lastPressed;
    if (isPressed) {
      const mouse = event.pageY - delta;
      const row = util.clamp(Math.round(mouse / 50), 0, this.state.items.length - 1);
      const newOrder = util.reinsert(order, order.indexOf(lastPressed), row);
      this.setState({
        mouse: mouse,
        order: newOrder
      });
    }
  }

  handleMouseUp() {
    this.setState({isPressed: false, delta: 0});
  }

  populateSuggestions(suggestions) {
    this.state.suggestions = suggestions;
    this.setState({
      suggestions: this.state.suggestions
    });
  }

  changeHighlightIndex(index) {
    this.setState({
      highlightIndex: index
    });
  }

  suggestionsMouseOver() {
    this.setState({
      suggestionsHover: true
    });
  }

  suggestionsMouseOut() {
    this.setState({
      suggestionsHover: false
    });
  }

  suggestionSubmit(index) {
    this.refs.addItemBar.suggestionSubmit(index);
  }

  render() {
    return (
      <div className="container">
        <h1 className="list-header unselectable">{this.state.name}</h1>
        <div className="list-dashboard">
          {/*<div className="reference-drawer"></div>*/}
          <div className="list-container">
            <div className="list">
              <ul>
                {Object.keys(this.state.items).map(this.renderItem)}
                <AddItemBar ref="addItemBar"
                            addItem={this.addItem}
                            history={this.state.history}
                            suggestions={this.state.suggestions}
                            highlightIndex={this.state.highlightIndex}
                            suggestionsHover={this.state.suggestionsHover}
                            changeHighlightIndex={this.changeHighlightIndex}
                            populateSuggestions={this.populateSuggestions} />
              </ul>
              <SearchSuggestions suggestionsMouseOver={this.suggestionsMouseOver}
                                 suggestionsMouseOut={this.suggestionsMouseOut}
                                 suggestions={this.state.suggestions}
                                 highlightIndex={this.state.highlightIndex}
                                 changeHighlightIndex={this.changeHighlightIndex}
                                 suggestionSubmit={this.suggestionSubmit} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default List;