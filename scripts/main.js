import React from 'react';
import ReactDOM  from 'react-dom';
import autobind from 'autobind-decorator';

import Generator from "./components/Generator"
import List from "./components/List"
import FourOhFoured from "./components/FourOhFoured"


// Renders the application for the given route
@autobind
class Application extends React.Component {
  render() {
    var location = this.props.location[0];
    if (location == "") {
      return <Generator />;
    } else if (location == "list") {
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

// Split location into `/` separated parts, then render `Application` with it
function navigate() {
  var location = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
  var application = <Application location={location} />;
  ReactDOM.render(application, document.querySelector("#main"));
}

// Handle the initial route and browser navigation events
navigate();
window.addEventListener('hashchange', navigate, false);