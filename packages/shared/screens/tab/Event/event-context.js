import React from "react";

const eventContext = React.createContext({
  schedules: [],
  events: [],
  selectedEvents: []
});

export default eventContext;
