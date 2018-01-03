# Mongo Move [![CircleCI](https://img.shields.io/circleci/project/github/vladgolubev/mongo-move.svg)](https://circleci.com/gh/vladgolubev/mongo-move)

> Move documents between MongoDB collection. Applying async transforms, optionally.

## Install

```sh
$ yarn add mongo-move
```

## Usage

```js
import {MongoClient} from 'mongodb';
import {moveDocs} from 'mongo-move';

const db = await MongoClient.connect('mongo-url');

await moveDocs({
    fromCollection: db.collection('coll-a'),
    toCollection: db.collection('coll-b'),
    selector: {userId: 'some-user-id'},
    projection: {name: 0},
    transformerFn: async (doc) => {
        doc.movedAt = new Date();
        return doc;
    },
    chunkSize: 1000
});
```

## Run tests

```sh
$ npm t
```

## License

MIT © [Vlad Holubiev](https://vladholubiev.com)
