# Build and deploy Oraichain cosmosjs to npm

## 1. Install dependencies

```node
yarn
```

## 2. Build javascript bundle

```node
yarn build
```

## 3. Copy typescript files into the bundle

```bash
cp -r src/messages/ dist/ && cp src/index.d.ts dist/ && rm dist/messages/proto.js
```

## 4. Login to npm

```node
npm login
```

## 5. Publish the bundle

```node
npm publish
```

## 6, Usage in other projects

```
yarn add @oraichain/cosmosjs
```