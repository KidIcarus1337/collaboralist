import React from 'react';
import ReactDOM  from 'react-dom';

import Generator from "./components/Generator"
import List from "./components/List"
import FourOhFoured from "./components/FourOhFoured"


// Renders the application for the given route
var Application = React.createClass({
  render: function() {
    switch (this.props.location[0])  {
      case "":
        return <Generator />;

      case ""

      default:
        return <div><h1>Not Found</h1></div>;
    }
  }
});

// Split location into `/` separated parts, then render `Application` with it
function handleNewHash() {
  var location = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
  var application = <Application location={location} />;
  ReactDOM.render(application, document.querySelector("#main"));
}

// Handle the initial route and browser navigation events
handleNewHash();
window.addEventListener('hashchange', handleNewHash, false);