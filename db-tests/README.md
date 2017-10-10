## Run tests

It will spin up mongo container w/ mock data from [here](https://docs.mongodb.com/getting-started/shell/import-data/#overview)

~25000 restaurants

It will move ~2000 of them matching `{cuisine: 'Chinese'}` to collection `restaurants_chinese`

```sh
$ npm t
```
