import { defineConfig } from "astro/config";
import { viteStaticCopy } from "vite-plugin-static-copy";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGitHubPages = process.env.GITHUB_ACTIONS === "true" && repository;

export default defineConfig({
  site: process.env.GITHUB_REPOSITORY_OWNER
    ? `https://${process.env.GITHUB_REPOSITORY_OWNER}.github.io`
    : "http://localhost:4321",
  base: isGitHubPages ? `/${repository}` : "/",
  output: "static",
  vite: {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: "node_modules/cesium/Build/Cesium/Assets",
            dest: "cesium-static",
            rename: { stripBase: 4 }
          },
          {
            src: "node_modules/cesium/Build/Cesium/ThirdParty",
            dest: "cesium-static",
            rename: { stripBase: 4 }
          },
          {
            src: "node_modules/cesium/Build/Cesium/Widgets",
            dest: "cesium-static",
            rename: { stripBase: 4 }
          },
          {
            src: "node_modules/cesium/Build/Cesium/Workers",
            dest: "cesium-static",
            rename: { stripBase: 4 }
          }
        ]
      })
    ],
    css: {
      postcss: {
        plugins: []
      }
    }
  }
});
