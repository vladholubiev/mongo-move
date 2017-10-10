FROM mongo:3.2

ADD "https://raw.githubusercontent.com/mongodb/docs-assets/primer-dataset/primer-dataset.json" primer-dataset.json

CMD mongoimport --host mongodb --db test --collection restaurants --drop --jsonArray --file ./primer-dataset.json
