import React, { useState } from "react";
import { XYPlot, LineSeries, Sunburst } from "react-vis";
import rawData from "../data/data.json";
import * as NestHydrationJS from "nesthydrationjs";
import Selector from "./Selector";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import { Grid, Box, Typography } from "@material-ui/core";

type Props = {};

const query = gql`
  query @client {
    x {
      value
      __typename
    }
    y {
      value
      __typename
    }
  }
`;

const Advanced: React.FC<Props> = (props: Props) => {
  const { data } = useQuery(query);
  console.log(data);
  const [tooltip, setTooltip] = useState("");

  const nestedData = NestHydrationJS().nest(
    rawData.map((item: any) => ({
      _title: item[data.x.value],
      _color: "#12939A",
      _children__title: item[data.y.value],
      _children__color: "#2c3fc9",
      _children__children__title: item.IncidntNum,
      _children__children__size: 1,
      _children__children__treeEnd: true
    }))
  );

  const getFreqency = (item: any) => {
    return item.children.reduce(
      (prev: number, curr: any) => prev + curr.size,
      0
    );
  };

  const aggregate = (item: any) => {
    let r;
    if (item[0].children[0].size !== undefined) {
      if (item[0].children[0].treeEnd === true) {
        r = item.map((item2: any) => ({
          title: item2.title,
          color: getColor(item2.title),
          size: getFreqency(item2)
        }));
      } else {
        r = item.map((item2: any) => ({
          title: item2.title,
          children: item2.children,
          color: getColor(item2.title)
        }));
      }
    } else {
      r = item.map((item2: any) => ({
        title: item2.title,
        children: aggregate(item2.children),
        color: getColor(item2.title)
      }));
    }
    return r;
  };

  const getColor = (str: string) => {
    const hue = (str.charCodeAt(0) * 255) % 360;
    return `hsl(${hue}, 90%, 70%)`;
  };

  let freqData = aggregate(nestedData);
  // while (freqData[0].size === undefined) freqData = aggregate(freqData);

  const plotData = {
    title: "root",
    size: freqData.reduce((prev: number, curr: any) => prev + curr.size, 0),
    children: freqData
  };

  return (
    <Grid container>
      <Sunburst
        animation
        hideRootNode
        data={plotData}
        width={1280}
        height={720}
        padAngle={0.005}
      />
      <Grid
        container
        item
        direction={"column"}
        style={{ position: "absolute", width: "240px", margin: "20px" }}
      >
        <Typography>First-Category</Typography>
        <Selector target={"x"} />
        <br />
        <Typography>Second-Category</Typography>
        <Selector target={"y"} />
      </Grid>
    </Grid>
  );
};

export default Advanced;