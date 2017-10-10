export default async function({fromCollection, toCollection, selector = {}, projection, transformerFn = (d) => d, chunkSize = 1000}) {
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
      await fromCollectionBulk.execute();
      await toCollectionBulk.execute();

      fromCollectionBulk = fromCollection.initializeUnorderedBulkOp();
      toCollectionBulk = toCollection.initializeUnorderedBulkOp();
    }
  }
}
