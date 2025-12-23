import React from "react";
import { StyleSheet, ViewStyle, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Defs,
  RadialGradient as SvgRadialGradient,
  Stop,
  Rect,
} from "react-native-svg";

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientBackground({
  children,
  style,
}: GradientBackgroundProps) {
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, style]}>
      {/* 베이스 Linear Gradient */}
      <LinearGradient
        colors={["#7A5E4F", "#9B8070", "#B89A7F"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />

      {/* SVG Radial Gradient - 오른쪽 하단 오렌지 원 */}
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgRadialGradient
            id="grad"
            cx="80%"
            cy="80%"
            rx="85%"
            ry="70%"
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0%" stopColor="#FF7A3D" stopOpacity="1" />
            <Stop offset="20%" stopColor="#FF7A3D" stopOpacity="1" />
            <Stop offset="35%" stopColor="#FF9955" stopOpacity="1" />
            <Stop offset="50%" stopColor="#FF9955" stopOpacity="1" />
            <Stop offset="65%" stopColor="#F5A869" stopOpacity="0.9" />
            <Stop offset="75%" stopColor="#E5A869" stopOpacity="0.7" />
            <Stop offset="85%" stopColor="#C89B6D" stopOpacity="0.5" />
            <Stop offset="95%" stopColor="#B89A7F" stopOpacity="0.2" />
            <Stop offset="100%" stopColor="#9B8070" stopOpacity="0" />
          </SvgRadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={height} fill="url(#grad)" />
      </Svg>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
