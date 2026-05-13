import { describe, expect, it } from "vitest";
import { shouldStartPluginRuntime } from "../app.js";

describe("plugin runtime startup", () => {
  it("can disable background plugin runtime services for controlled starts", () => {
    expect(shouldStartPluginRuntime({ pluginRuntimeEnabled: false })).toBe(false);
  });

  it("keeps the plugin runtime enabled by default", () => {
    expect(shouldStartPluginRuntime({})).toBe(true);
  });
});
