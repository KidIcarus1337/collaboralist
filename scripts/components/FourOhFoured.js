import React from "react";
import Footer from "./Footer";

class FourOhFoured extends React.Component {
  render() {
    return (
      <div className="container error-container">
        <h1 className="error-header">404</h1>
        <h2 className="error-header">Oops! You dun goofed!</h2>
        <p className="error-desc">
          That doesn't appear to be a valid query. If you were looking to access a certain list, be sure to double check your URL for mistakes and/or missing characters.
          Otherwise, you can use the <a href="https://collaboralist.github.io/">generator</a> to create a new list.
        </p>
        <Footer />
      </div>
    )
  }
}

export default FourOhFoured;