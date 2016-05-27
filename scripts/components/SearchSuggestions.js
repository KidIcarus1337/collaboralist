import React from "react";
import autobind from "autobind-decorator";

@autobind
class SearchSuggestions extends React.Component {
  render() {
    var props = this.props;
    var highlightIndex = props.highlightIndex;
    var suggestionsMouseOver = props.suggestionsMouseOver;
    var suggestionsMouseOut = props.suggestionsMouseOut;
    return (
      <div className="suggestions-box" style={{display: this.props.suggestions.length === 0  ? "none" : "block"}}>
        <h4 className="suggestions-header">History</h4>
        {this.props.suggestions.map(function(val, index) {
          return (
            <div key={index}
                 className={`suggestion unselectable ${index == highlightIndex ? "suggestion-highlight" : ""}`}
                 onClick={function() {props.suggestionSubmit(index)}}
                 onMouseOver={suggestionsMouseOver}
                 onMouseOut={suggestionsMouseOut}>{val}</div>
          )
        })}
      </div>
    )
  }
}

export default SearchSuggestions;