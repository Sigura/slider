'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _addEventListener = require('rc-util/lib/Dom/addEventListener');

var _addEventListener2 = _interopRequireDefault(_addEventListener);

var _classnames = require('classnames');

var _classnames2 = _interopRequireDefault(_classnames);

var _Track = require('./Track');

var _Track2 = _interopRequireDefault(_Track);

var _Handle = require('./Handle');

var _Handle2 = _interopRequireDefault(_Handle);

var _Steps = require('./Steps');

var _Steps2 = _interopRequireDefault(_Steps);

var _Marks = require('./Marks');

var _Marks2 = _interopRequireDefault(_Marks);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var numberComapre = function numberComapre(a, b) {
  return a - b;
};

function noop() {}

function isNotTouchEvent(e) {
  return e.touches.length > 1 || e.type.toLowerCase() === 'touchend' && e.touches.length > 0;
}

function getTouchPosition(vertical, e) {
  return vertical ? e.touches[0].clientY : e.touches[0].pageX;
}

function getMousePosition(vertical, e) {
  return vertical ? e.clientY : e.pageX;
}

function pauseEvent(e) {
  e.stopPropagation();
  e.preventDefault();
}

var Slider = function (_Component) {
  _inherits(Slider, _Component);

  function Slider(props) {
    _classCallCheck(this, Slider);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.handleRef = function (ref) {
      _this.sliderRef = ref || _this.sliderRef;
    };

    var range = props.range,
        min = props.min,
        max = props.max,
        step = props.step;

    var initialValue = range ? Array.apply(null, Array(range + 1)).map(function () {
      return min;
    }) : min;
    var defaultValue = 'defaultValue' in props ? props.defaultValue : initialValue;
    var value = props.value !== undefined ? props.value : defaultValue;
    var bounds = (range ? value : [min, value]).map(function (v) {
      return _this.trimAlignValue(v);
    });
    var recent = void 0;

    if (range && bounds[0] === bounds[bounds.length - 1] && bounds[0] === max) {
      recent = 0;
    } else {
      recent = bounds.length - 1;
    }

    if (process.env.NODE_ENV !== 'production' && step && Math.floor(step) === step && (max - min) % step !== 0) {
      (0, _warning2["default"])(false, 'Slider[max] - Slider[min] (%s) should be a multiple of Slider[step] (%s)', max - min, step);
    }

    _this.state = {
      handle: null,
      recent: recent,
      bounds: bounds
    };
    return _this;
  }

  Slider.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
    var _this2 = this;

    if (!('value' in nextProps || 'min' in nextProps || 'max' in nextProps)) return;

    var bounds = this.state.bounds;

    if (nextProps.range) {
      var value = nextProps.value || bounds;
      var nextBounds = value.map(function (v) {
        return _this2.trimAlignValue(v, nextProps);
      });
      if (nextBounds.every(function (v, i) {
        return v === bounds[i];
      })) return;

      this.setState({ bounds: nextBounds });
      if (bounds.some(function (v) {
        return _this2.isValueOutOfBounds(v, nextProps);
      })) {
        this.props.onChange(nextBounds);
      }
    } else {
      var _value = nextProps.value !== undefined ? nextProps.value : bounds[1];
      var nextValue = this.trimAlignValue(_value, nextProps);
      if (nextValue === bounds[1] && bounds[0] === nextProps.min) return;

      this.setState({ bounds: [nextProps.min, nextValue] });
      if (this.isValueOutOfBounds(bounds[1], nextProps)) {
        this.props.onChange(nextValue);
      }
    }
  };

  Slider.prototype.onChange = function onChange(state) {
    var props = this.props;
    var isNotControlled = !('value' in props);
    if (isNotControlled) {
      this.setState(state);
    } else if (state.handle) {
      this.setState({ handle: state.handle });
    }

    var data = _extends({}, this.state, state);
    var changedValue = props.range ? data.bounds : data.bounds[1];
    props.onChange(changedValue);
  };

  Slider.prototype.onMouseMove = function onMouseMove(e) {
    var position = getMousePosition(this.props.vertical, e);
    this.onMove(e, position);
  };

  Slider.prototype.onTouchMove = function onTouchMove(e) {
    if (isNotTouchEvent(e)) {
      this.end('touch');
      return;
    }

    var position = getTouchPosition(this.props.vertical, e);
    this.onMove(e, position);
  };

  Slider.prototype.onMove = function onMove(e, position) {
    pauseEvent(e);
    var props = this.props;
    var state = this.state;

    var pixelOffset = position - this.getSliderStart();
    var v = this.calcValue(pixelOffset);
    var diffValue = !this.props.vertical ? v - this.startValue : this.startValue - v;

    // let diffPosition = position - this.startPosition;
    // diffPosition = this.props.vertical ? -diffPosition : diffPosition;
    // const diffValue = diffPosition / this.getSliderLength() * (props.max - props.min);

    var value = this.trimAlignValue(this.startValue + diffValue);
    var oldValue = state.bounds[state.handle];
    if (value === oldValue) return;

    var nextBounds = [].concat(_toConsumableArray(state.bounds));
    nextBounds[state.handle] = value;
    var nextHandle = state.handle;
    if (props.pushable !== false) {
      var originalValue = state.bounds[nextHandle];
      this.pushSurroundingHandles(nextBounds, nextHandle, originalValue);
    } else if (props.allowCross) {
      nextBounds.sort(numberComapre);
      nextHandle = nextBounds.indexOf(value);
    }
    this.onChange({
      handle: nextHandle,
      bounds: nextBounds
    });
  };

  Slider.prototype.onTouchStart = function onTouchStart(e) {
    if (isNotTouchEvent(e)) return;

    var position = getTouchPosition(this.props.vertical, e);
    this.onStart(position);
    this.addDocumentEvents('touch');
    pauseEvent(e);
  };

  Slider.prototype.onMouseDown = function onMouseDown(e) {
    if (e.button !== 0) {
      return;
    }
    var position = getMousePosition(this.props.vertical, e);
    this.onStart(position);
    this.addDocumentEvents('mouse');
    pauseEvent(e);
  };

  Slider.prototype.onStart = function onStart(position) {
    var props = this.props;
    props.onBeforeChange(this.getValue());

    var value = this.calcValueByPos(position);
    this.startValue = value;
    this.startPosition = position;

    var state = this.state;
    var bounds = state.bounds;


    var valueNeedChanging = 1;
    if (this.props.range) {
      var closestBound = 0;
      for (var i = 1; i < bounds.length - 1; ++i) {
        if (value > bounds[i]) {
          closestBound = i;
        }
      }
      if (Math.abs(bounds[closestBound + 1] - value) < Math.abs(bounds[closestBound] - value)) {
        closestBound = closestBound + 1;
      }
      valueNeedChanging = closestBound;

      var isAtTheSamePoint = bounds[closestBound + 1] === bounds[closestBound];
      if (isAtTheSamePoint) {
        valueNeedChanging = state.recent;
      }

      if (isAtTheSamePoint && value !== bounds[closestBound + 1]) {
        valueNeedChanging = value < bounds[closestBound + 1] ? closestBound : closestBound + 1;
      }
    }

    this.setState({
      handle: valueNeedChanging,
      recent: valueNeedChanging
    });

    var oldValue = state.bounds[valueNeedChanging];
    if (value === oldValue) return;

    var nextBounds = [].concat(_toConsumableArray(state.bounds));
    nextBounds[valueNeedChanging] = value;
    this.onChange({ bounds: nextBounds });
  };

  Slider.prototype.getValue = function getValue() {
    var bounds = this.state.bounds;

    return this.props.range ? bounds : bounds[1];
  };

  Slider.prototype.getSliderLength = function getSliderLength() {
    var slider = this.sliderRef;
    if (!slider) {
      return 0;
    }

    return this.props.vertical ? slider.clientHeight : slider.clientWidth;
  };

  Slider.prototype.getSliderStart = function getSliderStart() {
    var slider = this.sliderRef;
    var rect = slider.getBoundingClientRect();

    return this.props.vertical ? rect.top : rect.left;
  };

  Slider.prototype.getPrecision = function getPrecision(step) {
    var stepString = step.toString();
    var precision = 0;
    if (stepString.indexOf('.') >= 0) {
      precision = stepString.length - stepString.indexOf('.') - 1;
    }
    return precision;
  };

  /**
   * Returns an array of possible slider points, taking into account both
   * `marks` and `step`. The result is cached.
   */


  Slider.prototype.getPoints = function getPoints() {
    var _props = this.props,
        marks = _props.marks,
        step = _props.step,
        min = _props.min,
        max = _props.max;

    var cache = this._getPointsCache;
    if (!cache || cache.marks !== marks || cache.step !== step) {
      var pointsObject = _extends({}, marks);
      if (step !== null) {
        for (var point = min; point <= max; point += step) {
          pointsObject[point] = point;
        }
      }
      var points = Object.keys(pointsObject).map(parseFloat).sort(numberComapre);
      this._getPointsCache = { marks: marks, step: step, points: points };
    }
    return this._getPointsCache.points;
  };

  Slider.prototype.isValueOutOfBounds = function isValueOutOfBounds(value, props) {
    return value < props.min || value > props.max;
  };

  Slider.prototype.trimAlignValue = function trimAlignValue(v, nextProps) {
    var state = this.state || {};
    var handle = state.handle,
        bounds = state.bounds;

    var _props2 = _extends({}, this.props, nextProps || {}),
        marks = _props2.marks,
        step = _props2.step,
        min = _props2.min,
        max = _props2.max,
        allowCross = _props2.allowCross;

    var val = v;
    if (val <= min) {
      val = min;
    }
    if (val >= max) {
      val = max;
    }
    /* eslint-disable eqeqeq */
    if (!allowCross && handle != null && handle > 0 && val <= bounds[handle - 1]) {
      val = bounds[handle - 1];
    }
    if (!allowCross && handle != null && handle < bounds.length - 1 && val >= bounds[handle + 1]) {
      val = bounds[handle + 1];
    }
    /* eslint-enable eqeqeq */

    var points = Object.keys(marks).map(parseFloat);
    if (step !== null) {
      var closestStep = Math.round((val - min) / step) * step + min;
      points.push(closestStep);
    }

    var diffs = points.map(function (point) {
      return Math.abs(val - point);
    });
    var closestPoint = points[diffs.indexOf(Math.min.apply(Math, _toConsumableArray(diffs)))];

    return step !== null ? parseFloat(closestPoint.toFixed(this.getPrecision(step))) : closestPoint;
  };

  Slider.prototype.pushHandleOnePoint = function pushHandleOnePoint(bounds, handle, direction) {
    var points = this.getPoints();
    var pointIndex = points.indexOf(bounds[handle]);
    var nextPointIndex = pointIndex + direction;
    if (nextPointIndex >= points.length || nextPointIndex < 0) {
      // reached the minimum or maximum available point, can't push anymore
      return false;
    }
    var nextHandle = handle + direction;
    var nextValue = points[nextPointIndex];
    var threshold = this.props.pushable;

    var diffToNext = direction * (bounds[nextHandle] - nextValue);
    if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
      // couldn't push next handle, so we won't push this one either
      return false;
    }
    // push the handle
    bounds[handle] = nextValue;
    return true;
  };

  Slider.prototype.pushHandle = function pushHandle(bounds, handle, direction, amount) {
    var originalValue = bounds[handle];
    var currentValue = bounds[handle];
    while (direction * (currentValue - originalValue) < amount) {
      if (!this.pushHandleOnePoint(bounds, handle, direction)) {
        // can't push handle enough to create the needed `amount` gap, so we
        // revert its position to the original value
        bounds[handle] = originalValue;
        return false;
      }
      currentValue = bounds[handle];
    }
    // the handle was pushed enough to create the needed `amount` gap
    return true;
  };

  Slider.prototype.pushSurroundingHandles = function pushSurroundingHandles(bounds, handle, originalValue) {
    var threshold = this.props.pushable;

    var value = bounds[handle];

    var direction = 0;
    if (bounds[handle + 1] - value < threshold) {
      direction = +1;
    } else if (value - bounds[handle - 1] < threshold) {
      direction = -1;
    }

    if (direction === 0) {
      return;
    }

    var nextHandle = handle + direction;
    var diffToNext = direction * (bounds[nextHandle] - value);
    if (!this.pushHandle(bounds, nextHandle, direction, threshold - diffToNext)) {
      // revert to original value if pushing is impossible
      bounds[handle] = originalValue;
    }
  };

  Slider.prototype.calcOffset = function calcOffset(value) {
    var _props3 = this.props,
        min = _props3.min,
        max = _props3.max,
        stepLeft = _props3.stepLeft,
        marks = _props3.marks;

    var points = Object.keys(marks).map(parseFloat).sort(numberComapre);
    // const points = this.getPoints();
    var ratio = !stepLeft ? (value - min) / (max - min) : function () {
      var i = void 0;
      for (i = 0; i < points.length; ++i) {
        if (points[i] > value) {
          break;
        }
      }
      var step = i - 1;

      return parseFloat(stepLeft(step, points[step], points, min, max)) / 100;
    }();
    return ratio * 100;
  };

  Slider.prototype.calcValue = function calcValue(offset) {
    var _props4 = this.props,
        vertical = _props4.vertical,
        min = _props4.min,
        max = _props4.max,
        stepLeft = _props4.stepLeft,
        marks = _props4.marks;

    var ratio = Math.abs(offset / this.getSliderLength());
    if (!stepLeft) {
      var _value2 = vertical ? (1 - ratio) * (max - min) + min : ratio * (max - min) + min;
      return _value2;
    }

    var points = Object.keys(marks).map(parseFloat).sort(numberComapre);
    // const points = this.getPoints();
    var i = void 0;
    var lastPointOffset = void 0;
    for (i = 0; i < points.length; ++i) {
      lastPointOffset = parseFloat(stepLeft(i, points[i], points, min, max)) / 100;
      if (lastPointOffset > ratio) {
        break;
      }
    }
    var step = i - 1;
    var behindPointOffset = parseFloat(stepLeft(step, points[step], points, min, max)) / 100;
    var value = lastPointOffset !== behindPointOffset ? (ratio - behindPointOffset) / (lastPointOffset - behindPointOffset) * (points[i] - points[step]) + points[step] : points[step];

    return value;
  };

  Slider.prototype.calcValueByPos = function calcValueByPos(position) {
    var pixelOffset = position - this.getSliderStart();
    var nextValue = this.trimAlignValue(this.calcValue(pixelOffset));
    return nextValue;
  };

  Slider.prototype.addDocumentEvents = function addDocumentEvents(type) {
    if (type === 'touch') {
      // just work for chrome iOS Safari and Android Browser
      this.onTouchMoveListener = (0, _addEventListener2["default"])(document, 'touchmove', this.onTouchMove.bind(this));
      this.onTouchUpListener = (0, _addEventListener2["default"])(document, 'touchend', this.end.bind(this, 'touch'));
    } else if (type === 'mouse') {
      this.onMouseMoveListener = (0, _addEventListener2["default"])(document, 'mousemove', this.onMouseMove.bind(this));
      this.onMouseUpListener = (0, _addEventListener2["default"])(document, 'mouseup', this.end.bind(this, 'mouse'));
    }
  };

  Slider.prototype.removeEvents = function removeEvents(type) {
    if (type === 'touch') {
      this.onTouchMoveListener.remove();
      this.onTouchUpListener.remove();
    } else if (type === 'mouse') {
      this.onMouseMoveListener.remove();
      this.onMouseUpListener.remove();
    }
  };

  Slider.prototype.end = function end(type) {
    this.removeEvents(type);
    this.props.onAfterChange(this.getValue());
    this.setState({ handle: null });
  };

  Slider.prototype.render = function render() {
    var _this3 = this,
        _classNames3;

    var _state = this.state,
        handle = _state.handle,
        bounds = _state.bounds;
    var _props5 = this.props,
        className = _props5.className,
        prefixCls = _props5.prefixCls,
        tooltipPrefixCls = _props5.tooltipPrefixCls,
        disabled = _props5.disabled,
        vertical = _props5.vertical,
        dots = _props5.dots,
        included = _props5.included,
        range = _props5.range,
        step = _props5.step,
        marks = _props5.marks,
        max = _props5.max,
        min = _props5.min,
        tipTransitionName = _props5.tipTransitionName,
        tipFormatter = _props5.tipFormatter,
        children = _props5.children,
        markLeft = _props5.markLeft,
        stepLeft = _props5.stepLeft;


    var customHandle = this.props.handle;

    var offsets = bounds.map(function (v) {
      return _this3.calcOffset(v);
    });

    var handleClassName = prefixCls + '-handle';

    var handlesClassNames = bounds.map(function (v, i) {
      var _classNames;

      return (0, _classnames2["default"])((_classNames = {}, _defineProperty(_classNames, handleClassName, true), _defineProperty(_classNames, handleClassName + '-' + (i + 1), true), _defineProperty(_classNames, handleClassName + '-lower', i === 0), _defineProperty(_classNames, handleClassName + '-upper', i === bounds.length - 1), _classNames));
    });

    var isNoTip = step === null || tipFormatter === null;

    var commonHandleProps = {
      prefixCls: prefixCls,
      tooltipPrefixCls: tooltipPrefixCls,
      noTip: isNoTip,
      tipTransitionName: tipTransitionName,
      tipFormatter: tipFormatter,
      vertical: vertical
    };

    var handles = bounds.map(function (v, i) {
      return (0, _react.cloneElement)(customHandle, _extends({}, commonHandleProps, {
        className: handlesClassNames[i],
        value: v,
        offset: offsets[i],
        dragging: handle === i,
        key: i
      }));
    });
    if (!range) {
      handles.shift();
    }

    var isIncluded = included || range;

    var tracks = [];
    for (var i = 1; i < bounds.length; ++i) {
      var _classNames2;

      var trackClassName = (0, _classnames2["default"])((_classNames2 = {}, _defineProperty(_classNames2, prefixCls + '-track', true), _defineProperty(_classNames2, prefixCls + '-track-' + i, true), _classNames2));
      tracks.push(_react2["default"].createElement(_Track2["default"], { className: trackClassName, vertical: vertical, included: isIncluded,
        offset: offsets[i - 1], length: offsets[i] - offsets[i - 1], key: i
      }));
    }

    var sliderClassName = (0, _classnames2["default"])((_classNames3 = {}, _defineProperty(_classNames3, prefixCls, true), _defineProperty(_classNames3, prefixCls + '-disabled', disabled), _defineProperty(_classNames3, className, !!className), _defineProperty(_classNames3, prefixCls + '-vertical', this.props.vertical), _classNames3));

    return _react2["default"].createElement(
      'div',
      { ref: this.handleRef, className: sliderClassName,
        onTouchStart: disabled ? noop : this.onTouchStart.bind(this),
        onMouseDown: disabled ? noop : this.onMouseDown.bind(this)
      },
      tracks,
      _react2["default"].createElement(_Steps2["default"], { prefixCls: prefixCls, vertical: vertical, marks: marks, dots: dots, step: step,
        included: isIncluded, lowerBound: bounds[0],
        upperBound: bounds[bounds.length - 1], max: max, min: min,
        stepLeft: stepLeft
      }),
      handles,
      _react2["default"].createElement(_Marks2["default"], { className: prefixCls + '-mark', vertical: vertical, marks: marks,
        included: isIncluded, lowerBound: bounds[0],
        upperBound: bounds[bounds.length - 1], max: max, min: min,
        markLeft: markLeft
      }),
      children
    );
  };

  return Slider;
}(_react.Component);

