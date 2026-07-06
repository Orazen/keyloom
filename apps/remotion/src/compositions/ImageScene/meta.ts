import type { CompositionInfo } from "../../schema";
import type { ImageSceneProps } from "./ImageScene";

export const IMAGE_SCENE_DURATION = 180;
export const IMAGE_SCENE_FPS = 60;
export const IMAGE_SCENE_WIDTH = 1920;
export const IMAGE_SCENE_HEIGHT = 1080;

export const imageSceneDefaultProps: ImageSceneProps = {
  src: "backgrounds/beach.jpg",
  caption: "",
};

export const imageSceneInfo: CompositionInfo<ImageSceneProps> = {
  id: "ImageScene",
  category: "media",
  title: "Image Scene",
  description:
    "A full-bleed image that settles with a slow cinematic zoom, with an optional caption overlaid at the bottom.",
  durationInFrames: IMAGE_SCENE_DURATION,
  fps: IMAGE_SCENE_FPS,
  width: IMAGE_SCENE_WIDTH,
  height: IMAGE_SCENE_HEIGHT,
  defaultProps: imageSceneDefaultProps,
  fields: [
    { kind: "image", key: "src", label: "Image" },
    { kind: "text", key: "caption", label: "Caption (optional)" },
  ],
};
