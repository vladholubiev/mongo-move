import {moveDocs} from '../lib';
import {MongoClient} from 'mongodb';

let db;

beforeAll(async() => {
  db = await MongoClient.connect('mongodb://localhost:37017/test');
});

it('should move chinese restaurants to own collection', async() => {
  const restaurants = db.collection('restaurants');
  const restaurantsChinese = db.collection('restaurants_chinese');

  const countBefore = await restaurants.find({}).count();
  console.log('countBefore', countBefore);

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
  console.log('countAfter', countAfter);

  const countMoved = await restaurantsChinese.find({}).count();
  console.log('countMoved', countMoved);
});
