import React from 'react';
import classNames from 'classnames';
import warning from 'warning';

const numberComapre = (a, b) => a - b;

function calcPoints(vertical, marks, dots, step, min, max) {
  warning(
    dots ? step > 0 : true,
    '`Slider[step]` should be a positive number in order to make Slider[dots] work.'
  );
  const points = Object.keys(marks).map(parseFloat);
  if (dots) {
    for (let i = min; i <= max; i = i + step) {
      if (points.indexOf(i) >= 0) continue;
      points.push(i);
    }
  }
  return points.sort(numberComapre);
}

const Steps = ({ prefixCls, vertical, marks, dots, step, included,
                lowerBound, upperBound, max, min, stepLeft }) => {
  const range = max - min;
  const points = calcPoints(vertical, marks, dots, step, min, max);
  const elements = points.map((point, i) => {
    const offset = `${!!stepLeft
      ? stepLeft(i, point, points, min, max)
      : Math.abs(point - min) / range * 100
    }%`;
    const style = vertical ? { bottom: offset } : { left: offset };

    const isActived = (!included && point === upperBound) ||
            (included && point <= upperBound && point >= lowerBound);
    const pointClassName = classNames({
      [`${prefixCls}-dot`]: true,
      [`${prefixCls}-dot-active`]: isActived,
    });

    return <span className={pointClassName} style={style} key={point} />;
  });

  return <div className={`${prefixCls}-step`}>{elements}</div>;
};

export default Steps;
