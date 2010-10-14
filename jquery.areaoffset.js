/*!
 * jQuery areaOffset Plugin
 *
 * Copyright 2010, Peter Galiba
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */
(function ($) {

  /**
   * Fetch the offset of an <area> in a <map> element.
   *
   * @param center {Boolean}
   *   Return the center offset of the area if set.
   * @returns {Object}
   *   Offset position in an object like: {top: 0, left: 0}.
   */
  $.fn.areaOffset = function (center) {
    var areas = this.filter('area'),
        area = areas.length && areas[0],
        coords = (area && $.map(area.coords.split(','), $.trim)) || [],
        cl = coords.length,
        offset = { left: 0, top:  0 },
        shape,
        xs, ys, xm, ym, i, A, xl, cx, cy, s,
        map, obj;

    if (cl > 2) {
      shape = areas.eq(0).attr('shape');
      shape = shape && shape.toLowerCase();
      // Different calculations are required by shape type.
      switch (shape) {
        case 'circle':
          // By default circle returns center, so calculation is only needed,
          // if upper left corner is required.
          offset = {
            left : +coords[0] - (center ? 0 : coords[2]),
            top  : +coords[1] - (center ? 0 : coords[2])
          };
          break;

        case 'rect':
        case 'poly':
          // Polygon needs to have at least 3 vectors.
          if (cl >= 6 && cl % 2 === 0) {
            xs = []; ys = [];
            for (i = 0; i < cl; i += 1) {
              i % 2 ? ys.push(+coords[i]) : xs.push(+coords[i]);
            }
            xm = Math.min.apply(Math, xs);        // Minimum of all X coords
            ym = Math.min.apply(Math, ys);        // Minimum of all Y coords

            offset = {
              left : xm,
              top  : ym
            };

            // Caculate center position if needed.
            if (center) {
              xl = xs.length; // Real corners of the polygon
              // Treat rectangles differently
              if (shape === 'rect') {
                offset = {
                  left : xm + (Math.max.apply(Math, xs) - xm) / 2,
                  top  : ym + (Math.max.apply(Math, ys) - ym) / 2
                };
              }
              else {
                // The starting and ending value vector should be the same
                // according to W3C spec, or should be filled with the it.
                if (xl === 3 || !(xs[xl - 1] === xs[0] && ys[xl - 1] === ys[0])) {
                  xs[xl] = xs[0];
                  ys[xl] = ys[0];
                }
                else {
                  xl -= 1; // Polygon already closed, decrease the corners
                }

                // Calculate the centroid of the polygon
                A = 0;   // Signed area
                cx = 0;  // Center X coorinate
                cy = 0;  // Center Y coordinate
                for (i = 0; i < xl; i += 1) {
                  s = xs[i] * ys[i + 1] - xs[i + 1] * ys[i]; // Partial signed area
                  A += s;
                  cx += (xs[i] + xs[i + 1]) * s;
                  cy += (ys[i] + ys[i + 1]) * s;
                }

                // If we have a non 0 area, count the rest.
                if (A !== 0) {
                  A /= 2;
                  cx /= 6 * A;
                  cy /= 6 * A;

                  offset = {
                    left : cx,
                    top  : cy
                  };
                }

              }
            }
          }
          break;

        default:
          if (center) {
            map = areas.eq(0).closest('map');
            obj = map.length && $('[usemap=#' + map[0].name + ']');
            if (obj.length) {
              offset = {
                left: obj.height() / 2,
                top:  obj.width() / 2
              };
            }
          }
          break;
      }
    }
    return offset;
  };
}(jQuery));
