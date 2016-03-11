import React from "react";
import Item from "./Item"
import AddItemBar from "./AddItemBar";
import SearchSuggestions from "./SearchSuggestions";
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
      suggestionsHover: false
    }
  }

  componentDidMount() {
    this.setState({
      items: require("../sample-items"),
      history: require("../sample-history")
    });
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

  renderItem(key) {
    return (
      <Item key={key}
            index={key}
            details={this.state.items[key]}
            checkItem={this.checkItem}
            updateItem={this.updateItem} />
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