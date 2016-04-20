import React from "react";
import Footer from "./Footer";

class FourOhFoured extends React.Component {
  render() {
    return (
      <div className="container">
        <h1 className="error-code">Oops! You dun goofed!</h1>
        <Footer />
      </div>
    )
  }
}

export default FourOhFoured;