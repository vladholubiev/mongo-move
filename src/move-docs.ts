import type {Collection, FilterQuery, UnorderedBulkOperation} from 'mongodb';

interface Params {
  fromCollection: Collection;
  toCollection: Collection;
  selector?: FilterQuery<any>;
  projection?: Partial<Record<keyof any, 1 | 0>>;
  transformerFn?: (doc: any) => any;
  chunkSize?: number;
}

/**
 * Move documents from one to another mongo collection
 * @param {Object} options Options to define the move
 * @param {Object} options.fromCollection source collection - MongoClient collection object
 * @param {Object} options.toCollection destination collection - MongoClient collection object
 * @param {Object} [options.selector={}] Query selector to filter documents to move
 * @param {Object} [options.projection={}] Query projection to move only specific fields
 * @param {Function} [options.transformerFn] Function to apply transformations over documents before moving
 * @param {Number} [options.chunkSize=1000] Bulk operation chunk size to split move
 */
export default async function ({
  fromCollection,
  toCollection,
  selector = {},
  projection = {},
  transformerFn,
  chunkSize = 1000,
}: Params): Promise<void> {
  if (!transformerFn) {
    transformerFn = (doc: any) => doc;
  }

  let fromCollectionBulk = fromCollection.initializeUnorderedBulkOp();
  let toCollectionBulk = toCollection.initializeUnorderedBulkOp();

  const readCursor = await fromCollection.find(selector).project(projection);
  let chunkProgress = 0;

  while (await readCursor.hasNext()) {
    const docToMove = await readCursor.next();
    chunkProgress++;

    const transformedDocToMove = await transformerFn(docToMove);

    toCollectionBulk.insert(transformedDocToMove);
    fromCollectionBulk.find({_id: docToMove._id}).removeOne();

    if (chunkProgress % chunkSize === 0) {
      await runBulk(fromCollectionBulk, toCollectionBulk);

      fromCollectionBulk = fromCollection.initializeUnorderedBulkOp();
      toCollectionBulk = toCollection.initializeUnorderedBulkOp();
    }
  }

  await runBulk(fromCollectionBulk, toCollectionBulk);
}

async function runBulk(
  fromCollectionBulk: UnorderedBulkOperation,
  toCollectionBulk: UnorderedBulkOperation
): Promise<void> {
  if (toCollectionBulk.length) {
    await toCollectionBulk.execute();
  }

  if (fromCollectionBulk.length) {
    await fromCollectionBulk.execute();
  }
}
