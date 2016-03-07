import React from "react";
import autobind from 'autobind-decorator';

@autobind
class SearchSuggestions extends React.Component {
  render() {
    return (
      <div className="suggestions-box" style={{display: this.props.suggestions.length == 0  ? "none" : "block"}}>
        <h4 className="suggestions-header">History</h4>
        {this.props.suggestions.map(function(val, index) {
          return (
            <div key={index} className="suggestion unselectable">{val}</div>
          )
        })}
      </div>
    )
  }
}

export default SearchSuggestions;