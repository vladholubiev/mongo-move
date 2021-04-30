import {Db, MongoClient} from 'mongodb';
import moveDocs from './move-docs';

let db: Db;

beforeAll(async () => {
  db = (await MongoClient.connect(process.env.MONGO_URL as any)).db();

  const restaurants = db.collection('restaurants');

  await restaurants.insertMany([
    {cuisine: 'Chinese', name: 'May May Kitchen'},
    {cuisine: 'American', name: 'KFC'},
    {cuisine: 'Chinese', name: 'Ho Mei Restaurant'},
    {cuisine: 'Italian', name: 'Philadelhia Grille Express'},
  ]);
});

it('should move chinese restaurants to own collection', async () => {
  const restaurants = db.collection('restaurants');
  const restaurantsChinese = db.collection('restaurants_chinese');
  await restaurantsChinese.deleteOne({});

  const countBefore = await restaurants.find({}).count();

  expect(countBefore).toEqual(4);

  await moveDocs({
    fromCollection: restaurants,
    toCollection: restaurantsChinese,
    selector: {cuisine: 'Chinese'},
    transformerFn: async doc => {
      doc.movedAt = new Date();

      return doc;
    },
    chunkSize: 1000,
  });

  const countAfter = await restaurants.find({}).count();

  expect(countAfter).toEqual(2);

  const countMoved = await restaurantsChinese.find({}).count();

  expect(countMoved).toEqual(2);

  const countWithNewProp = await restaurantsChinese.find({movedAt: {$exists: true}}).count();

  expect(countWithNewProp).toEqual(2);
});
