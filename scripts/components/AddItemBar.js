import React from "react";
import {Motion, spring} from 'react-motion';
import autobind from 'autobind-decorator';

@autobind
class AddItemBar extends React.Component {
  constructor() {
    super();

    this.state = {
      countLength: 1,
      countValue: 1,
      nameEntered: false
    }
  }

  itemNameFocus() {
    this.setState({
      nameEntered: false
    });
  }

  itemNameConfirm(event) {
    if (event.key === 'Enter') {
      this.setState({
        nameEntered: true
      });
      this.refs.addItemCount.focus();
    }
  }

  itemNamePush(event) {
    this.setState({
      countLength: (event.target.value).length,
      countValue: event.target.value
    });
  }

  initialNameStyles() {
    return {
      marginLeft: spring(0),
      paddingLeft: spring(60),
      opacity: spring(1)
    };
  }

  finalNameStyles() {
    return {
      marginLeft: spring(70 + ((this.state.countLength) * 10)),
      paddingLeft: spring(0),
      opacity: spring(0.5)
    }
  }

  render() {
    var style = this.state.nameEntered ? this.finalNameStyles() : this.initialNameStyles();
    return (
      <li className="add-item-bar">
        <div>
          <span className="add-item-count">
            <input onChange={this.itemNamePush} type="text" ref="addItemCount" value={this.state.countValue} />
          </span>
          <Motion style={style} key={7}>
            {({marginLeft, paddingLeft, opacity}) =>
              <span className="add-item-name" style={{marginLeft: `${marginLeft}px`}}>
                <input onFocus={this.itemNameFocus} onKeyPress={this.itemNameConfirm} type="text" ref="addItemName" placeholder="New Item"
                       style={{paddingLeft: `${paddingLeft}px`, opacity: opacity}} />
              </span>
            }
          </Motion>
        </div>
      </li>
    )
  }
}
{/*this.state.nameEntered ? {marginLeft: `${80 + (this.state.countLength * 18)}px`} : {marginLeft: `${marginLeft}px`}*/}
export default AddItemBar;