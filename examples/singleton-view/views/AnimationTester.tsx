import { ReflowReactComponentProps } from "@mcesystems/reflow-react-display-layer";
import ThemeTesterInterface from "../viewInterfaces/AnimationTester";
import React from "react";

function AnimationTester({ theme: color, prop1, prop2 }: ReflowReactComponentProps<ThemeTesterInterface>) {

  console.log(`Re-render`, { color, prop1, prop2 });
  return (
    <div>
      <div style={{ color }}>
        <div className="lds-dual-ring"></div>
      </div>
    </div>
  );
};

export default AnimationTester;
