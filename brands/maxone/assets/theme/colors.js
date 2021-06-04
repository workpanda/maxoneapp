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
    dark: "#302f37"
  };

  // brand colors
  const brand = {
    alpha: "#C8D700",
    beta: "#59A7FF",
    gamma: "#ffffff",
    dark: "#302f37",
    orange: "#cd5525"
  };

  const spacer = {
    dark: '#4e4d52'
}

  const button = {
    text: "#302f37",
    background: "#C8D700"
  };

  // text colors
  const text = {
    link: "#59A7FF",
    dark: "#454545",
    light: "#9b9b9b",
    white: "#ffffff",
    black: "#181818",
    lightdark:"#6d6c71"
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
    iconSelected: "#59A7FF",
    iconTextSelected: "#59A7FF",
    iconText: "#979797"
  };

  export default {
    app: { ...app },
    button: { ...button },
    brand: { ...brand },
    text: { ...text },
    navbar: { ...navbar },
    tabbar: { ...tabbar },
    spacer: { ...spacer }
  };
