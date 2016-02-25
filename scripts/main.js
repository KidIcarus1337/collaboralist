var React = require("react");
var ReactDOM = require("react-dom");
var CSSTransitionGroup = require("react-addons-css-transition-group");

var ReactRouter = require("react-router");
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation;

var History = ReactRouter.History;
var createBrowserHistory = require("history/lib/createBrowserHistory");

var util = require("./utilities");

var App = React.createClass({
  mixins : [History],

  spillTheBeans : function() {
    var cats = this;
    console.log(cats);
  },

  render: function () {
    return (
      <div className="container">
        <p onClick={this.spillTheBeans}>Wut's up mai bruddahz2?</p>
        <Good/>
      </div>
    )
  }

});

var Good = React.createClass({

  render: function () {
    return (
      <CSSTransitionGroup
        className="cats"
        component="p"
        transitionName="cats"
        transitionShowTimeout={500}
        transitionHideTimeout={500}
        >
        I like cats
      </CSSTransitionGroup>
    )
  }

});


var FourOhFoured = React.createClass({
  render: function () {
    return (
      <div className="container">
        <h1 className="error-code">{util.errorJoke()}</h1>
      </div>
    )
  }
});


var routes = (
  <Router history={createBrowserHistory()}>
    <Route path="/" component={App}/>
    <Route path="/good" component={Good}/>
    <Route path="*" component={FourOhFoured}/>
  </Router>
);

ReactDOM.render(routes, document.querySelector("#main"));