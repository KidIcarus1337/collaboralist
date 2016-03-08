import React from "react";
import autobind from 'autobind-decorator';

@autobind
class SearchSuggestions extends React.Component {
  render() {
    var highlightIndex = this.props.highlightIndex;
    return (
      <div className="suggestions-box" style={{display: this.props.suggestions.length === 0  ? "none" : "block"}}>
        <h4 className="suggestions-header">History</h4>
        {this.props.suggestions.map(function(val, index, highlightIndex) {
          console.log(highlightIndex);
          return (
            <div key={index} className={`suggestion unselectable ${index == highlightIndex ? 'suggestion-highlight' : ''}`}>{val}</div>
          )
        })}
      </div>
    )
  }
}

export default SearchSuggestions;