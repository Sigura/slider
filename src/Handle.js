import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'rc-tooltip';

export default class Handle extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isTooltipVisible: false,
    };
  }

  showTooltip() {
    this.setState({
      isTooltipVisible: true,
    });
  }

  hideTooltip() {
    this.setState({
      isTooltipVisible: false,
    });
  }

  render() {
    const {
      prefixCls,
      tooltipPrefixCls,
      className,
      tipTransitionName,
      tipFormatter,
      vertical,
      offset,
      value,
      dragging,
      noTip,
    } = this.props;

    const style = vertical ? { bottom: `${offset}%` } : { left: `${offset}%` };
    const handle = (
      <div className={className} style={style}
        onMouseUp={this.showTooltip.bind(this)}
        onMouseEnter={this.showTooltip.bind(this)}
        onMouseLeave={this.hideTooltip.bind(this)}
      />
    );

    if (noTip) {
      return handle;
    }

    const isTooltipVisible = dragging || this.state.isTooltipVisible;
    return (
      <Tooltip
        prefixCls={tooltipPrefixCls || `${prefixCls}-tooltip`}
        placement="top"
        visible={isTooltipVisible}
        overlay={<span>{tipFormatter(value)}</span>}
        delay={0}
        transitionName={tipTransitionName}
      >
        {handle}
      </Tooltip>
    );
  }
}

Handle.propTypes = {
  prefixCls: PropTypes.string,
  tooltipPrefixCls: PropTypes.string,
  className: PropTypes.string,
  vertical: PropTypes.bool,
  offset: PropTypes.number,
  tipTransitionName: PropTypes.string,
  tipFormatter: PropTypes.func,
  value: PropTypes.number,
  dragging: PropTypes.bool,
  noTip: PropTypes.bool,
};
