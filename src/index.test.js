import {moveDocs} from '.';
import {MongoClient} from 'mongodb';

let db;

beforeAll(async() => {
  db = await MongoClient.connect('mongodb://localhost:37017/test');
});

it('should move chinese restaurants to own collection', async() => {
  const restaurants = db.collection('restaurants');
  const restaurantsChinese = db.collection('restaurants_chinese');
  await restaurantsChinese.removeMany({});

  const countBefore = await restaurants.find({}).count();
  expect(countBefore).toEqual(25359);

  await moveDocs({
    fromCollection: restaurants,
    toCollection: restaurantsChinese,
    selector: {cuisine: 'Chinese'},
    transformerFn: async(doc) => {
      doc.movedAt = new Date();
      return doc;
    },
    chunkSize: 1000
  });

  const countAfter = await restaurants.find({}).count();
  expect(countAfter).toEqual(22941);

  const countMoved = await restaurantsChinese.find({}).count();
  expect(countMoved).toEqual(2418);

  const countWithNewProp = await restaurantsChinese.find({movedAt: {$exists: true}}).count();
  expect(countWithNewProp).toEqual(2418);
});
