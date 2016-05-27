import React from "react";
import ReactDOM  from "react-dom";
import autobind from "autobind-decorator";

import Generator from "./components/Generator"
import List from "./components/List"
import FourOhFoured from "./components/FourOhFoured"


@autobind
// Render the application for the given route
class App extends React.Component {
  render() {
    // Grab the first item from the hash split
    var location = this.props.location[0];

    // If there is no hash query, render the generator
    if (location == "") {
      return <Generator />;
    } else if (location == "list") {

      // Take the parameter following /list/ and check if it's a valid UUID format
      var listId = this.props.location[1];
      var re = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (re.test(listId)) {
        return <List listId={listId} />;
      } else {
        return <FourOhFoured />;
      }
    } else {
      return <FourOhFoured />;
    }
  }
}

// Split location at "/" points, then render "App", passing the results via a prop
function navigate() {
  var location = window.location.hash.replace(/^#\/?|\/$/g, "").split("/");
  var app = <App location={location} />;
  ReactDOM.render(app, document.querySelector("#main"));
}

// Handle the initial route and browser navigation events
navigate();
window.addEventListener("hashchange", navigate, false);