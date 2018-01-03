import MongodbMemoryServer from 'mongodb-memory-server';
import {MongoClient} from 'mongodb';
import {moveDocs} from '.';

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120 * 1000;

let db;
let mongoServer;

beforeAll(async () => {
  mongoServer = new MongodbMemoryServer();
  const mongoUri = await mongoServer.getConnectionString();
  db = await MongoClient.connect(mongoUri);

  const restaurants = db.collection('restaurants');

  await restaurants.insertMany([
    {cuisine: 'Chinese', name: 'May May Kitchen'},
    {cuisine: 'American', name: 'KFC'},
    {cuisine: 'Chinese', name: 'Ho Mei Restaurant'},
    {cuisine: 'Italian', name: 'Philadelhia Grille Express'}
  ]);
});

afterAll(() => {
  mongoServer.stop();
});

it('should move chinese restaurants to own collection', async () => {
  const restaurants = db.collection('restaurants');
  const restaurantsChinese = db.collection('restaurants_chinese');
  await restaurantsChinese.removeMany({});

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
    chunkSize: 1000
  });

  const countAfter = await restaurants.find({}).count();
  expect(countAfter).toEqual(2);

  const countMoved = await restaurantsChinese.find({}).count();
  expect(countMoved).toEqual(2);

  const countWithNewProp = await restaurantsChinese.find({movedAt: {$exists: true}}).count();
  expect(countWithNewProp).toEqual(2);
});
