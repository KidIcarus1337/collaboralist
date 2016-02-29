import React from "react";
import util from "../utilities";

class FourOhFoured extends React.Component {
  render() {
    return (
      <div className="container">
        <h1 className="error-code">{util.errorJoke()}</h1>
      </div>
    )
  }
}

export default FourOhFoured;