import { ReflowReactComponentProps } from "@mcesystems/reflow-react-display-layer";
import ThemeTesterInterface from "../viewInterfaces/AnimationTester";
import React from "react";

function AnimationTester({ theme: color }: ReflowReactComponentProps<ThemeTesterInterface>) {

  console.log(`Re-render`);
  return (
    <div>
      <div style={{ color }}>
        <div className="lds-dual-ring"></div>
      </div>
    </div>
  );
};

export default AnimationTester;