Slider.propTypes = {
  min: _propTypes2["default"].number,
  max: _propTypes2["default"].number,
  step: _propTypes2["default"].number,
  defaultValue: _propTypes2["default"].oneOfType([_propTypes2["default"].number, _propTypes2["default"].arrayOf(_propTypes2["default"].number)]),
  value: _propTypes2["default"].oneOfType([_propTypes2["default"].number, _propTypes2["default"].arrayOf(_propTypes2["default"].number)]),
  marks: _propTypes2["default"].object,
  included: _propTypes2["default"].bool,
  className: _propTypes2["default"].string,
  prefixCls: _propTypes2["default"].string,
  tooltipPrefixCls: _propTypes2["default"].string,
  disabled: _propTypes2["default"].bool,
  children: _propTypes2["default"].any,
  markLeft: _propTypes2["default"].func,
  stepLeft: _propTypes2["default"].func,
  onBeforeChange: _propTypes2["default"].func,
  onChange: _propTypes2["default"].func,
  onAfterChange: _propTypes2["default"].func,
  handle: _propTypes2["default"].element,
  tipTransitionName: _propTypes2["default"].string,
  tipFormatter: _propTypes2["default"].func,
  dots: _propTypes2["default"].bool,
  range: _propTypes2["default"].oneOfType([_propTypes2["default"].bool, _propTypes2["default"].number]),
  vertical: _propTypes2["default"].bool,
  allowCross: _propTypes2["default"].bool,
  pushable: _propTypes2["default"].oneOfType([_propTypes2["default"].bool, _propTypes2["default"].number])
};

Slider.defaultProps = {
  prefixCls: 'rc-slider',
  className: '',
  tipTransitionName: '',
  min: 0,
  max: 100,
  step: 1,
  marks: {},
  handle: _react2["default"].createElement(_Handle2["default"], null),
  onBeforeChange: noop,
  onChange: noop,
  onAfterChange: noop,
  tipFormatter: function tipFormatter(value) {
    return value;
  },
  included: true,
  disabled: false,
  dots: false,
  range: false,
  vertical: false,
  allowCross: true,
  pushable: false
};

exports["default"] = Slider;
module.exports = exports['default'];