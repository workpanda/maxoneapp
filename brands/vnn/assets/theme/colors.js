/**
 * App Theme - Colors
 */

// general colors
const app = {
  background: "#E9E9E9",
  overlay: "#232323",
  cardBackground: "#ffffff",
  listItemBackground: "#ffffff",
  border: "#DBDBDD",
  dark: "#373944"
};

// brand colors
const brand = {
  alpha: "#02FF80",
  beta: "#00E3FF",
  gamma: "#FF5240",
  dark: "#373944"
};

// text colors
const text = {
  link: "#02FF80",
  dark: "#454545",
  light: "#9b9b9b",
  white: "#ffffff",
  black: "#181818"
};

const button = {
  text: "#181818",
  background: "#02FF80"
};

// tabbar colors
const navbar = {
  background: "#222127",
  text: "#ffffff"
};

// tabbar colors
const tabbar = {
  background: "#ffffff",
  iconDefault: "#979797",
  iconSelected: "#02FF80",
  iconTextSelected: "#02FF80",
  iconText: "#979797"
};

export default {
  app: { ...app },
  brand: { ...brand },
  button: { ...button },
  text: { ...text },
  navbar: { ...navbar },
  tabbar: { ...tabbar }
};
