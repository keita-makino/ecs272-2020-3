import React, { useState, useContext } from "react";
import { useApolloClient } from "@apollo/react-hooks";
import Select from "react-select";
import data from "../data/data.json";

type SelectorProps = {
  category?: string;
  target: string;
};

const Selector: React.FC<SelectorProps> = props => {
  const client = useApolloClient();

  const toggle = (option: any) => {
    client.writeData({
      data: {
        [props.target]: { value: option.value, __typename: "selection" }
      }
    });
  };

  const options = props.category
    ? data
        .map(item => item[props.category! as keyof typeof data[0]])
        .map(item => ({
          value: item,
          label: item
        }))
        .filter((value, index, self) => self.indexOf(value) === index)
    : Object.keys(data[0]).map(item => ({
        value: item,
        label: item
      }));

  return (
    <React.Fragment>
      <Select options={options} onChange={toggle} />
    </React.Fragment>
  );
};

export default Selector;
