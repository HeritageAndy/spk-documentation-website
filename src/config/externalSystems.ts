export type ExternalDisplayMode = "disabled" | "external-link" | "iframe";

export type ExternalSystem = {
  label: string;
  mode: ExternalDisplayMode;
  url: string;
  description: string;
  buttonLabel: string;
};

export const externalSystems = {
  cesiumStory: {
    label: "Cesium Story",
    mode: "external-link",
    url: "https://ion.cesium.com/stories/viewer/?id=da9cb7ff-4267-4b48-a9fc-c1c111f2674c",
    description: "Cesium Story for the Temple Zone of Sambor Prei Kuk.",
    buttonLabel: "Open Cesium Story"
  },
  interactiveMap: {
    label: "Interactive Map",
    mode: "iframe",
    url: "https://tsukuba-heritage.github.io/spk-webgis/#14/12.8720/105.0332",
    description: "Interactive QGIS web map developed by the project team.",
    buttonLabel: "Open Interactive Map"
  },
  monumentDatabase: {
    label: "Monument Database",
    mode: "disabled",
    url: "",
    description: "Content pending: Monument database will be connected here.",
    buttonLabel: "Open Monument Database"
  },
  movableObjectDatabase: {
    label: "Movable Object Database",
    mode: "disabled",
    url: "",
    description: "Content pending: Movable object database will be connected here.",
    buttonLabel: "Open Movable Object Database"
  },
  threeDModel: {
    label: "3D Model Platform",
    mode: "disabled",
    url: "",
    description: "Content pending: 3D model platform will be connected here.",
    buttonLabel: "Open 3D Model"
  }
} satisfies Record<string, ExternalSystem>;
