/**
 * App Theme - Colors
 */

// general colors
const app = {
  background: "#f5f5f5",
  overlay: "#232323",
  cardBackground: "#ffffff",
  listItemBackground: "#ffffff",
  border: "#DBDBDD",
  dark: "#000000"
};

// brand colors
const brand = {
  alpha: "#f15d22",
  beta: "#f47721",
  gamma: "#aa3e22",
  dark: "#000000"
};

const button = {
  text: "#fff",
  background: "#f15d22"
};

// text colors
const text = {
  link: "#f15d22",
  dark: "#454545",
  light: "#9b9b9b",
  white: "#ffffff",
  black: "#000000"
};

// tabbar colors
const navbar = {
  background: "#000000",
  text: "#ffffff"
};

// tabbar colors
const tabbar = {
  background: "#ffffff",
  iconDefault: "#979797",
  iconSelected: "#f15d22",
  iconTextSelected: "#f15d22",
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
