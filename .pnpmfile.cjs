// typescript-eslint imports the `typescript` package API. TypeScript 7.0 has no
// API yet, so those packages must resolve the TypeScript 6 compiler while the
// app keeps `typescript` 7.0.2 for `tsc` and Next.js.
const typescript6 = "npm:@typescript/typescript6@6.0.2";

function usesTypeScriptApi(name) {
  return name === "typescript-eslint" || name.startsWith("@typescript-eslint/");
}

function readPackage(pkg) {
  if (!usesTypeScriptApi(pkg.name)) {
    return pkg;
  }

  pkg.dependencies = pkg.dependencies ?? {};
  pkg.dependencies.typescript = typescript6;

  if (pkg.peerDependencies?.typescript) {
    delete pkg.peerDependencies.typescript;
    if (pkg.peerDependenciesMeta?.typescript) {
      delete pkg.peerDependenciesMeta.typescript;
    }
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
