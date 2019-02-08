import React from "react";
import Item from "./Item"
import AddItemBar from "./AddItemBar";
import SearchSuggestions from "./SearchSuggestions";
import Footer from "./Footer";
import range from "lodash.range";
import util from "../utilities";
import autobind from "autobind-decorator";

// Firebase
var Rebase = require('re-base');
var firebase = require('firebase');
var app = firebase.initializeApp({
  apiKey: 'AIzaSyA3nsfQnNLjz9UcSA_t9DprLLZYLJFAAUg',
  authDomain: 'collaboralist-d55a9.firebaseapp.com',
  databaseURL: 'https://collaboralist-d55a9.firebaseio.com',
  projectId: "collaboralist-d55a9",
  storageBucket: 'collaboralist-d55a9.appspot.com',
  messagingSenderId: '584259612243'
});
var base = Rebase.createClass(app.database());

// import Rebase from "re-base";
// var base = Rebase.createClass("https://collaboralist-d55a9.firebaseio.com");

var deleteTimeout;
var deleteList = [];
const orderPlaceholder = 999999999999999; // Placeholder used to set the "order" state in Firebase with a non-empty value
var scrollInterval;
const scrollBuffer = 80; // The range in pixels from the top/bottom that the cursor needs to be within to trigger scrolling with an item
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

      // Separate object for Firebase since re-base can only be synced with one state object at a time.
      firebase: {
        items: {},
        history: {},
        order: {} // Object used in logic for reordering items in list
      },

      listEmpty: true, // Boolean used to keep React from attempting to render placeholders
      loaded: false,
      suggestions: [],
      highlightIndex: 0,
      suggestionsHover: false,
      autoDelete: true,
      delta: 0, // Difference between current cursor position and starting cursor position used in the logic for reordering items
      mouse: 0, // Cursor position used in the reordering logic
      isPressed: false,
      lastPressed: 0
    }
  }

  componentDidMount() {
    var order = this.state.firebase.order;

    // Sync with Firebase
    base.syncState(this.props.listId, {
      context: this,
      state: "firebase",
      then: function() {

        // If the placeholder isn't the only key in "items" (indicating a non-empty list), then remove placeholders
        if (Object.keys(this.state.firebase.items).length > 1) {
          order[orderPlaceholder] = null;
          this.setState({
            firebase: {items: {placeholder: null}, order: order}
          });
          this.setState({
            listEmpty: false
          });
        }

        // Reveal list upon establishing sync
        this.setState({
          loaded: true
        });

        // If there are any pre-existing items in history, remove placeholder
        if (Object.keys(this.state.firebase.history).length > 1) {
          this.setState({
            firebase: {history: {placeholder: null}}
          });
        }
      }
    });

    // Pre-emptively set placeholders. The asynchronous nature of both setState() and syncState() requires this to be ordered this way.
    order[orderPlaceholder] = orderPlaceholder;
    this.setState({
      firebase: {items: {placeholder: true}, history: {placeholder: true}, order: order}
    });

    window.addEventListener("touchmove", this.handleTouchMove);
    window.addEventListener("touchend", this.handleReorderUp);
    window.addEventListener("mousemove", this.handleReorderMove);
    window.addEventListener("mouseup", this.handleReorderUp);
  }
  
  componentWillUnmount() {
    window.removeEventListener("touchmove", this.handleTouchMove);
    window.removeEventListener("touchend", this.handleReorderUp);
    window.removeEventListener("mousemove", this.handleReorderMove);
    window.removeEventListener("mouseup", this.handleReorderUp);
  }

  // Handle preexisting items being changed
  updateItem(key, entry, orderIndex) {
    var parsedEntry = util.parseEntry(entry);

    // If the user leaves the item with no name/text, then delete it
    if (!parsedEntry.itemName) {
      return this.deleteItem(key, orderIndex);
    }

    this.state.firebase.items[key].count = parsedEntry.itemCount;
    this.state.firebase.items[key].name = parsedEntry.itemName;
    this.setState({
      firebase: {items: this.state.firebase.items}
    });
  }

  // Handle adding new items to the list
  // This takes an object (item) as a parameter and uses its attached attributes to construct a new item and push to the state
  addItem(item) {
    var items = this.state.firebase.items;
    var order = this.state.firebase.order;
    var history = this.state.firebase.history;

    // Create new item with a unique key represented by the current date/time
    var timestamp = (new Date()).getTime();
    items["item-" + timestamp] = item;

    var maxIndex = Object.keys(items).length - 1;

    // Remove placeholders
    if (this.state.listEmpty) {
      items["placeholder"] = null;
      order[orderPlaceholder] = null;
      maxIndex--;
      this.setState({
        listEmpty: false
      });
    }

    order[maxIndex] = maxIndex;
    var itemName = item.name;

    // Increment the amount of times the new item has been added or set to 1 if never added before
    history[itemName] = history.hasOwnProperty(itemName) ? history[itemName] + 1 : 1;

    if (history.hasOwnProperty("placeholder")) {
      history["placeholder"] = null;
    }
    this.setState({
      firebase: {items: items, order: order, history: history}
    });
  }

  // Handler iteratively used to render every item of the items state
  renderItem(key, orderIndex) {
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
            initialOrder={range(Object.keys(this.state.firebase.items).length)} // The default order to compare item's index against
            lastPressed={this.state.lastPressed}
            orderIndex={orderIndex} // Used to determine order of appearance in the DOM relative to order state
            handleReorderStart={this.handleReorderStart}
            handleTouchStart={this.handleTouchStart}/>
    )
  }

  // Handle user checking items off list
  checkItem(key) {
    this.state.firebase.items[key].checked = !this.state.firebase.items[key].checked;
    this.setState({
      firebase: {items: this.state.firebase.items}
    });
  }

  // Handler used to queue items for deletion. This involves setting up a timeout to delay deleting all checked items at once.
  // Any time the user checks another item before deletion is executed, the timeout is refreshed.
  setDelete(key, orderIndex) {
    clearTimeout(deleteTimeout);
    deleteList.push({key: key, orderIndex: orderIndex});
    var self = this;
    deleteTimeout = setTimeout(function() {
      deleteList.map(function(obj, index) {
        var currentOrderInd = obj.orderIndex;
        self.deleteItem(obj.key, currentOrderInd);

        // Adjust remaining items' indices in deleteList to match the actual order state
        for (var i = index; i < deleteList.length; i++) {
          if (deleteList[i].orderIndex > currentOrderInd) {
            deleteList[i].orderIndex--;
          }
        }

      });
      deleteList = [];
    }, 1600);
  }

  // Handle item deletion
  deleteItem(key, orderIndex) {
    var items = this.state.firebase.items;
    var order = this.state.firebase.order;
    order.splice(order.indexOf(orderIndex), 1);

    // Adjust remaining items' indices to reflect the new max index
    var newOrder = order.map(function(index) {
      return index > orderIndex ? index - 1 : index;
    });

    // If no items left in the list, insert Firebase placeholders
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

  // Handler for beginning to reorder an item
  handleReorderStart(event, pos, pressY) {

    // Retrieve the universal ("*") selector in the stylesheet and apply the "cursor: grabbing" rule to it
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

  // Handler for the movement of the cursor during reordering
  handleReorderMove(event) {
    var isPressed = this.state.isPressed;
    var delta = this.state.delta;
    var items = this.state.firebase.items;
    var order = this.state.firebase.order;
    var lastPressed = this.state.lastPressed;
    touchY = event.pageY;
    if (isPressed) {
      var mouse = event.pageY - delta;

      // Perform the reorder based off of the cursor's position within the range of total items present in the list
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

  // Handle releasing mouse/press during reordering
  handleReorderUp() {

    // Prevent text from being selected after finishing a reorder
    if (this.state.isPressed) {
      window.getSelection().removeAllRanges();
    }

    // Remove cursor: grabbing from the universal ("*") selector
    var mySheet = document.styleSheets[0];
    var firstRule = mySheet.cssRules ? mySheet.cssRules[0] : mySheet.rules[0];
    firstRule.style.cssText = null;

    this.setState({
      isPressed: false,
      delta: 0
    });
    clearInterval(scrollInterval);
  }

  // Mobile handler for handleReorderStart
  handleTouchStart(event, key, pressLocation) {
    this.initAutoScroll(); // Initialize default settings for item reorder scrolling
    scrollInterval = setInterval(this.autoScroll, 20); // Watch for scrolling opportunities
    this.handleReorderStart(event.touches[0], key, pressLocation);
  }

  // Handle handleReorderMove for mobile
  handleTouchMove(event) {
    if (this.state.isPressed) {
      event.preventDefault();
      this.handleReorderMove(event.touches[0]);
    }
  }

  // Handler for initializing default settings for item reorder scrolling
  initAutoScroll() {
    touchY = -1;
    windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    docHeight = util.getDocHeight() - windowHeight;
  }

  // Handle scrolling the window vertically depending on the direction that the user is dragging the item
  autoScroll() {
    var scrollChange = 0;
    scrollPosition = window.scrollY;

    // If the cursor is within scrollBuffer's distance of either vertical edge, scroll the window in the respective direction
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

  // Handler for populating the suggestions state
  populateSuggestions(suggestions) {
    this.state.suggestions = suggestions;
    this.setState({
      suggestions: this.state.suggestions
    });
  }

  // Handler for changing which item via index in the suggestions box is highlighted
  changeHighlightIndex(index) {
    this.setState({
      highlightIndex: index
    });
  }

  // Handler for hovering over the suggestions box
  suggestionsMouseOver() {
    this.setState({
      suggestionsHover: true
    });
  }
  
  // Handler for the cursor leaving the suggestions box
  suggestionsMouseOut() {
    this.setState({
      suggestionsHover: false
    });
  }
  
  // Handler for adding items via suggestions
  suggestionSubmit(index) {
    this.refs.addItemBar.suggestionSubmit(index);
  }

  render() {
    var items = !(this.state.listEmpty) ? this.state.firebase.items : {}; // Prevent React from attempting to render placeholders
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