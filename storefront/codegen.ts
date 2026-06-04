import type { CodegenConfig } from "@graphql-codegen/cli";

// GraphQL Codegen: generate TypeScript types from the live Magento schema.
// Setup:  npm i -D @graphql-codegen/cli @graphql-codegen/typescript
// Run:    NODE_EXTRA_CA_CERTS=./certs/magento-rootCA.pem npm run codegen
const config: CodegenConfig = {
  schema: process.env.MAGENTO_GRAPHQL_URL ?? "https://magento.test/graphql",
  generates: {
    "src/lib/gql-schema.generated.ts": {
      plugins: ["typescript"],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
