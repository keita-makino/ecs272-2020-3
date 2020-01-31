import React, { useState, useEffect, useRef } from "react";
import { Sunburst, LabelSeries } from "react-vis";
import * as NestHydrationJS from "nesthydrationjs";
import Selector from "./Selector";
import { gql } from "apollo-boost";
import { useQuery } from "@apollo/react-hooks";
import { Grid, Typography } from "@material-ui/core";
import Reset from "./Reset";

type Props = { data: any[] };

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
    xt {
      value
      __typename
    }
    zt {
      value
      __typename
    }
  }
`;

const Advanced: React.FC<Props> = (props: Props) => {
  const ref = useRef(null);

  const [tooltip, setTooltip] = useState(["root"]);
  const [node, setNode] = useState<any>(false);
  const [highlights, setHighlights] = useState([] as string[]);

  const { data } = useQuery(query);
  const x = data.x.value;
  const y = data.y.value;
  const targetData =
    data.xt.value !== "" && data.zt.value !== ""
      ? props.data.filter(
          item =>
            item[data.xt.value as keyof typeof props.data[0]] === data.zt.value
        )
      : props.data;

  let nestedData = null;

  const getColor = (str: string | number) => {
    const hue = (str.toString().charCodeAt(0) * 147) % 360;
    return `hsl(${hue}, 75%, 60%)`;
  };
  const getFreqency = (item: any) => {
    return item.children.reduce(
      (prev: number, curr: any) => prev + curr.size,
      0
    );
  };

  if (x !== "") {
    if (y !== "") {
      nestedData = targetData
        .map(item => ({ x: item[x], y: item[y] }))
        .reduce((prev: any, curr: any, index: any) => {
          if (prev.map((item: any) => item.title).includes(curr.x)) {
            if (
              prev
                .filter((item: any) => item.title === curr.x)[0]
                .children.map((item: any) => item.title)
                .includes(curr.y)
            ) {
              prev
                .filter((item: any) => item.title === curr.x)[0]
                .children.filter(
                  (item: any) => item.title === curr.y
                )[0].size += 1;
            } else {
              prev.filter((item: any) => item.title === curr.x)[0].children = [
                ...prev.filter((item: any) => item.title === curr.x)[0]
                  .children,
                {
                  title: curr.y,
                  category: y,
                  size: 1,
                  color: getColor(curr.y),
                  style: {
                    fillOpacity: highlights.includes(curr.y) ? 1 : 0.25
                  }
                }
              ];
            }
          } else {
            prev = [
              ...prev,
              {
                title: curr.x,
                category: x,
                color: getColor(curr.x),
                style: {
                  fillOpacity: highlights.includes(curr.x) ? 1 : 0.25
                },
                children: [
                  {
                    title: curr.y,
                    category: y,
                    size: 1,
                    color: getColor(curr.y),
                    style: {
                      fillOpacity: highlights.includes(curr.y) ? 1 : 0.25
                    }
                  }
                ]
              }
            ];
          }
          return prev;
        }, []);

      nestedData.sort((a: any, b: any) =>
        getFreqency(a) > getFreqency(b) ? -1 : 1
      );
      if (nestedData.length > 25) {
        nestedData = nestedData.slice(0, 25);
      }
      nestedData.map((item: any) => {
        const array = item.children.sort((a: any, b: any) =>
          a.size > b.size ? -1 : 1
        );
        item.children = array.length > 25 ? array.slice(0, 25) : array;
      });
    } else {
      nestedData = targetData
        .map(item => ({ x: item[x], y: item[y] }))
        .reduce((prev: any, curr: any, index: any) => {
          if (prev.map((item: any) => item.title).includes(curr.x)) {
            prev.filter((item: any) => item.title === curr.x)[0].size += 1;
          } else {
            prev = [
              ...prev,
              {
                title: curr.x,
                category: x,
                size: 1,
                color: getColor(curr.x),
                style: {
                  fillOpacity: highlights.includes(curr.x) ? 1 : 0.25
                }
              }
            ];
          }
          return prev;
        }, []);
      nestedData.sort((a: any, b: any) => (a.size > b.size ? -1 : 1));
      if (nestedData.length > 25) {
        nestedData = nestedData.slice(0, 25);
      }
    }
  }

  let freqData = nestedData;
  // while (freqData[0].size === undefined) freqData = aggregate(freqData);
  const plotData = {
    title: "root",
    category: "root",
    size:
      y !== ""
        ? freqData.reduce((prev: number, curr: any) => prev + curr.size, 0)
        : undefined,
    children: freqData,
    style: {
      fillOpacity: 0.2
    }
  };

  const getTooltip = (node: any): string[] => {
    if (node.parent === null) {
      return ["root"];
    } else {
      if (node.data) {
        return [
          `> ${node.data.category}<${node.data.title}>`,
          ...getTooltip(node.parent)
        ];
      } else {
        return [
          `> ${node.category}<${node.title}>`,
          ...getTooltip(node.parent)
        ];
      }
    }
  };

  useEffect(() => {
    if (x === "" && y === "") setTooltip(["root"]);
  }, [x, y]);

  const onValueMouseOver = (node: any) => {
    const path = getTooltip(node);
    setNode(node);
    setTooltip(path.reverse());
    console.log(
      path
        .join("")
        .split("> ")
        .slice(1)
        .map(item => item.replace(/.*<(.*)>/g, "$1"))
    );
    setHighlights(
      path
        .join("")
        .split("> ")
        .slice(1)
        .map(item => item.replace(/.*<(.*)>/g, "$1"))
    );
  };

  const onValueMouseOut = () => {
    setNode(false);
    setTooltip(["root"]);
    setHighlights([]);
  };

  return (
    <div ref={ref}>
      <Grid container>
        <Sunburst
          animation
          hideRootNode={x !== ""}
          data={plotData}
          width={1280}
          height={720}
          padAngle={0.005}
          onValueMouseOver={onValueMouseOver}
          onValueMouseOut={onValueMouseOut}
          style={{
            strokeOpacity: 0.6
          }}
        >
          {node !== false && node.title !== "root" ? (
            <LabelSeries
              data={[
                {
                  x: 0,
                  y: 0,
                  label:
                    node.size !== undefined
                      ? `size: ${node.size}`
                      : `size: ${getFreqency(node)}`,
                  yOffset: -40
                }
              ]}
              labelAnchorX={"middle"}
              style={{
                fontSize: "24px",
                backgroundColor: "white",
                padding: "20px",
                width: "360px"
              }}
            />
          ) : null}
          {tooltip.map((item, index) => (
            <LabelSeries
              data={[
                {
                  x: 0,
                  y: -(index + 1) * 20,
                  label: item,
                  yOffset: -20
                }
              ]}
              labelAnchorX={"middle"}
              style={{
                backgroundColor: "white",
                padding: "20px",
                width: "360px"
              }}
            />
          ))}
        </Sunburst>
        <Grid
          container
          item
          justify={"space-between"}
          direction={"column"}
          style={{
            height: "680px",
            position: "absolute",
            width: "240px",
            margin: "20px"
          }}
        >
          <Grid item direction={"column"}>
            <Typography>First-Category</Typography>
            <Selector data={props.data} target={"x"} />
            <br />
            <Typography>Second-Category</Typography>
            <Selector data={props.data} target={"y"} />
          </Grid>
          <Grid item>
            <Reset />
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Advanced;
