/**
 * Math Engine for SVG Geometry
 * Utility functions for geometric calculations
 */

/**
 * Convert degrees to radians
 */
export const degToRad = (degree) => (degree * Math.PI) / 180;

/**
 * Convert radians to degrees
 */
export const radToDeg = (rad) => (rad * 180) / Math.PI;

/**
 * Calculate endpoint of a line segment given start point, angle, and length
 * @param {number} startX - Starting X coordinate
 * @param {number} startY - Starting Y coordinate
 * @param {number} angleInDegrees - Angle in degrees (0 = right, 90 = up in SVG coords which is flipped)
 * @param {number} length - Length of the segment
 * @returns {object} {x, y} endpoint coordinates
 */
export const getPointByAngle = (startX, startY, angleInDegrees, length) => {
  const rad = degToRad(angleInDegrees);
  // SVG: Y increases downward, so we subtract for upward movement
  return {
    x: startX + length * Math.cos(rad),
    y: startY - length * Math.sin(rad),
  };
};

/**
 * Calculate distance between two points
 */
export const getDistance = (x1, y1, x2, y2) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

/**
 * Calculate midpoint between two points
 */
export const getMidpoint = (x1, y1, x2, y2) => {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
};

/**
 * Generate points for a regular polygon
 * @param {number} centerX - Center X
 * @param {number} centerY - Center Y
 * @param {number} sides - Number of sides
 * @param {number} radius - Radius from center
 * @param {number} rotationDegrees - Initial rotation
 * @returns {Array} Array of {x, y} points
 */
export const getPolygonPoints = (centerX, centerY, sides, radius, rotationDegrees = 0) => {
  const points = [];
  const angleStep = 360 / sides;
  const rotationRad = degToRad(rotationDegrees);

  for (let i = 0; i < sides; i++) {
    const angle = rotationRad + degToRad(i * angleStep);
    points.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY - radius * Math.sin(angle),
    });
  }
  return points;
};

/**
 * Format points as SVG polygon points string
 */
export const formatPoints = (points) => {
  return points.map((p) => `${p.x},${p.y}`).join(' ');
};

/**
 * Create an arc path string for SVG
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} r - Radius
 * @param {number} startAngle - Start angle in degrees
 * @param {number} endAngle - End angle in degrees
 * @returns {string} SVG path d attribute
 */
export const createArcPath = (cx, cy, r, startAngle, endAngle) => {
  const start = getPointByAngle(cx, cy, startAngle, r);
  const end = getPointByAngle(cx, cy, endAngle, r);

  const startRad = degToRad(startAngle);
  const endRad = degToRad(endAngle);

  // Calculate large arc flag (1 if angle > 180°, else 0)
  const angleDiff = ((endAngle - startAngle) % 360 + 360) % 360;
  const largeArcFlag = angleDiff > 180 ? 1 : 0;

  // Calculate sweep flag (1 for clockwise, 0 for counter-clockwise)
  const sweepFlag = 1;

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y} Z`;
};

/**
 * 3D to 2D isometric projection for simple wireframes
 * @param {number} x - 3D X coordinate
 * @param {number} y - 3D Y coordinate
 * @param {number} z - 3D Z coordinate
 * @param {number} depth - Depth factor (default 0.3)
 * @returns {object} {x, y} 2D coordinates
 */
export const project3D = (x, y, z, depth = 0.3) => {
  return {
    x: x + z * depth * Math.cos(degToRad(30)),
    y: y - z * depth * Math.sin(degToRad(30)),
  };
};
