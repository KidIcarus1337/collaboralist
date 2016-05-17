import React from "react";
import Item from "./Item"
import AddItemBar from "./AddItemBar";
import SearchSuggestions from "./SearchSuggestions";
import Footer from "./Footer";
import range from 'lodash.range';
import util from "../utilities";
import autobind from 'autobind-decorator';

// Firebase
import Rebase from "re-base";
var base = Rebase.createClass("https://collaboralist.firebaseio.com/");

var deleteTimeout;
var deleteList = [];
const orderPlaceholder = 999999999999999;
var scrollInterval;
const scrollBuffer = 80;
const scrollSpeed = 0.2;
var touchY;
var scrollPosition;
var windowHeight;
var docHeight;

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
      listEmpty: true,
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
    var order = this.state.firebase.order;
    base.syncState(this.props.listId, {
      context: this,
      state: "firebase",
      then: function() {
        if (Object.keys(this.state.firebase.items).length > 1) {
          order[orderPlaceholder] = null;
          this.setState({
            firebase: {items: {placeholder: null}, order: order}
          });
          this.setState({
            listEmpty: false
          });
        }
        this.setState({
          loaded: true
        });
        if (Object.keys(this.state.firebase.history).length > 1) {
          this.setState({
            firebase: {history: {placeholder: null}}
          });
        }
      }
    });
    order[orderPlaceholder] = orderPlaceholder;
    this.setState({
      firebase: {items: {placeholder: true}, history: {placeholder: true}, order: order}
    });
    window.addEventListener('touchmove', this.handleTouchMove);
    window.addEventListener('touchend', this.handleReorderUp);
    window.addEventListener('mousemove', this.handleReorderMove);
    window.addEventListener('mouseup', this.handleReorderUp);
  }
  
  componentWillUnmount() {
    window.removeEventListener('touchmove', this.handleTouchMove);
    window.removeEventListener('touchend', this.handleReorderUp);
    window.removeEventListener('mousemove', this.handleReorderMove);
    window.removeEventListener('mouseup', this.handleReorderUp);
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
    var history = this.state.firebase.history;
    var timestamp = (new Date()).getTime();
    items["item-" + timestamp] = item;
    var itemsCount = Object.keys(items).length - 1;
    if (this.state.listEmpty) {
      items["placeholder"] = null;
      order[orderPlaceholder] = null;
      itemsCount--;
      this.setState({
        listEmpty: false
      });
    }
    order[itemsCount] = itemsCount;
    var itemName = item.name;
    history[itemName] = history.hasOwnProperty(itemName) ? history[itemName] + 1 : 1;
    if (history.hasOwnProperty("placeholder")) {
      history["placeholder"] = null;
    }
    this.setState({
      firebase: {items: items, order: order, history: history}
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
            handleTouchStart={this.handleTouchStart}/>
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
      deleteList.map(function(obj, index) {
        var currentOrderInd = obj.orderIndex;
        self.deleteItem(obj.key, currentOrderInd);
        for (var i = index; i < deleteList.length; i++) {
          if (deleteList[i].orderIndex > currentOrderInd) {
            deleteList[i].orderIndex--;
          }
        }
      });
      deleteList = [];
    }, 1600);
  }

  deleteItem(key, orderIndex) {
    var items = this.state.firebase.items;
    var order = this.state.firebase.order;
    order.splice(order.indexOf(orderIndex), 1);
    var newOrder = order.map(function(index) {
      return index > orderIndex ? index - 1 : index;
    });
    if (Object.keys(items).length - 1 == 0) {
      this.setState({
        listEmpty: true
      });
      items["placeholder"] = true;
      newOrder[orderPlaceholder] = orderPlaceholder;
    }
    items[key] = null;
    order = newOrder;
    this.setState({
      firebase: {items: items, order: order}
    });
  }

  handleTouchStart(event, key, pressLocation) {
    this.initAutoScroll();
    scrollInterval = setInterval(this.autoScroll, 20);
    this.handleReorderStart(event.touches[0], key, pressLocation);
  }

  handleTouchMove(event) {
    if (this.state.isPressed) {
      event.preventDefault();
      this.handleReorderMove(event.touches[0]);
    }
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

  initAutoScroll() {
    touchY = -1;
    windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    docHeight = util.getDocHeight() - windowHeight;
  }

  autoScroll() {
    var scrollChange = 0;
    scrollPosition = window.scrollY;
    if (touchY >= 0 && touchY < scrollPosition + scrollBuffer) {
      scrollChange = touchY - (scrollPosition + scrollBuffer);
    } else if (touchY >=0 && touchY > windowHeight + scrollPosition - scrollBuffer) {
      scrollChange = touchY - (windowHeight + scrollPosition - scrollBuffer);
    }
    if (scrollChange !== 0) {
      var newScroll = scrollPosition + scrollSpeed * scrollChange;
      if (newScroll < 0) {
        newScroll = 0;
      } else if (newScroll > docHeight) {
        newScroll = docHeight;
      }
      window.scrollTo(0, newScroll);
    }
  }

  handleReorderMove(event) {
    var isPressed = this.state.isPressed;
    var delta = this.state.delta;
    var items = this.state.firebase.items;
    var order = this.state.firebase.order;
    var lastPressed = this.state.lastPressed;
    touchY = event.pageY;
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
    clearInterval(scrollInterval);
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
    var items = !(this.state.listEmpty) ? this.state.firebase.items : {};
    return (
      <div className="container">
        <h1 className="list-header unselectable">{this.state.name}</h1>
        <div className="list-dashboard">
          {/*<div className="reference-drawer"></div>*/}
          <div className="list-container">
            <div className="loading-container"
                 style={{display: this.state.loaded ? "none" : "block"}}>
              <div className="loading-spinner"></div>
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
        <Footer />
      </div>
    )
  }
}

export default List;