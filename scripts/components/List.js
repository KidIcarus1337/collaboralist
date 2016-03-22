import React from "react";
import Item from "./Item"
import AddItemBar from "./AddItemBar";
import SearchSuggestions from "./SearchSuggestions";
import range from 'lodash.range';
import util from "../utilities";
import autobind from 'autobind-decorator';

// Firebase
import Rebase  from "re-base";
var base = Rebase.createClass("https://shopping-list-app-temp.firebaseio.com/");

@autobind
class List extends React.Component {
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
    base.syncState(this.props.params.listId + "/items", {
      context: this,
      state: "items"
    });
    this.setState({
      history: require("../sample-history")
    });
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleReorderUp);
    window.addEventListener('mousemove', this.handleReorderMove);
    window.addEventListener('mouseup', this.handleReorderUp);
  }

  updateItem(key, entry, orderIndex) {
    var parsedEntry = util.parseEntry(entry);
    if (!parsedEntry.itemName) {
      return this.deleteItem(key, orderIndex);
    }
    this.state.items[key].count = parsedEntry.itemCount;
    this.state.items[key].name = parsedEntry.itemName;
    this.setState({items: this.state.items});
  }

  addItem(item) {
    const order = this.state.order.length !== 0 ? this.state.order : range(Object.keys(this.state.items).length);
    order.push(Object.keys(this.state.items).length);
    var timestamp = (new Date()).getTime();
    this.state.items["item-" + timestamp] = item;
    this.setState({
      items: this.state.items,
      order: order
    });
  }

  renderItem(key, orderIndex) {
    return (
      <Item key={key}
            index={key}
            ref={key}
            details={this.state.items[key]}
            items={this.state.items}
            checkItem={this.checkItem}
            updateItem={this.updateItem}
            deleteItem={this.deleteItem}
            autoDelete={this.state.autoDelete}
            mouse={this.state.mouse}
            isPressed={this.state.isPressed}
            order={this.state.order}
            initialOrder={range(Object.keys(this.state.items).length)}
            lastPressed={this.state.lastPressed}
            orderIndex={orderIndex}
            handleReorderStart={this.handleReorderStart}
            onTouchStart={this.handleTouchStart}/>
    )
  }

  checkItem(key) {
    this.state.items[key].checked = !this.state.items[key].checked;
    this.setState({
      items: this.state.items
    });
  }

  deleteItem(key, orderIndex) {
    window.removeEventListener('touchend', this.refs[key].reorderMouseUp);
    window.removeEventListener('mouseup', this.refs[key].reorderMouseUp);
    var order = this.state.order.length !== 0 ? this.state.order : range(Object.keys(this.state.items).length - 1);
    order.splice(order.indexOf(orderIndex), 1);
    var newOrder = order.map(function(index) {
      return index > orderIndex ? index - 1 : index;
    });
    this.state.items[key] = null;
    this.setState({
      items: this.state.items
    });
    this.setState({
      order: newOrder
    });
  }

  handleTouchStart(event, key, pressLocation) {
    this.handleReorderStart(event.touches[0], key, pressLocation);
  }

  handleTouchMove(event) {
    event.preventDefault();
    this.handleReorderMove(event.touches[0]);
  }

  handleReorderStart(event, pos, pressY) {
    var mySheet = document.styleSheets[0];
    var firstRule = mySheet.cssRules ? mySheet.cssRules[0] : mySheet.rules[0];
    firstRule.style.setProperty("cursor", "grabbing", "important");
    firstRule.style.setProperty("cursor", "-moz-grabbing", "important");
    firstRule.style.setProperty("cursor", "-webkit-grabbing", "important");
    this.setState({
      delta: event.pageY - pressY,
      mouse: pressY,
      isPressed: true,
      lastPressed: pos
    });
  }

  handleReorderMove(event) {
    var isPressed = this.state.isPressed;
    var delta = this.state.delta;
    var order = this.state.order.length !== 0 ? this.state.order : range(Object.keys(this.state.items).length);
    var lastPressed = this.state.lastPressed;
    if (isPressed) {
      var mouse = event.pageY - delta;
      var row = util.clamp(Math.round(mouse / 50), 0, Object.keys(this.state.items).length - 1);
      var newOrder = util.reinsert(order, order.indexOf(lastPressed), row);
      this.setState({
        mouse: mouse,
        order: newOrder
      });
    }
  }

  handleReorderUp() {
    if (this.state.isPressed) {
      window.getSelection().removeAllRanges();
    }
    var mySheet = document.styleSheets[0];
    var firstRule = mySheet.cssRules ? mySheet.cssRules[0] : mySheet.rules[0];
    firstRule.style.cssText = null;
    this.setState({
      isPressed: false,
      delta: 0
    });
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