import React from "react";
import {Motion, spring} from 'react-motion';
import autobind from 'autobind-decorator';

const springConfig = {stiffness: 300, damping: 50};

@autobind
class Item extends React.Component {
  onButtonClick() {
    var props = this.props;
    var key = props.index;
    this.props.checkItem(key);
    if (this.props.autoDelete) {
      setTimeout(function() {
        props.deleteItem(key);
      }, 600)
    }
  }

  confirmChange(event) {
    event.preventDefault();
    var details = this.props.details;
    var key = this.props.index;
    this.props.updateItem(key, this.itemText.value);
    this.itemText.value = details.count ? `${details.count} - ${details.name}` : `${details.name}`;
    this.itemText.blur();
  }

  render() {
    const mouse = this.props.mouse;
    const isPressed = this.props.isPressed;
    const initialOrder = this.props.initialOrder;
    const order = this.props.order;
    const lastPressed = this.props.lastPressed;
    const index = this.props.orderIndex;
    const style = lastPressed === index && isPressed
      ? {
          scale: spring(1.1, springConfig),
          shadow: spring(16, springConfig),
          y: mouse - (index * 50)
        }
      : {
          scale: spring(1, springConfig),
          shadow: spring(0, springConfig),
          y: spring((order.indexOf(index) - initialOrder.indexOf(index)) * 50, springConfig)
        };

    var details = this.props.details;
    var self = this;
    return (
      <Motion style={style} key={index}>
        {({scale, shadow, y}) =>
          <li className="list-item"
              onMouseDown={function(event) {self.props.onMouseDown(event, index, order.indexOf(index) * 50)}}
              style={{
                  boxShadow: `rgba(0, 0, 0, 0.2) 0px ${shadow}px ${2 * shadow}px 0px`,
                  transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                  WebkitTransform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                  zIndex: index === lastPressed ? 99 : index
                }}>
            <div>
              <div className={`checkmark-container ${details.checked ? "unselectable" : ""}`}
                   style={{borderColor: details.checked ? "#99ff8c" : "#cfcfcf"}}
                   onClick={!details.checked ? self.onButtonClick : null}>
                <div className="checkmark-space" dangerouslySetInnerHTML={{ __html: `<svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 98.5 98.5"
            enable-background="new 0 0 98.5 98.5"
            xml:space="preserve">
              <path
              class="${details.checked ? "checkmark" : ""}"
              fill="none"
              stroke-width="8"
              stroke-miterlimit="10"
              d="M81.7,17.8C73.5,9.3,62,4,49.2,
              4C24.3,4,4,24.3,4,49.2s20.3,45.2,
              45.2,45.2s45.2-20.3,
              45.2-45.2c0-8.6-2.4-16.6-6.5-23.4l0,0L45.6,
              68.2L24.7,47.3"/>
          </svg>` }}></div>
              </div>
              <form onSubmit={self.confirmChange}>
                <input className="item-text"
                       ref={(ref) => this.itemText = ref}
                       disabled={details.checked ? "disabled" : ""}
                       onBlur={self.confirmChange}
                       defaultValue={details.count ? `${details.count} - ${details.name}` : `${details.name}`}/>
              </form>
            </div>
          </li>
        }
      </Motion>
    )
  }
}

export default Item;