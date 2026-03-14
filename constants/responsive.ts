import { Dimensions } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

const { width, height } = Dimensions.get("window");

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

export const rs = (size: number) => scale(size);
export const rvs = (size: number) => verticalScale(size);
export const rms = (size: number, factor = 0.5) => moderateScale(size, factor);

export const wp = (percent: number) => (SCREEN_WIDTH * percent) / 100;
export const hp = (percent: number) => (SCREEN_HEIGHT * percent) / 100;

export const MIN_TOUCH_SIZE = rs(44);
