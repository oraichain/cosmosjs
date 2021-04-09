# Build and deploy Oraichain cosmosjs to npm

## 1. Install dependencies

```node
yarn
```

## 2. Build javascript bundle

```node
sudo rm -rf $PWD/dist/ && yarn build
```

## 3. Copy typescript files into the bundle

```bash
cp -r $PWD/src/messages/ dist/ && cp $PWD/src/index.d.ts dist/ && rm $PWD/dist/messages/proto.js
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

```bash
yarn add @oraichain/cosmosjs
```