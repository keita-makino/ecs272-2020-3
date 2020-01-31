import React from "react";
import "./App.css";
import Advanced from "./components/Advanced";

import ApolloClient from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";
import { InMemoryCache } from "apollo-cache-inmemory";
import Basic from "./components/Basic";

const cache = new InMemoryCache();
const client = new ApolloClient({ cache });

cache.writeData({
  data: {
    x: { value: "", __typename: "selection" },
    y: { value: "", __typename: "selection" },
    z: { value: "", __typename: "selection" }
  }
});

const App: React.FC = () => {
  return (
    <div className="App">
      <ApolloProvider client={client}>
        <Basic />
        <Advanced />
      </ApolloProvider>
    </div>
  );
};

export default App;
