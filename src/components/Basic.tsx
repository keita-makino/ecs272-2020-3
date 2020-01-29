import React, { useState } from "react";
import { XYPlot, LineSeries, Sunburst } from "react-vis";
import data from "../data/data.json";
import * as NestHydrationJS from "nesthydrationjs";

type Props = {};

const Basic: React.FC<Props> = (props: Props) => {
  const [tooltip, setTooltip] = useState("");

  const levels = ["Category", "DayOfWeek"];

  const nestedData = NestHydrationJS().nest(
    data.map(item => ({
      _title: item.Category,
      _color: "#12939A",
      _children__title: item.DayOfWeek,
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
    console.log(item);
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
          color: getColor(item2.title),
          size: getFreqency(item2)
        }));
      }
    } else {
      r = item.map((item2: any) => ({
        title: item2.title,
        children: aggregate(item2.children),
        color: getColor(item2.title)
      }));
    }
    console.log(r);
    return r;
  };

  const getColor = (str: string) => {
    if (str.length < 3) {
      const rArray = Array(3)
        .fill(0)
        .map(item => Math.floor(Math.random() * 255).toString(16));
      return `#${rArray.join("")}`;
    } else {
      const sStr = str
        .substring(0, 3)
        .split("")
        .map(item => item.charCodeAt(0).toString(16));
      console.log(`#${sStr.join("")}`);
      return `#${sStr.join("")}`;
    }
  };

  let freqData = nestedData;
  while (freqData[0].size === undefined) freqData = aggregate(freqData);
  console.log(freqData);

  const plotData = {
    title: "root",
    size: freqData.reduce((prev: number, curr: any) => prev + curr.size, 0),
    children: freqData
  };
  console.log(plotData);

  return (
    <>
      <Sunburst
        animation
        hideRootNode
        data={plotData}
        height={1280}
        width={720}
      />
    </>
  );
};

export default Basic;
