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

var deleteTimeout;
var deleteList = [];

@autobind
class List extends React.Component {
  constructor() {
    super();

    this.state = {
      name: "List",
      firebase: {
        items: {},
        history: {},
        order: {}
      },
      loaded: false,
      suggestions: [],
      highlightIndex: 0,
      suggestionsHover: false,
      autoDelete: true,
      delta: 0,
      mouse: 0,
      isPressed: false,
      lastPressed: 0
    }
  }

  componentDidMount() {
    base.syncState(this.props.params.listId, {
      context: this,
      state: "firebase",
      then: function() {
        if (Object.keys(this.state.firebase.items).length > 1) {
          this.setState({
            firebase: {items: {placeholder: null}, order: {placeholder: null}}
          });
        } else {
          this.setState({
            firebase: {order: {0: 0, placeholder: null}}
          });
        }
        this.setState({
          loaded: true
        });
      }
    });
    this.setState({
      firebase: {items: {placeholder: true}, history: require("../sample-history"), order: {placeholder: true}}
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
    this.state.firebase.items[key].count = parsedEntry.itemCount;
    this.state.firebase.items[key].name = parsedEntry.itemName;
    this.setState({
      firebase: {items: this.state.firebase.items}
    });
  }

  addItem(item) {
    var items = this.state.firebase.items;
    var order = this.state.firebase.order;
    var timestamp = (new Date()).getTime();
    items["item-" + timestamp] = item;
    if ("placeholder" in items) {
      items["placeholder"] = null;
    } else {
      order.push(Object.keys(items).length - 1);
    }
    this.setState({
      firebase: {items: items, order: order}
    });
  }

  renderItem(key, orderIndex) {
    if (key == 0) {
      return;
    }
    return (
      <Item key={key}
            index={key}
            ref={key}
            details={this.state.firebase.items[key]}
            items={this.state.firebase.items}
            checkItem={this.checkItem}
            updateItem={this.updateItem}
            setDelete={this.setDelete}
            autoDelete={this.state.autoDelete}
            mouse={this.state.mouse}
            isPressed={this.state.isPressed}
            order={this.state.firebase.order}
            initialOrder={range(Object.keys(this.state.firebase.items).length)}
            lastPressed={this.state.lastPressed}
            orderIndex={orderIndex}
            handleReorderStart={this.handleReorderStart}
            onTouchStart={this.handleTouchStart}/>
    )
  }

  checkItem(key) {
    this.state.firebase.items[key].checked = !this.state.firebase.items[key].checked;
    this.setState({
      firebase: {items: this.state.firebase.items}
    });
  }

  setDelete(key, orderIndex) {
    clearTimeout(deleteTimeout);
    deleteList.push({key: key, orderIndex: orderIndex});
    var self = this;
    deleteTimeout = setTimeout(function() {
      deleteList.map(function(obj) {
        var currentOrderInd = obj.orderIndex;
        self.deleteItem(obj.key, currentOrderInd);
        deleteList.forEach(function(i) {
          if (i.orderIndex > currentOrderInd) {
            i.orderIndex--;
          }
        });
      });
      deleteList = [];
    }, 1600);
  }

  deleteItem(key, orderIndex) {
    window.removeEventListener('touchend', this.refs[key].reorderMouseUp);
    window.removeEventListener('mouseup', this.refs[key].reorderMouseUp);
    var items = this.state.firebase.items;
    var order = this.state.firebase.order;
    order.splice(order.indexOf(orderIndex), 1);
    var newOrder = order.map(function(index) {
      return index > orderIndex ? index - 1 : index;
    });
    if (Object.keys(items).length - 1 == 0) {
      items["placeholder"] = true;
      newOrder = {"placeholder": true};
    }
    items[key] = null;
    order = newOrder;
    this.setState({
      firebase: {items: items, order: order}
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
    var items = this.state.firebase.items;
    var order = this.state.firebase.order;
    var lastPressed = this.state.lastPressed;
    if (isPressed) {
      var mouse = event.pageY - delta;
      var row = util.clamp(Math.round(mouse / 50), 0, Object.keys(items).length - 1);
      var newOrder = util.reinsert(order, order.indexOf(lastPressed), row);
      this.setState({
        mouse: mouse
      });
      this.setState({
        firebase: {order: newOrder}
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
    console.log(this.state.firebase.items);
    var items = this.state.firebase.items != "placeholder" ? this.state.firebase.items : {};
    return (
      <div className="container">
        <h1 className="list-header unselectable">{this.state.name}</h1>
        <div className="list-dashboard">
          {/*<div className="reference-drawer"></div>*/}
          <div className="list-container">
            <div className="loading-container"
                 style={{display: this.state.loaded ? "none" : "block"}}>
              <div className="loading-space"
                   dangerouslySetInnerHTML={
                     { __html: `<svg version="1.1"
                                     id="loader-1"
                                     xmlns="http://www.w3.org/2000/svg"
                                     xmlns:xlink="http://www.w3.org/1999/xlink"
                                     x="0px"
                                     y="0px"
                                     viewBox="0 0 50 50"
                                     style="enable-background:new 0 0 50 50;"
                                     xml:space="preserve">
                                  <path fill="#FFE6C2"
                                        d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,
                                           0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,
                                           14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
                                    <animateTransform attributeType="xml"
                                      attributeName="transform"
                                      type="rotate"
                                      from="0 25 25"
                                      to="360 25 25"
                                      dur="0.5s"
                                      repeatCount="indefinite"/>
                                  </path>
                                </svg>`
                     }
                   }
              ></div>
            </div>
            <div className="list"
                 style={{display: this.state.loaded ? "block" : "none"}}>
              <ul>
                {Object.keys(items).map(this.renderItem)}
                <AddItemBar ref="addItemBar"
                            addItem={this.addItem}
                            history={this.state.firebase.history}
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