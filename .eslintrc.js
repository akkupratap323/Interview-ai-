module.exports = {
  root: true,
  extends: ["next/core-web-vitals", "prettier"],
  rules: {
    curly: "off",
    "newline-before-return": "off",
    "no-restricted-exports": [
      "error",
      {
        restrictDefaultExports: {
          direct: false,
          named: true,
          defaultFrom: true,
          namedFrom: true,
          namespaceFrom: true,
        },
      },
    ],
    "react/jsx-sort-props": "off",
    "react/no-array-index-key": "warn",
    "react/no-danger": "warn",
    "react/self-closing-comp": "off",
    "react/function-component-definition": "off",
    "jsx-a11y/alt-text": "off",
    "react/no-unescaped-entities": "off",
    "import/no-extraneous-dependencies": [
      "error",
      {
        packageDir: __dirname,
      },
    ],
  },
};
