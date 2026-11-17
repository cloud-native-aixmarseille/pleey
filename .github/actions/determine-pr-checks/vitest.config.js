export default {
  test: {
    include: ["*.spec.js"],
    coverage: {
      provider: "v8",
      include: ["ci-pr-routing.mjs"],
    },
  },
};
