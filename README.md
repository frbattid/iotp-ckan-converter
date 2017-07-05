# iotp-ckan-converter
Tool for converting CKAN's DataStore-based data in CKAN's FileStore-based data.

Given a resource with an associated DataStore, three new resources are added, having each one an associated file in the FileStore. Those files are serializations of the data within the original DataStore, in these three formats:

* Json
* CSV
* XML

## Installation
iotp-ckan-converter is a Node.js application. Thus, [Node.js](https://nodejs.org/en/) must be installed.

Then, installing this application is as easy as running:

    $ npm install

That will download all dependencies under `node_modules/`.

## Configuration
Configuration is given as a Json file within `conf/` containing the following fields:

* <b>connection</b>:
** <b>endpoint</b>: http URL for CKAN API endpoint.
** <b>authentication</b>: API key for a CKAN's user.
* <b>data</b>:
** <b>package_id</b>: string-based name or CKAN's internal identifier where the resource to be converted lives.
** <b>resource_id</b>: CKAN's internal identifier (string-based names are not allowed bby CKAN's API) of the resource to be converted.
** <b>datastore_fields</b>: Fields or columns of the DataStore related to the resource to be converted.
** <b>max_records</b>: Maximum number of records to be converted (useful if CAKN's web server is configured for a maximum uploaded file size).

A configuration example could be:

```
{
  "connection": {
    "endpoint": "https://10.0.0.2:8080",
    "authentication": "abababab-1111-2b2b-ffff-abcdef012345"
  },
  "data": {
    "package_id": "demo_package",
    "resource_name": "demo_resource",
    "resource_id": "aa00bb11-aaaa-dddd-3a3a-ffffaaaa11110000",
    "datastore_fields": ["recvTime", "fiwareServicePath", "entityId", "entityType", "speed", "speed_md", "fuel", "fuel_md", "timestamp", "timestamp_md", "position", "position_md"],
    "max_records": 10000
  }
}
```

## Running
Run the following command:

    $ npm start

If the FileStore related resources do not exist in the given dataset, the three new resources are created and the three files are uploaded and associated to them.

Nevertheless, if the FileStore related resources already exist, then the associated files are updated (the resource remains the same).

