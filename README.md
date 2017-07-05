# iotp-ckan-converter
Tool for converting CKAN's DataStore-based data in CKAN's FileStore-based data.

Given a resource with an associated DataStore, three new resources are added, having each one an associated file in the FileStore. Those files are serializations of the data within the original DataStore, in the following three formats:

* Json
* CSV
* XML

## Installation
iotp-ckan-converter is a Node.js application. Thus, [Node.js](https://nodejs.org/en/) must be installed.

Start by cloning the project repository:

    $ git clone https://github.com/frbattid/iotp-ckan-converter.git

That must have created a `iotp-ckan-converter` folder; enter it:

    $ cd iotp-ckan-converter

Then, installing this application is as easy as running:

    $ npm install

That will download all dependencies under `node_modules/`.

## Configuration
Configuration is given as a Json file within `conf/` containing the following fields:

* <b>connection</b>:
    * <b>endpoint</b>: http URL for CKAN's API endpoint.
    * <b>authentication</b>: API key for a CKAN's user authorized to administrate CKAN.
* <b>data</b>:
    * <b>package_id</b>: string-based name or CKAN's internal identifier of the dataset (also known as package) where the resource to be converted lives in.
    * <b>resource_id</b>: CKAN's internal identifier (string-based names are not allowed bby CKAN's API) of the DataStore-based resource to be converted.
    * <b>datastore_fields</b>: Fields or columns of the DataStore related to the resource to be converted. This is required for the CVS conversion.
    * <b>max_records</b>: Maximum number of records to be converted (useful if CAKN's web server is configured for a maximum uploaded file size).

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

If the FileStore-based resources do not exist in the given dataset, then the three new resources are created and the three serialization files are uploaded and associated to them.

Nevertheless, if the FileStore-based resources already exist, then the associated files are updated (the FileStore-based resources remain the same).

In both cases, traces regarding the CKAN responses to API requests are printed in stdout.
