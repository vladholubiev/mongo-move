# Mongo Move

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

It will spin up mongo container w/ mock data from [here](https://docs.mongodb.com/getting-started/shell/import-data/#overview)

~25000 restaurants

It will move ~2000 of them matching `{cuisine: 'Chinese'}` to collection `restaurants_chinese`

```sh
$ npm t
```